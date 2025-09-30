// js/obj_loader.js
// ESM-only, no globals. Imports wind helpers directly from your wind_map_vis file.

import vtkOBJReader from "vtk.js/Sources/IO/Misc/OBJReader";
import vtkMapper from "vtk.js/Sources/Rendering/Core/Mapper";
import vtkActor from "vtk.js/Sources/Rendering/Core/Actor";

// ⬇️ bring in your functions from wind_map_vis
import {
  addVoxelPlane,
  applyImageTextureToActorWithMapping,
} from "./wind_map_vis"; // adjust path if needed

export async function loadOBJ({
  renderer,
  renderWindow,
  objUrl,
  windUrl = null,
  voxelDims = [336, 368, 131],
  planeZ = 40,
  shiftMode = "x-only", // "x-only" (original) | "xyz"
} = {}) {
  if (!renderer || !renderWindow) {
    throw new Error("loadOBJ: renderer and renderWindow are required.");
  }
  if (!objUrl) {
    throw new Error("loadOBJ: objUrl is required.");
  }

  // Your palette mapping
  const PALETTE_DICT = {
    obj_2:   [0.1, 0.8, 0.1],
    obj_0:   [0.4, 0.4, 0.3],
    obj_111: [0.44, 0.31, 0.22],
    obj_14:  [0.44, 0.31, 0.22],
    // Trees
    obj_5:  [0.6, 0.75, 0.1],
    obj_7:  [0.2, 0.7, 0.15],
    obj_8:  [0.0, 0.5, 0.25],
    obj_6:  [0.0, 0.7, 0.5],
    obj_9:  [0.1, 0.55, 0.65],
    obj_10: [0.05, 0.8, 0.35],
    obj_11: [0.0, 0.8, 0.8],
    // Grassy ground
    obj_3:  [0.35, 0.55, 0.25],
    obj_4:  [0.4, 0.5, 0.3],
    // Wood house
    obj_15: [0.65, 0.45, 0.3],
  };

  // Read OBJ (split by object/group)
  const reader = vtkOBJReader.newInstance({ splitMode: "o" });
  await reader.setUrl(objUrl);

  // Optional cleanup if reloading
  renderer.getActors().forEach((a) => renderer.removeActor(a));

  // Compute global bounds to derive shift
  let xmin = Infinity, ymin = Infinity, zmin = Infinity;
  let xmax = -Infinity, ymax = -Infinity, zmax = -Infinity;

  const n = reader.getNumberOfOutputPorts();
  for (let i = 0; i < n; i++) {
    const poly = reader.getOutputData(i);
    const b = poly?.getBounds?.(); // [xmin,xmax,ymin,ymax,zmin,zmax]
    if (!b || !isFinite(b[0])) continue;
    xmin = Math.min(xmin, b[0]);
    xmax = Math.max(xmax, b[1]);
    ymin = Math.min(ymin, b[2]);
    ymax = Math.max(ymax, b[3]);
    zmin = Math.min(zmin, b[4]);
    zmax = Math.max(zmax, b[5]);
  }

  const shiftXYZ = [-xmin, -ymin, -zmin];
  const actors = [];

  // Add one actor per piece
  for (let i = 0; i < n; i++) {
    const poly = reader.getOutputData(i);
    if (!poly) continue;

    // Robust group name extraction
    const meta = poly.get?.("name");
    const objName = meta?.name || poly.getName?.() || `obj_${i}`;

    const mapper = vtkMapper.newInstance();
    mapper.setInputData(poly);
    mapper.setScalarVisibility(false);
    mapper.setColorByArrayName(null);
    mapper.setScalarModeToDefault();

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);

    // Remove any textures the OBJ may have brought
    actor.getTextures?.().forEach((t) => actor.removeTexture(t));

    const color = PALETTE_DICT[objName] || [0.8, 0.8, 0.8];
    actor.getProperty().setColor(...color);
    actor.getProperty().setLighting(true);
    actor.getProperty().setAmbient(0.15);
    actor.getProperty().setDiffuse(0.85);

    // Position shift: match your original (x-only), or full xyz if asked
    if (shiftMode === "x-only") {
      actor.setPosition(shiftXYZ[0], 0, 0);
    } else {
      actor.setPosition(...shiftXYZ);
    }

    renderer.addActor(actor);
    actors.push(actor);
  }

  // Optional wind/voxel plane with texture
  let planeActor = null;
  if (windUrl) {
    const [w, h] = voxelDims;
    planeActor = addVoxelPlane(renderer, renderWindow, voxelDims, planeZ);
    planeActor.getProperty().setEdgeVisibility(true);
    planeActor.getProperty().setEdgeColor(0.3, 0.3, 0.3);
    planeActor.getProperty().setLineWidth(2);

    applyImageTextureToActorWithMapping(
      planeActor,
      windUrl,
      renderer,
      renderWindow,
      { width: w, height: h, u0: 0, v0: 0, forceOpaque: true, flipY: false }
    );
  }

  renderer.resetCamera();
  renderWindow.render();

  return { actors, planeActor };
}
