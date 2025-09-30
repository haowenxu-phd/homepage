// js/volume_rendering.js
// ESM port of makeSafeVolumeUpdater (no DOM access, no mixing).
// Usage:
//   import { makeSafeVolumeUpdater } from "./js/volume_rendering";
//   const updateVolume = makeSafeVolumeUpdater(renderer, renderWindow);
//   updateVolume([["V_10_20_5", 3], ["V_11_20_5", 2]]);

import vtkColorTransferFunction from "vtk.js/Sources/Rendering/Core/ColorTransferFunction";
import vtkPiecewiseFunction from "vtk.js/Sources/Common/DataModel/PiecewiseFunction";
import vtkVolume from "vtk.js/Sources/Rendering/Core/Volume";
import vtkVolumeMapper from "vtk.js/Sources/Rendering/Core/VolumeMapper";
import vtkImageData from "vtk.js/Sources/Common/DataModel/ImageData";
import vtkDataArray from "vtk.js/Sources/Common/Core/DataArray";

export const STATE_COLORS = {
  0: [0.40, 0.40, 0.40],
  1: [1.0, 1.0, 0.0],
  2: [1.0, 0.5, 0.0],
  3: [1.0, 0.0, 0.0],
  4: [0.2, 0.2, 0.2],
};

function parseTriplet(id) {
  // expects "V_i_j_k"
  const parts = String(id).split("_");
  if (parts.length !== 4 || parts[0] !== "V") return null;
  const i = Number(parts[1]) + 0.5; // x
  const j = Number(parts[2]);       // y
  const k = Number(parts[3]) + 0.5; // z (height)
  if (!Number.isFinite(i) || !Number.isFinite(j) || !Number.isFinite(k)) return null;
  return { i, j, k };
}

export function makeSafeVolumeUpdater(renderer, renderWindow, {
  stateColors = STATE_COLORS,
  sampleDistance = 0.75,
  interpolationNearest = true,
  shade = false,
} = {}) {
  let currentVolume = null;

  return function updateVolumeFromPairs(pairs) {
    // Guard: must have data
    if (!Array.isArray(pairs) || pairs.length === 0) {
      // Optionally remove old volume if no data:
      // if (currentVolume) { renderer.removeVolume(currentVolume); currentVolume = null; renderWindow.render(); }
      return;
    }

    // Parse and validate
    const vox = [];
    for (const [id, s] of pairs) {
      const p = parseTriplet(id);
      if (!p) { /* console.warn("[updateVolume] Bad id:", id); */ continue; }
      const state = Number(s);
      if (!Number.isFinite(state)) { /* console.warn("[updateVolume] Bad state", id, s); */ continue; }
      vox.push({ ...p, s: state });
    }
    if (vox.length === 0) return;

    const imin = Math.min(...vox.map(v => v.i));
    const jmin = Math.min(...vox.map(v => v.j));
    const kmin = Math.min(...vox.map(v => v.k));
    const imax = Math.max(...vox.map(v => v.i));
    const jmax = Math.max(...vox.map(v => v.j));
    const kmax = Math.max(...vox.map(v => v.k));

    let nx = imax - imin + 1;
    let ny = jmax - jmin + 1;
    let nz = kmax - kmin + 1;

    if (nx <= 0 || ny <= 0 || nz <= 0) {
      // console.warn("[updateVolume] Non-positive dimensions", { nx, ny, nz });
      return;
    }

    // Build image data
    const imageData = vtkImageData.newInstance();
    imageData.setDimensions(nx, ny, nz);
    imageData.setOrigin(imin, jmin, kmin);
    imageData.setSpacing(1, 1, 1);

    // Scalars
    const scalars = new Uint8Array(nx * ny * nz);
    const idx = (x, y, z) => x + nx * (y + ny * z);

    for (const v of vox) {
      const x = v.i - imin;
      const y = v.j - jmin;
      const z = v.k - kmin;
      if (x >= 0 && x < nx && y >= 0 && y < ny && z >= 0 && z < nz) {
        scalars[idx(x, y, z)] = v.s;
      }
    }

    if (scalars.length === 0) return;

    const data = vtkDataArray.newInstance({
      name: "state",
      numberOfComponents: 1,
      values: scalars,
    });
    imageData.getPointData().setScalars(data);

    // Transfer functions (categorical via tight bands)
    const ctf = vtkColorTransferFunction.newInstance();
    const otf = vtkPiecewiseFunction.newInstance();
    // Ensure at least one point exists
    ctf.addRGBPoint(0, 0, 0, 0);
    otf.addPoint(0, 0.0);

    for (const [k, rgb] of Object.entries(stateColors)) {
      const s = Number(k);
      if (s === 0) continue;
      const [r, g, b] = rgb || [1, 1, 1];
      ctf.addRGBPoint(s - 0.01, r, g, b);
      ctf.addRGBPoint(s + 0.01, r, g, b);
      otf.addPoint(s - 0.01, 1);
      otf.addPoint(s + 0.01, 1);
    }

    // Remove previous volume BEFORE adding the new one
    if (currentVolume) {
      renderer.removeVolume(currentVolume);
      currentVolume.delete?.();
      currentVolume = null;
    }

    // Mapper + volume
    const mapper = vtkVolumeMapper.newInstance();
    mapper.setInputData(imageData);
    mapper.setSampleDistance(sampleDistance);

    const volume = vtkVolume.newInstance();
    volume.setMapper(mapper);
    const prop = volume.getProperty();
    prop.setRGBTransferFunction(0, ctf);
    prop.setScalarOpacity(0, otf);
    if (interpolationNearest) prop.setInterpolationTypeToNearest();
    prop.setShade(!!shade);

    // Sanity check
    const s0 = imageData.getPointData().getScalars();
    if (!s0 || !s0.getNumberOfValues || s0.getNumberOfValues() === 0) return;

    renderer.addVolume(volume);
    currentVolume = volume;
    renderWindow.render();
  };
}
