import vtkOBJReader from "@kitware/vtk.js/IO/Misc/OBJReader";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkCellPicker from "@kitware/vtk.js/Rendering/Core/CellPicker";
import vtkSphereSource from "@kitware/vtk.js/Filters/Sources/SphereSource";

const API_BASE = "http://localhost:8000";
const API_KEY = import.meta.env.VITE_FIRE_AGENT_API_KEY;

export async function load_obj(renderer, renderWindow, gridId, isPickEnabled, onPick) {
  const reader = vtkOBJReader.newInstance({ splitMode: "o" });
  const API_KEY = import.meta.env.VITE_AGENT_KEY || "dev-test";
  const PALETTE_dict = {
    obj_2: [0.1, 0.8, 0.1],
    obj_0: [0.4, 0.4, 0.3],
    obj_111: [0.44, 0.31, 0.22],
    obj_14: [0.44, 0.31, 0.22],

    obj_5: [0.6, 0.75, 0.1],
    obj_7: [0.2, 0.7, 0.15],
    obj_8: [0.0, 0.5, 0.25],
    obj_6: [0.0, 0.7, 0.5],
    obj_9: [0.1, 0.55, 0.65],
    obj_10: [0.05, 0.8, 0.35],
    obj_11: [0.0, 0.8, 0.8],

    obj_3: [0.35, 0.55, 0.25],
    obj_4: [0.4, 0.5, 0.3],

    obj_15: [0.65, 0.45, 0.3],
  };

  const objUrl = `${API_BASE}/voxel/${gridId}/obj`;

  const response = await fetch(objUrl, {
    headers: {
      "x-api-key": API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load OBJ: ${response.status} ${errorText}`);
  }

  const text = await response.text();

  reader.parseAsText(text);

  console.log("OBJ loaded:", gridId);

  renderer.getActors().forEach((a) => renderer.removeActor(a));

  let xmin = Infinity;
  let ymin = Infinity;
  let zmin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;
  let zmax = -Infinity;

  const n = reader.getNumberOfOutputPorts();

  for (let i = 0; i < n; i++) {
    const b = reader.getOutputData(i).getBounds();

    if (!b || !Number.isFinite(b[0])) continue;

    xmin = Math.min(xmin, b[0]);
    ymin = Math.min(ymin, b[2]);
    zmin = Math.min(zmin, b[4]);

    xmax = Math.max(xmax, b[1]);
    ymax = Math.max(ymax, b[3]);
    zmax = Math.max(zmax, b[5]);
  }

  const shift = [-xmin, -ymin, -zmin];

  console.log("OBJ bounds:", [xmin, xmax, ymin, ymax, zmin, zmax]);
  console.log("shift:", shift);

  for (let i = 0; i < n; i++) {
    const poly = reader.getOutputData(i);

    const objMeta =
      typeof poly.getName === "function"
        ? poly.getName()
        : poly.get("name");

    const objName =
      typeof objMeta === "string" ? objMeta : objMeta?.name;

    const mapper = vtkMapper.newInstance();
    mapper.setInputData(poly);

    mapper.setScalarVisibility(false);
    mapper.setColorByArrayName(null);
    mapper.setScalarModeToDefault();

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);

    actor.getTextures?.().forEach((t) => actor.removeTexture(t));

    const color = PALETTE_dict[objName] || [0.8, 0.8, 0.8];

    actor.getProperty().setColor(...color);
    actor.getProperty().setLighting(true);
    actor.getProperty().setAmbient(0.15);
    actor.getProperty().setDiffuse(0.85);

    actor.setPosition(shift[0], 0, 0);

    renderer.addActor(actor);
  }

  installObjPicker(renderer, renderWindow, shift, isPickEnabled, onPick);

  try {
    renderer.resetCamera();
    renderer.resetCameraClippingRange();
    renderWindow.render();
  } catch (err) {
    console.warn("Render skipped because vtk window was not ready/alive:", err);
  }
}


function installObjPicker(renderer, renderWindow, shift, isPickEnabled, onPick) {
  const picker = vtkCellPicker.newInstance();
  picker.setTolerance(0.0005);

  const interactor = renderWindow.getInteractor();

  const subscription = interactor.onLeftButtonPress((callData) => {
    console.log("vtk click detected, pick enabled:", isPickEnabled?.());

    if (!isPickEnabled?.()) return;

    const pos = callData.position;

    picker.pick([pos.x, pos.y, 0], renderer);

    const pickedActors = picker.getActors();

    if (!pickedActors || pickedActors.length === 0) {
      console.log("No actor picked");
      return;
    }

    const world = picker.getPickPosition();
    addPickMarker(renderer, renderWindow, world);
    const cellId = picker.getCellId();
    const actor = pickedActors[0];

    const originalX = world[0] - shift[0];
    const originalY = world[1] - shift[1];
    const originalZ = world[2];

    const voxel = {
      i: Math.floor(originalX),
      j: Math.floor(originalY),
      k: Math.floor(originalZ),
    };

    const info = {
      world,
      original: [originalX, originalY, originalZ],
      voxel,
      voxelId: `V_${voxel.i}_${voxel.j}_${voxel.k}`,
      cellId,
      actor,
    };

    //console.log("Picked voxel:", info);
    onPick?.(info);
  });

  return subscription;
}


// This is the marker function
let pickMarkerActor = null;
function addPickMarker(renderer, renderWindow, world) {
  if (pickMarkerActor) {
    renderer.removeActor(pickMarkerActor);
    pickMarkerActor.delete?.();
    pickMarkerActor = null;
  }

  const sphere = vtkSphereSource.newInstance({
    radius: 1,
    thetaResolution: 24,
    phiResolution: 24,
  });

  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(sphere.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  actor.setPosition(world[0], world[1], world[2]);

  actor.getProperty().setColor(1, 0, 0);
  actor.getProperty().setAmbient(0.4);
  actor.getProperty().setDiffuse(0.8);

  renderer.addActor(actor);
  pickMarkerActor = actor;

  renderWindow.render();
}