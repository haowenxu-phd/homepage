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

// --- Color maps (0..1 -> [r,g,b]) ---
const ColorMaps = {
  gray: (t) => {
    t = Math.max(0, Math.min(1, t));
    const g = Math.round(255 * t);
    return [g, g, g];
  },
  "blue-red": (t) => {
    t = Math.max(0, Math.min(1, t));
    const r = Math.round(255 * Math.min(1, Math.max(0, 2*(t-0.5))));
    const g = Math.round(255 * (1 - Math.abs(2*t - 1)));
    const b = Math.round(255 * Math.min(1, Math.max(0, 2*(0.5 - t))));
    return [r, g, b];
  },
  "magma-ish": (t) => {
    t = Math.max(0, Math.min(1, t));
    const r = Math.round(255 * Math.pow(t, 0.65));
    const g = Math.round(255 * Math.pow(t, 1.8) * 0.52);
    const b = Math.round(255 * Math.pow(1 - t, 2.0));
    return [r, g, b];
  },
};

// Percentile clip (to avoid a few outliers blowing out the stretch)
function computeMinMaxPercentiles(f32, nodata, pLow = 2, pHigh = 98) {
  const vals = [];
  const ND_THRESH = -2.1e9; // robust NoData guard for -2147483648
  for (let i = 0; i < f32.length; i++) {
    const v = f32[i];
    if (!Number.isFinite(v)) continue;
    if (nodata !== undefined && (v === nodata || v < ND_THRESH)) continue;
    vals.push(v);
  }
  if (!vals.length) return { min: 0, max: 1 };
  vals.sort((a, b) => a - b);
  const lo = vals[Math.floor((pLow/100)  * (vals.length-1))];
  const hi = vals[Math.ceil ((pHigh/100) * (vals.length-1))];
  if (!(isFinite(lo) && isFinite(hi)) || lo === hi) return { min: 0, max: 1 };
  return { min: lo, max: hi };
}

// Build a legend canvas (small horizontal bar)
function buildLegendDataURL(palette, w = 160, h = 10) {
  const cmap = ColorMaps[palette] || ColorMaps["blue-red"];
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(w, h);
  for (let x = 0; x < w; x++) {
    const t = x / (w - 1);
    const [r,g,b] = cmap(t);
    for (let y = 0; y < h; y++) {
      const p = (y*w + x) * 4;
      img.data[p+0] = r; img.data[p+1] = g; img.data[p+2] = b; img.data[p+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

/**
 * Renders SPARK "10-aster_output_web_mercator" as a canvas-based imageOverlay.
 * Expects Web Mercator (EPSG:3857) xMin/xMax/yMin/yMax in metres.
 */
function SparkRasterOverlay({ rasterMeta, palette = "magma-ish", opacity = 0.75 }) {
  const map = useMap();

  useEffect(() => {
    if (!rasterMeta || !rasterMeta.data) return;
    let overlay;

    try {
      const {
        xCells, yCells, xMin, yMin, xMax, yMax,
        noDataValue, encoding, zipped, data, dataByteOrder,
      } = rasterMeta;

      if (!(encoding === "b64" || encoding === "base64")) {
        console.error("Unsupported raster encoding:", encoding);
        return;
      }

      // Decode base64
      const bin = atob(data);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

      // Decompress if needed
      const raw = zipped ? pako.inflate(bytes) : bytes;

      // Interpret as float32 (Spark sends little-endian; browsers are LE too)
      // If you ever receive BE, you'd re-pack via DataView with littleEndian=false.
      const f32 = new Float32Array(raw.buffer);

      // Compute robust range with percentile clipping
      const { min, max } = computeMinMaxPercentiles(f32, noDataValue, 2, 98);

      // Draw to canvas with vertical flip (north up)
      const canvas = document.createElement("canvas");
      canvas.width = xCells;
      canvas.height = yCells;
      const ctx = canvas.getContext("2d");
      const img = ctx.createImageData(xCells, yCells);
      const out = img.data;
      const cmap = ColorMaps[palette] || ColorMaps["blue-red"];
      const ND_THRESH = -2.1e9;

      for (let y = 0; y < yCells; y++) {
        const srcY = yCells - 1 - y;         // vertical flip
        for (let x = 0; x < xCells; x++) {
          const srcIdx = srcY * xCells + x;  // read from flipped row
          const v = f32[srcIdx];
          const p = (y * xCells + x) * 4;

          if (!Number.isFinite(v) || v === noDataValue || v < ND_THRESH) {
            out[p+3] = 0; // transparent for NoData
            continue;
          }
          const t = (v - min) / (max - min);
          const [r, g, b] = cmap(Math.max(0, Math.min(1, t)));
          out[p+0] = r; out[p+1] = g; out[p+2] = b; out[p+3] = Math.round(opacity * 255);
        }
      }
      ctx.putImageData(img, 0, 0);

      // Project WebMercator bounds -> LatLng
      const sw = map.options.crs.unproject(L.point(xMin, yMin));
      const ne = map.options.crs.unproject(L.point(xMax, yMax));
      const bounds = L.latLngBounds(sw, ne);

      overlay = L.imageOverlay(canvas.toDataURL(), bounds, { opacity }).addTo(map);
      // Optional: fit to raster
      // map.fitBounds(bounds);
    } catch (err) {
      console.error("Failed to render SPARK raster overlay:", err);
    }

    return () => {
      if (overlay) map.removeLayer(overlay);
    };
  }, [map, rasterMeta, palette, opacity]);

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

  const [palette, setPalette] = useState("magma-ish");
  const [rasOpacity, setRasOpacity] = useState(0.75);
  const legendURL = buildLegendDataURL(palette);

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
      }

      const data = await res.json();
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
    }
  }

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
          {rasterMeta && (
            <SparkRasterOverlay
              rasterMeta={rasterMeta}
              palette={palette}
              opacity={rasOpacity}
            />
          )}

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

        

       
        
        <div className="absolute bottom-2 left-2 px-2 py-1 w-7/11 rounded bg-black/60 text-[10px] text-slate-100 space-x-2 flex items-center overlaytop">
          <span>🗺️ Simulation Map View</span>
          {rasterMeta && " — SPARK raster overlay active"}
          <select
            value={palette}
            onChange={(e) => setPalette(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px]"
          >
            <option value="magma-ish">magma-ish</option>
            <option value="blue-red">blue-red</option>
            <option value="gray">gray</option>
          </select>
          <label className="flex items-center gap-1">
            <span>opacity</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={rasOpacity}
              onChange={(e) => setRasOpacity(parseFloat(e.target.value))}
            />
          </label>
          <img src={legendURL} alt="legend" className="h-2 w-40 rounded border border-slate-700" />
        </div>
      </div>
      
      
    </div>
  );
}
