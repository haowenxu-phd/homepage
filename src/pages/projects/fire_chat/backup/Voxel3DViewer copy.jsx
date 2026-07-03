import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";

import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";

 
 
 


// Your old helper functions should be converted into ES module exports
import { load_obj } from "../js/obj_loader";

import {
  addVoxelPlane,
  applyImageTextureToActorWithMapping,
} from "../js/wind_map_vis";

import { makeSafeVolumeUpdater } from "../js/volume_rendering";
import {
  snapView,
  getSceneCenterAndRadius,
} from "../js/scene_control";
import {
  upsertPairsInPlace,
} from "../js/user_control";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_AGENT_KEY || "dev-test";

export default function Voxel3DViewer({ gridId, onBack, sendChatMessage, windScenario, selectedVoxel, setSelectedVoxel, fireCsvText }) {
  const vtkContainerRef = useRef(null);
  const contextRef = useRef(null);
  const windPlaneRef = useRef(null);

  const [frames, setFrames] = useState({});
  const [timesteps, setTimesteps] = useState([]);
  const [currentTimestep, setCurrentTimestep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [projectionMode, setProjectionMode] = useState("Orthographic");

  const globalPairsRef = useRef([]);
  const previousFrameRef = useRef(0);
  const updateVolumeRef = useRef(null);
  const playTimerRef = useRef(null);

 
  const framesRef = useRef({}); 
  const prevFrameRef = useRef(0);
  const [fireTimesteps, setFireTimesteps] = useState([]);
  const [fireTimestepIndex, setFireTimestepIndex] = useState(0);
  const [isFirePlaying, setIsFirePlaying] = useState(false);

  //const [selectedVoxel, setSelectedVoxel] = useState(null);
 
  const [chatLoading, setChatLoading] = useState(false);

  const ignp = [
    "100_300_84",
    "100_164_31",
    "187_259_61",
    "205_284_37",
  ];

  const simScenarios3 = [
    "wd0.0_sp5.0_n5000_c10.0_gs120.0_sd6",
  ];

  const scenarioSelection = `${ignp[0]}/${simScenarios3[0]}`;
  const hb = "hb1600";

  const CSVUrl = `/outputs/scenarios/${scenarioSelection}/voxel_fire_spread_${hb}.csv`;

  const [pickMode, setPickMode] = useState(false);
  const pickModeRef = useRef(false);


  function handleVoxelPicked(pickInfo) {

    // Update the parent state
    setSelectedVoxel(pickInfo.voxel);

    const userIntent =
      `I selected location (${pickInfo.voxel.i}, ${pickInfo.voxel.j}, ${pickInfo.voxel.k}) ` +
      `as the fire ignition source in grid ${gridId}. ` +
      `What information do you need next to run the simulation?`;

    sendChatMessage?.(userIntent);
}

function applyFireFrame(t, frame) {
  if (!frame || !updateVolumeRef.current) return;

  const pairs = frame.map((item) => [
    "V_" + String(item.id).replace(/-/g, "_"),
    Number(item.state),
  ]);

  if (t > prevFrameRef.current) {
    prevFrameRef.current = t;
  } else {
    globalPairsRef.current = [];
    prevFrameRef.current = t;
  }

  globalPairsRef.current = upsertPairsInPlace(
    globalPairsRef.current,
    pairs
  );

  updateVolumeRef.current(globalPairsRef.current);
}


function upsertPairsInPlace(existingPairs, newPairs) {
  const map = new Map(existingPairs);

  for (const [id, state] of newPairs) {
    map.set(id, state);
  }

  return Array.from(map.entries());
}


useEffect(() => {
  const container = vtkContainerRef.current;
  if (!container) return;

  // vtk.js creates a canvas inside this container
  const canvas = container.querySelector("canvas");

  if (canvas) {
    canvas.style.cursor = pickMode ? "crosshair" : "grab";
  }
}, [pickMode]);


useEffect(() => {
  if (!isFirePlaying || fireTimesteps.length === 0) return;

  const timer = setInterval(() => {
    setFireTimestepIndex((idx) => {
      const nextIdx = idx + 1;

      if (nextIdx >= fireTimesteps.length) {
        setIsFirePlaying(false);
        return idx;
      }

      const t = fireTimesteps[nextIdx];
      applyFireFrame(t, framesRef.current[t]);

      return nextIdx;
    });
  }, 100);

  return () => clearInterval(timer);
}, [isFirePlaying, fireTimesteps]);


useEffect(() => {
  if (!fireCsvText) return;

  console.log("Parsing fireCsvText...");

  const result = Papa.parse(fireCsvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (result.errors?.length) {
    console.warn("CSV parse warnings:", result.errors);
  }

  const frameData = {};

  result.data.forEach((row) => {
    const t = row.timestep;
    const id = row.voxel_id;
    const state = row.new_state;

    if (t == null || id == null || state == null) return;

    if (!frameData[t]) frameData[t] = [];

    frameData[t].push({
      id,
      state,
    });
  });

  framesRef.current = frameData;
  globalPairsRef.current = [];
  prevFrameRef.current = 0;

  const timesteps = Object.keys(frameData)
    .map(Number)
    .sort((a, b) => a - b);

  setFireTimesteps(timesteps);
  setFireTimestepIndex(0);

  console.log("Fire frames loaded:", timesteps.length);

  if (timesteps.length > 0) {
    applyFireFrame(timesteps[0], frameData[timesteps[0]]);
  }
}, [fireCsvText]);




useEffect(() => {
  if (!windScenario) return;
  if (!contextRef.current) return;

  const { renderer, renderWindow } = contextRef.current;
  updateVolumeRef.current = makeSafeVolumeUpdater(renderer, renderWindow);

  const scenarioId = windScenario.scenarioId;
  const windGridId = windScenario.gridId || gridId;

  if (!scenarioId || !windGridId) return;

  let cancelled = false;
  let objectUrl = null;

  console.log("now loading wind map")

  async function loadWindPngTexture() {
    try {
      const url = `${API_BASE}/wind/${windGridId.toLowerCase()}/${scenarioId}/wind_field.png`;

      const res = await fetch(url, {
        headers: {
          "x-api-key": API_KEY,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to load wind PNG: ${res.status} ${text}`);
      }

      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);

      if (cancelled) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const dims =
        windScenario?.metadata?.grid_shape ||
        windScenario?.windResult?.metadata?.grid_shape ||
        [336, 368, 131];
        

      if (windPlaneRef.current) {
        renderer.removeActor(windPlaneRef.current);
        windPlaneRef.current.delete?.();
        windPlaneRef.current = null;
      }

      const planeActor = addVoxelPlane(
        renderer,
        renderWindow,
        dims,
        40
      );

      windPlaneRef.current = planeActor;

      applyImageTextureToActorWithMapping(
        planeActor,
        objectUrl,
        renderer,
        renderWindow,
        {
          width: dims[0],
          height: dims[1],
          u0: 0,
          v0: 0,
          forceOpaque: false,
          flipY: false,
        }
      );
    } catch (err) {
      console.error("Failed to load wind texture:", err);
    }
  }

  loadWindPngTexture();

  return () => {
    cancelled = true;

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, [windScenario, gridId]);

  useEffect(() => {
    if (!vtkContainerRef.current) return;
    if (!gridId) return;

    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      rootContainer: vtkContainerRef.current,
      containerStyle: {
        height: "100%",
        width: "100%",
        position: "relative",
      },
      background: [0.1, 0.1, 0.1],
    });

    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    contextRef.current = {
      fullScreenRenderer,
      renderer,
      renderWindow,
    };

    let cancelled = false;

    load_obj(
        renderer,
        renderWindow,
        gridId,
        () => pickModeRef.current,
        (pickInfo) => {
          if (cancelled) return;

          handleVoxelPicked(pickInfo);
        }
      )
      .then(() => {
        if (cancelled) return;
        renderWindow.render();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load voxel OBJ:", err);
      });

    return () => {
      cancelled = true;

      if (contextRef.current) {
        contextRef.current.fullScreenRenderer.delete();
        contextRef.current = null;
      }
    };
  }, [gridId]);



  function loadCSVasFrames(csvUrl) {
    return new Promise((resolve, reject) => {
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors?.length) {
            console.warn("CSV parse warnings:", results.errors);
          }

          const frameData = {};

          results.data.forEach((row) => {
            const t = row.timestep;
            const id = row.voxel_id;
            const state = row.new_state;

            if (t == null || id == null || state == null) return;

            if (!frameData[t]) frameData[t] = [];
            frameData[t].push({ id, state });
          });

          resolve(frameData);
        },
        error: reject,
      });
    });
  }

  function applyFrame(t, frameSource = frames) {
    const frame = frameSource[t];
    if (!frame || !updateVolumeRef.current) return;

    const pairs = frame.map((item) => [
      "V_" + String(item.id).replace(/-/g, "_"),
      item.state,
    ]);

    if (t > previousFrameRef.current) {
      previousFrameRef.current = t;
    } else {
      globalPairsRef.current = [];
      previousFrameRef.current = t;
    }

    globalPairsRef.current = upsertPairsInPlace(
      globalPairsRef.current,
      pairs
    );

    updateVolumeRef.current(globalPairsRef.current);
  }

  function handleTimeChange(e) {
    const t = Number(e.target.value);
    setCurrentTimestep(t);
    applyFrame(t);
  }

  function handleSnapView(axis, sign) {
    const ctx = contextRef.current;
    if (!ctx) return;

    snapView(
      axis,
      sign,
      true,
      ctx.renderer,
      ctx.renderWindow
    );
  }

  function toggleProjection() {
    const ctx = contextRef.current;
    if (!ctx) return;

    const { renderer, renderWindow } = ctx;
    const cam = renderer.getActiveCamera();

    const nowParallel = !cam.getParallelProjection();
    cam.setParallelProjection(nowParallel);

    setProjectionMode(nowParallel ? "Orthographic" : "Perspective");

    const { center } = getSceneCenterAndRadius(renderer);
    cam.setFocalPoint(...center);

    renderer.resetCameraClippingRange();
    renderWindow.render();
  }

  function togglePlay() {
    if (isPlaying) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    playTimerRef.current = setInterval(() => {
      setCurrentTimestep((prev) => {
        if (!timesteps.length) return prev;

        const currentIndex = timesteps.indexOf(prev);
        const nextIndex =
          currentIndex >= 0 && currentIndex < timesteps.length - 1
            ? currentIndex + 1
            : 0;

        const nextT = timesteps[nextIndex];
        applyFrame(nextT);

        return nextT;
      });
    }, 120);
  }

  const minT = timesteps.length ? timesteps[0] : 0;
  const maxT = timesteps.length ? timesteps[timesteps.length - 1] : 0;

  return (
    <div className="h-full w-full relative bg-black overflow-hidden">
      <div
        ref={vtkContainerRef}
        className="absolute inset-0"
      />

      <div className="absolute top-3 left-3 z-10 bg-black/70 text-white text-xs px-3 py-2 rounded max-h-[90%] overflow-y-auto">
        
        
        
        <div className="font-semibold mb-1">
          3D Fire Spread Simulator : {gridId}
          <label className="mt-2 flex items-center gap-2">
          <input
              type="checkbox"
              checked={pickMode}
              onChange={(e) => {
                const checked = e.target.checked;
                pickModeRef.current = checked;
                setPickMode(checked);
                console.log("pick mode changed:", checked);
              }}
            />
          Pick voxel
        </label>
          
        </div>
        

        <div className="mt-2">
          Views:
          <button className="ml-1 px-2 bg-slate-700 rounded" onClick={() => handleSnapView("x", +1)}>+X</button>
          <button className="ml-1 px-2 bg-slate-700 rounded" onClick={() => handleSnapView("x", -1)}>−X</button>
          <button className="ml-1 px-2 bg-slate-700 rounded" onClick={() => handleSnapView("y", +1)}>+Y</button>
          <button className="ml-1 px-2 bg-slate-700 rounded" onClick={() => handleSnapView("y", -1)}>−Y</button>
          <button className="ml-1 px-2 bg-slate-700 rounded" onClick={() => handleSnapView("z", +1)}>+Z</button>
          <button className="ml-1 px-2 bg-slate-700 rounded" onClick={() => handleSnapView("z", -1)}>−Z</button>
          <button className="ml-1 px-2 bg-slate-700 rounded" onClick={toggleProjection}>
            {projectionMode}
          </button>
        </div>

        <div className="mt-2">
          Time:
          <input
            className="ml-2 w-64"
            type="range"
            min={minT}
            max={maxT}
            value={currentTimestep}
            step="1"
            onChange={handleTimeChange}
          />
          <span className="ml-2">{currentTimestep}</span>

          <button
            className="ml-2 px-2 bg-slate-700 hover:bg-slate-600 rounded"
            onClick={togglePlay}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        

        <button
          className="mt-3 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded"
          onClick={onBack}
        >
          Back to Map
        </button>
      </div>
    </div>
  );
}