import React, { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";

import vtkFullScreenRenderWindow from "vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow";
import "vtk.js/Sources/Rendering/Profiles/Volume";
// ---- Import your helpers as ES modules (kept in their own files) ----
import { loadOBJ } from "./js/obj_loader"; // export { loadOBJ }
import { makeSafeVolumeUpdater } from "./js/volume_rendering"; // export { makeSafeVolumeUpdater }
import { connectFramesUI, upsertPairsInPlace } from "./js/user_control"; // export { connectFramesUI, upsertPairsInPlace }
import { snapView, getSceneCenterAndRadius } from "./js/scene_control"; // export { snapView, getSceneCenterAndRadius }

// ------------------------------------------------------------
// React version of your main HTML page (single file, no mixing)
// ------------------------------------------------------------
export default function MainViewer() {
  const mountRef = useRef(null);
  const vtkRef = useRef({ renderer: null, renderWindow: null, fsr: null });

  // UI state
  const [isParallel, setIsParallel] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentT, setCurrentT] = useState(0);
  const [tMax, setTMax] = useState(0);

  // --- Scenario constants (same as your HTML) ---
  const ignp2 = useMemo(() => [
    "236_116_30",
    "38_118_35",
    "73_164_138",
    "80_103_57",
    "60_327_41",
    "274_254_40",
    "298_240_33",
    "235_204_34",
    "54_344_37",
    "60_327_41",
  ], []);

  const simScenarios3 = useMemo(() => [
    "wd0.0_sp0.0_n50_c10.0_gs120.0_sd6",
    "wd0.0_sp5.0_n50_c10.0_gs120.0_sd6",
    "wd0.0_sp10.0_n50_c10.0_gs120.0_sd6",
    "wd0.0_sp15.0_n50_c10.0_gs120.0_sd6",
    "wd45.0_sp5.0_n50_c10.0_gs120.0_sd6",
    "wd45.0_sp10.0_n50_c10.0_gs120.0_sd6",
    "wd45.0_sp15.0_n50_c10.0_gs120.0_sd6",
    "wd45.0_sp20.0_n50_c10.0_gs120.0_sd6",
    "wd225.0_sp5.0_n50_c10.0_gs120.0_sd6",
    "wd135.0_sp5.0_n50_c10.0_gs120.0_sd6",
    "wd135.0_sp15.0_n50_c10.0_gs120.0_sd6",
    "wd90.0_sp15.0_n50_c10.0_gs120.0_sd6",
    "wd225.0_sp15.0_n50_c10.0_gs120.0_sd6",
    "wd135.0_sp5.0_n5000_c10.0_gs120.0_sd6",
    "wd225.0_sp5.0_n3000_c10.0_gs120.0_sd6",
  ], []);

  const scenarioSelection = useMemo(() => `${ignp2[0]}/${simScenarios3[14]}`,[ignp2, simScenarios3]);
  const hb = "hb1600";
  const CSVUrl = useMemo(() => `./outputs/scenarios/${scenarioSelection}/voxel_fire_spread_${hb}.csv`, [scenarioSelection]);
  const objUrl = "./obj/voxels_by_fuel_shell2_255088-0-1000_0-1000_0-1000_more_class.obj";
  // const WindUrl = `./outputs/scenarios/${scenarioSelection}/wind_field.png`;

  // Data/frames
  const framesRef = useRef({});
  const globalPairsRef = useRef([]);
  const prevTRef = useRef(0);
  const updateVolumeRef = useRef(null);

  // --- init vtk scene ---
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const fsr = vtkFullScreenRenderWindow.newInstance({
      rootContainer: container,
      containerStyle: { margin: 0, height: "100%", background: "#111", overflow: "hidden" },
      background: [0.1, 0.1, 0.1],
    });
    const renderer = fsr.getRenderer();
    const renderWindow = fsr.getRenderWindow();

    vtkRef.current = { renderer, renderWindow, fsr };

    // Load OBJ (colors/plane handled inside your obj loader)
    loadOBJ({ objUrl, renderer }).then(() => {
      renderer.resetCamera();
      renderWindow.render();
    });

    // Prepare volume updater
    updateVolumeRef.current = makeSafeVolumeUpdater(renderer, renderWindow);

    return () => {
      try { fsr.delete(); } catch {}
      vtkRef.current = { renderer: null, renderWindow: null, fsr: null };
    };
  }, []);

  // --- load CSV into frames ---
  useEffect(() => {
    let canceled = false;
    if (!CSVUrl) return;

    const loadCSVasFrames = (url) => new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (res) => {
          const frameData = {};
          for (const row of res.data) {
            const t = row.timestep;
            const id = row.voxel_id;
            const state = row.new_state;
            if (t == null || id == null || state == null) continue;
            (frameData[t] ||= []).push({ id, state });
          }
          resolve(frameData);
        },
        error: reject,
      });
    });

    (async () => {
      const frames = await loadCSVasFrames(CSVUrl);
      if (canceled) return;
      framesRef.current = frames;

      const keys = Object.keys(frames).map(Number).sort((a, b) => a - b);
      const maxT = keys.length ? keys[keys.length - 1] : 0;
      setTMax(maxT);
      setCurrentT(keys[0] ?? 0);

      // fire initial frame like the old connectFramesUI
      connectFramesUI(frames, (t /* number */) => {
        drawFrame(t);
      });

      
    })();

    return () => { canceled = true; };
  }, [CSVUrl]);

  // --- draw a frame ---
  const drawFrame = (t) => {
    const { renderer, renderWindow } = vtkRef.current;
    if (!renderer || !renderWindow) return;

    const frame = framesRef.current[t] || [];
    const ids = frame.map((item) => [item.id, item.state]);
    const pairs = ids.map((s) => ["V_" + String(s[0]).replace(/-/g, "_"), s[1]]);

    if (t < prevTRef.current) {
      globalPairsRef.current = []; // reset if time goes backwards
    }
    prevTRef.current = t;

    globalPairsRef.current = upsertPairsInPlace(globalPairsRef.current, pairs);
    updateVolumeRef.current?.(globalPairsRef.current);
    renderWindow.render();
  };

  // --- play/pause loop ---
  useEffect(() => {
    if (!isPlaying) return;
    let rafId; let last = performance.now();
    const tick = (now) => {
      if (now - last > 66) { // ~15 FPS
        setCurrentT((t) => (t >= tMax ? 0 : t + 1));
        last = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, tMax]);

  // redraw when time changes
  useEffect(() => {
    drawFrame(currentT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentT]);

  // --- HUD handlers ---
  const handleSnap = (axis, dir) => {
    const { renderer, renderWindow } = vtkRef.current;
    if (!renderer || !renderWindow) return;
    snapView(renderer, renderWindow, axis, dir, true);
  };

  const toggleProjection = () => {
    const { renderer, renderWindow } = vtkRef.current;
    if (!renderer || !renderWindow) return;
    const cam = renderer.getActiveCamera();
    const next = !cam.getParallelProjection();
    cam.setParallelProjection(next);
    setIsParallel(next);
    const { center } = getSceneCenterAndRadius(renderer);
    cam.setFocalPoint(...center);
    renderer.resetCameraClippingRange();
    renderWindow.render();
  };

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#111", overflow: "hidden" }}>
      {/* VTK mount */}
      <div ref={mountRef} style={{ height: "100%", width: "100%" }} />

      {/* HUD */}
      <div
        style={{
          position: "fixed",
          left: 10,
          top: 10,
          background: "rgba(0,0,0,0.6)",
          color: "#eee",
          font: "14px/1.4 system-ui",
          padding: "8px 12px",
          borderRadius: 8,
          maxHeight: "90%",
          overflowY: "auto",
        }}
      >
        {/* Views */}
        <div style={{ margin: "6px 0" }}>
          <div style={{ marginBottom: 6 }}>Views:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => handleSnap("x", +1)}>+X</button>
            <button onClick={() => handleSnap("x", -1)}>−X</button>
            <button onClick={() => handleSnap("y", +1)}>+Y</button>
            <button onClick={() => handleSnap("y", -1)}>−Y</button>
            <button onClick={() => handleSnap("z", +1)}>+Z</button>
            <button onClick={() => handleSnap("z", -1)}>−Z</button>
            <button onClick={toggleProjection}>{isParallel ? "Orthographic" : "Perspective"}</button>
          </div>
        </div>

        {/* Time */}
        <div style={{ margin: "6px 0" }}>
          <div style={{ marginBottom: 6 }}>Time:</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="range"
              min={0}
              max={tMax}
              step={1}
              value={currentT}
              onChange={(e) => setCurrentT(Number(e.target.value))}
              style={{ width: 280 }}
            />
            <span>{currentT}</span>
            <button onClick={() => setIsPlaying((p) => !p)}>{isPlaying ? "⏸" : "▶"}</button>
          </div>
        </div>

        {/* (Optional) Future selects: ignition, wind dir/speed */}
      </div>
    </div>
  );
}
