import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap, 
  GeoJSON,

} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import pako from "pako";

import Voxel3DViewer from "./Voxel3DViewer";

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

  const [voxelCoverage, setVoxelCoverage] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedVoxelGridId, setSelectedVoxelGridId] = useState(null);

  const [viewMode, setViewMode] = useState("map"); // "map" | "voxel"
  const [activeVoxelGridId, setActiveVoxelGridId] = useState("Liverpool_Downtown");
  const [activeWindScenario, setActiveWindScenario] = useState(null);
  const [selectedVoxel, setSelectedVoxel] = useState(null);
  const [fireCsvText, setFireCsvText] = useState(null);

  function launchVoxelViewer(gridId) {
        console.log("Launching voxel viewer:", gridId);
        setActiveVoxelGridId(gridId);
        setSelectedVoxelGridId(null);
        setViewMode("voxel");

  // Later:
  // setShowVoxelViewer(true);
  // navigate(`/voxel/${gridId}`);
  // or fetch metadata...
}


  async function sendChatMessage(text) {
  const cleanText = text.trim();
  if (!cleanText || loading) return;

  setMessages((prev) => [...prev, { role: "user", content: cleanText }]);
  setInput("");
  setError(null);
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        user_intent: cleanText,
        grid_id: activeVoxelGridId,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body}`);
    }

    const data = await res.json();
    console.log("API response:", data);

    if (data.tool === "wind-lamb-oseen-vortex") {
            console.log("Debug S1");

            const windScenario = {
              gridId: data.grid_id,
              scenarioId: data.scenario_id,
              wind: data.wind,
              metadata: data.wind_result?.metadata,
              pngUrl: `${API_BASE}${data.wind_png_url}`,
            };

            console.log("Debug S2");

            setActiveWindScenario(windScenario);
            setActiveVoxelGridId(data.grid_id);

            console.log("Now We run the fire simulation");

            const fireInput = {
              grid_id: data.grid_id,
              ignition_voxel: selectedVoxel, //{ i: 120, j: 80, k: 12 },               
              wind_scenario_id: data.scenario_id,
              heat_boost: 2200,
              n_steps: 2000,
              dt: 1.0,
            };

            console.log("Input:", fireInput);
            console.log("selected voxel", selectedVoxel)
            
            const fireRes = await fetch(`${API_BASE}/fire/scenario`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
              },
              body: JSON.stringify(fireInput),
            });
           
              /*
            const fireData = {
                "status": "ok",
                "scenario_id": "ign_168_185_32__wind_north_5p0_lamb_oseen_vortex__hb2200__n2000",
                "grid_id": "Liverpool_Downtown",
                "ignition_voxel": [
                    [
                        168,
                        185,
                        32
                    ]
                ],
                "wind_scenario_id": "north_5p0_lamb_oseen_vortex",
                "scenario_dir": "C:\\Users\\z3548577\\OneDrive - UNSW\\Documents\\code\\prototyping\\52_conversational_ai\\backend\\app\\data\\fire\\liverpool_downtown\\168_185_32\\ign_168_185_32__wind_north_5p0_lamb_oseen_vortex__hb2200__n2000",
                "path": "C:\\Users\\z3548577\\OneDrive - UNSW\\Documents\\code\\prototyping\\52_conversational_ai\\backend\\app\\data\\fire\\liverpool_downtown\\168_185_32\\ign_168_185_32__wind_north_5p0_lamb_oseen_vortex__hb2200__n2000",
                "fire_csv_url": "/fire/liverpool_downtown/168_185_32/ign_168_185_32__wind_north_5p0_lamb_oseen_vortex__hb2200__n2000/csv"
            };
            */


            const fireData = await fireRes.json();
            console.log("Fire response:", fireData);

 

       
            const csvUrl = `${API_BASE}${fireData.fire_csv_url}`;
            const csvRes = await fetch(csvUrl, {
              headers: {
                "x-api-key": API_KEY,
              },
            });
            const csvText = await csvRes.text();
            setFireCsvText(csvText);
            //console.log("Fire CSV:", csvText);


          } //end of wind voxel

    if (data.tool === "SPARK") {
      const raster = data?.sim_output?.["10-aster_output_web_mercator"];
      if (raster) setRasterMeta(raster);

      const ignLat = data?.coordinate?.ignition_lat;
      const ignLon = data?.coordinate?.ignition_lon;

      if (typeof ignLat === "number" && typeof ignLon === "number") {
        setMapCenter([ignLat, ignLon]);
        setMarkerPos([ignLat, ignLon]);
      }
    }

    if (data.tool === "Voxel_Sim") {
      setRasterMeta(null);
      setVoxelCoverage(null);
      setSelectedTool("Voxel_Sim");

      const ignLat = data?.coordinate?.ignition_lat;
      const ignLon = data?.coordinate?.ignition_lon;

      if (typeof ignLat === "number" && typeof ignLon === "number") {
        setMapCenter([ignLat, ignLon]);
        setMarkerPos([ignLat, ignLon]);

        const catalogRes = await fetch(`${API_BASE}/voxel/catalog`, {
          headers: {
            "x-api-key": API_KEY,
          },
        });

        const geojson = await catalogRes.json();
        setVoxelCoverage(geojson);
      }
    }

    console.log("psd?")

    const reply =
      data.message ??
      data.msg ??
      JSON.stringify(data, null, 2);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: reply },
    ]);

    return data;

  } catch (err) {
    console.error(err);
    setError(err.message || "Request failed");

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "⚠️ Failed to contact backend." + err.message ,
      },
    ]);
  } finally {
    setLoading(false);
  }
} //end of sendChatMessage

  async function send() {
    await sendChatMessage(input);
  }

  /*
  async function send2() {
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
      if (data["tool"] === "Voxel_Sim") {
            console.log("here we need to generate the 3d interface 2");

            // clear old 2D/3D outputs
            setRasterMeta(null);
            setVoxelCoverage(null);
            setSelectedTool("Voxel_Sim");

            const ignLat = data?.coordinate?.ignition_lat;
            const ignLon = data?.coordinate?.ignition_lon;

            if (typeof ignLat === "number" && typeof ignLon === "number") {
              setMapCenter([ignLat, ignLon]);
              setMarkerPos([ignLat, ignLon]);

              const catalogRes = await fetch(`${API_BASE}/voxel/catalog`, {
                      headers: { 
                        "x-api-key": API_KEY,
                      },
                    });

                    const geojson = await catalogRes.json();
                    setVoxelCoverage(geojson);
            } // this is number
          }//end of voxel sim
            
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
   */

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    
    <div className="flex w-full h-full bg-[#020817] text-slate-50">
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
      <div className="flex-1 h-full relative"  style={{ overflow: "hidden" }}>

      {viewMode === "map" && (
          <>
        
                      {selectedVoxelGridId && (
                            <div
                              className="
                                absolute
                                top-1/2 left-1/2
                                -translate-x-1/2 -translate-y-1/2
                                z-[1000]

                                bg-black/80
                                text-white
                                rounded-lg
                                shadow-xl

                                p-5
                                min-w-[320px]
                                border border-gray-600
                              "
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-base">
                                  Continue to 3D Fire Spread Simulation
                                </h3>

                                
                              </div>

                              {/* Content */}
                              <p className="text-sm mb-4">
                                <strong>Voxel City Model:</strong>
                                <br />
                                {selectedVoxelGridId}
                              </p>

                              {/* Action */}
                              <button
                                className="
                                  w-full
                                  px-4 py-2
                                  rounded
                                  bg-blue-600
                                  hover:bg-blue-700
                                  transition
                                "
                                onClick={() => launchVoxelViewer(selectedVoxelGridId)}
                              >
                                Launch
                              </button>
                              <button
                                  className="w-full
                                  px-4 py-2
                                  rounded 
                                  text-gray-300 hover:text-white text-lg font-bold"
                                  onClick={() => setSelectedVoxelGridId(null)}
                                >
                                  Close
                                </button>
                            </div>
                          )}


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


                        {voxelCoverage && (
                              <GeoJSON
                                data={voxelCoverage}
                                style={() => ({
                                  color: "#38bdf8",
                                  weight: 2,
                                  fillColor: "#0ea5e9",
                                  fillOpacity: 0.25,
                                })}
                                onEachFeature={(feature, layer) => {
                                  const gridId = feature?.properties?.grid_id;

                                  /*layer.bindPopup(`
                                    <b>Voxel Grid</b><br/>
                                    grid_id: ${gridId}<br/>
                                    EPSG: ${feature?.properties?.src_epsg}
                                  `);*/

                                  layer.on("click", () => {
                                    console.log("Clicked voxel grid:", gridId);
                                    console.log("Full feature:", feature);

                                    setSelectedVoxelGridId(gridId);

                                    // later: open your vtk.js modal/interface here
                                    // setShowVoxelViewer(true);
                                  });
                                }}
                              />
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
        
              </>
        )}

        {viewMode === "voxel" && (
          
            <Voxel3DViewer
                gridId={activeVoxelGridId}
                onBack={() => setViewMode("map")}
                sendChatMessage={sendChatMessage}
                windScenario={activeWindScenario}
                selectedVoxel={selectedVoxel}
                setSelectedVoxel={setSelectedVoxel}
                fireCsvText={fireCsvText}
            />
          
            
        )}

        {
            /*  {viewMode === "voxel" && (
              <VoxelViewer
                gridId={activeVoxelGridId}
                onBack={() => setViewMode("map")}
              />
            )}*/
        }

      </div>
      
      
    </div>
  );
}
