import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import pako from "pako";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_AGENT_KEY || "dev-test";

// Fix Leaflet default marker in bundlers
const defaultIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

/**
 * Renders SPARK "10-aster_output_web_mercator" as a canvas-based imageOverlay.
 * Expects Web Mercator (EPSG:3857) xMin/xMax/yMin/yMax in metres.
 */
function SparkRasterOverlay({ rasterMeta }) {
  const map = useMap();

  useEffect(() => {
    if (!rasterMeta || !rasterMeta.data) return;

    let overlay;

    try {
      const {
        xCells,
        yCells,
        xMin,
        yMin,
        xMax,
        yMax,
        noDataValue,
        encoding,
        zipped,
        data,
      } = rasterMeta;

      // 1) Decode base64
      if (!(encoding === "b64" || encoding === "base64")) {
        console.error("Unsupported raster encoding:", encoding);
        return;
      }

      const binaryString = atob(data);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }

      // 2) Decompress if needed
      const rawBuffer = zipped
        ? pako.inflate(byteArray).buffer
        : byteArray.buffer;

      // 3) Interpret as Float32 raster
      const raster = new Float32Array(rawBuffer);
      const expected = xCells * yCells;
      if (raster.length !== expected) {
        console.warn(
          "Raster length mismatch:",
          raster.length,
          "vs expected",
          expected
        );
      }

      // 4) Value range (ignore NoData)
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < raster.length; i++) {
        const v = raster[i];
        if (
          v !== noDataValue &&
          !Number.isNaN(v) &&
          v !== Infinity &&
          v !== -Infinity
        ) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      if (!isFinite(min) || !isFinite(max) || min === max) {
        console.warn("Invalid/flat raster range", { min, max });
        return;
      }

      // 5) Draw to canvas (x = col, y = row)
      const canvas = document.createElement("canvas");
      canvas.width = xCells;
      canvas.height = yCells;
      const ctx = canvas.getContext("2d");
      const img = ctx.createImageData(xCells, yCells);

      for (let y = 0; y < yCells; y++) {
        for (let x = 0; x < xCells; x++) {
          const idx = y * xCells + x;
          const v = raster[idx];
          const p = idx * 4;

          if (
            v === noDataValue ||
            Number.isNaN(v) ||
            v === Infinity ||
            v === -Infinity
          ) {
            img.data[p + 3] = 0; // transparent
            continue;
          }

          const t = (v - min) / (max - min); // 0..1

          // Simple fire-style ramp: dark -> red -> yellow
          const r = 255 * t;
          const g = 200 * t;
          const b = 40 * t;

          img.data[p + 0] = Math.max(0, Math.min(255, r));
          img.data[p + 1] = Math.max(0, Math.min(255, g));
          img.data[p + 2] = Math.max(0, Math.min(255, b));
          img.data[p + 3] = 180; // alpha
        }
      }

      ctx.putImageData(img, 0, 0);

      // 6) Compute bounds in LatLng from EPSG:3857 metres
      const sw = map.options.crs.unproject(L.point(xMin, yMin));
      const ne = map.options.crs.unproject(L.point(xMax, yMax));
      const bounds = L.latLngBounds(sw, ne);

      // 7) Add overlay
      overlay = L.imageOverlay(canvas.toDataURL(), bounds, {
        opacity: 0.7,
      }).addTo(map);

      // Optionally fit map to raster
      // map.fitBounds(bounds);
    } catch (err) {
      console.error("Failed to render SPARK raster overlay:", err);
    }

    return () => {
      if (overlay) {
        map.removeLayer(overlay);
      }
    };
  }, [map, rasterMeta]);

  return null;
}

export default function FireAgentChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mapCenter, setMapCenter] = useState([-33.86, 151.21]);
  const [markerPos, setMarkerPos] = useState([-33.86, 151.21]);
  const [rasterMeta, setRasterMeta] = useState(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setError(null);
    setLoading(true);

    // Update center if user types a "lat,lon"
    const coordMatch = text.match(
      /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/
    );
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lon)) {
        setMapCenter([lat, lon]);
        setMarkerPos([lat, lon]);
      }
    }

    try {

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ user_intent: text }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body}`);
        console.log("result is not okay at 215")
      }

      const data = await res.json();
      

      if (data["tool"]=="SPARK"){
      console.log("API response:", data);
      console.log("Sim Output:", data["sim_output"]["10-aster_output_web_mercator"]);

              // Show full JSON in chat for debugging / transparency
                    const pretty =
                      typeof data["msg"] === "string"
                        ? data["msg"]
                        : JSON.stringify(data["msg"], null, 2);
                    setMessages((prev) => [
                      ...prev,
                      { role: "assistant", content: pretty },
                    ]);

                    // Pull SPARK raster if present
                    const raster =
                      data?.sim_output?.["10-aster_output_web_mercator"];
                    console.log(raster)
                    if (raster) {
                      setRasterMeta(raster);
                    }

                    // If backend returns ignition coordinate, sync marker & center
                    const ignLat = data?.coordinate?.ignition_lat;
                    const ignLon = data?.coordinate?.ignition_lon;
                    if (
                      typeof ignLat === "number" &&
                      typeof ignLon === "number"
                    ) {
                      setMapCenter([ignLat, ignLon]);
                      setMarkerPos([ignLat, ignLon]);
                    }
      } //this is the 2d spark simulation handling

      console.log(data["tool"])
      if (data["tool"]=="Voxel_Sim"){
          console.log("here we need to generate the 3d intreface")

      }
      

      
    } catch (err) {
      console.error(err);
      setError(err.message || "Request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Failed to run simulation. Check backend logs or network.",
        },
      ]);
    } finally {
      setLoading(false);
    } //end of the call and try

  } //end of send

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex w-13/16 h-15/16 bg-[#020817] text-slate-50 maxw"> 
      {/* Left: Chat panel (1/3) */}
      <div className="flex flex-col w-1/3 h-full border-r border-slate-800 maxw2">
        {/* Header */}
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="text-sm font-semibold">🔥 Fire-Agent Chat</div>
          <div className="text-[10px] text-slate-400">
            Describe a scenario. The backend will route to SPARK or your voxel
            simulator.
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-xs">
          {messages.length === 0 && (
            <div className="text-[10px] text-slate-500">
              Example:
              <br />
              <code className="break-words">
                simulate a 3D voxel wildfire for 300 steps near -33.86,151.21
                with SW wind 10 m/s and URBAN_WUI
              </code>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap px-2 py-1.5 rounded-lg border ${
                m.role === "user"
                  ? "bg-slate-800 border-slate-700 text-sky-200"
                  : "bg-slate-900 border-slate-800 text-emerald-300"
              }`}
            >
              <div className="text-[9px] font-semibold uppercase mb-0.5 opacity-70">
                {m.role === "user" ? "You" : "Agent"}
              </div>
              {m.content}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 pb-1 text-[9px] text-red-400">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="p-2 border-t border-slate-800">
          <div className="flex gap-2 items-end">
            <textarea
              rows={3}
              className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-50 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Describe your fire simulation (Shift+Enter for newline, Enter to send)…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-3 py-2 text-xs rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Running…" : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Map panel (2/3) */}
      <div className="flex-1 h-full relative">
        <MapContainer
          center={mapCenter}
          zoom={8}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Raster overlay from SPARK */}
          {rasterMeta && <SparkRasterOverlay rasterMeta={rasterMeta} />}

          {/* Ignition marker */}
          {markerPos && (
            <Marker position={markerPos}>
              <Popup>
                Ignition / focus location
                <br />
                {markerPos[0].toFixed(4)}, {markerPos[1].toFixed(4)}
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/50 text-[10px] text-slate-100">
          🗺️ Simulation Map View
          {rasterMeta && " — SPARK raster overlay active"}
        </div>
      </div>
    </div>
  );
}
