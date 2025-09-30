function makeSafeVolumeUpdater(renderer, renderWindow) {
  const ColorTF   = vtk.Rendering.Core.vtkColorTransferFunction;
  const Piecewise = vtk.Common.DataModel.vtkPiecewiseFunction;
  const Volume    = vtk.Rendering.Core.vtkVolume;
  const VolMapper = vtk.Rendering.Core.vtkVolumeMapper;
  const ImageData = vtk.Common.DataModel.vtkImageData;
  const DataArray = vtk.Common.Core.vtkDataArray;

  const STATE_COLORS = {
    0:[0.40,0.40,0.40],
    1:[1.0, 1.0, 0.0],
    2:[1.0, 0.5, 0.0],
    3:[1.0, 0.0, 0.0],
    4:[0.2, 0.2, 0.2],
  };

  let currentVolume = null;

  function parseTriplet(id) {
    // expects "V_i_j_k"
    const parts = id.split('_');
    if (parts.length !== 4 || parts[0] !== 'V') return null;
    const i = (Number(parts[1])+0.5);    //this is x
    const j = (Number(parts[2]));    
    const k = (Number(parts[3])+0.5);  //this is height
    if (!Number.isFinite(i) || !Number.isFinite(j) || !Number.isFinite(k)) return null;
     
    return { i, j, k }; 
  }

  return function updateVolumeFromPairs(pairs) {
    // Guard 1: must have data
    if (!Array.isArray(pairs) || pairs.length === 0) {
      console.warn('[updateVolume] Empty pairs → skipping volume build.');
      // Optionally also remove old volume:
      // if (currentVolume) { renderer.removeVolume(currentVolume); currentVolume = null; renderWindow.render(); }
      return;
    }

    // Parse and validate
    const vox = [];
    for (const [id, s] of pairs) {
      const p = parseTriplet(String(id));
      if (!p) { console.warn('[updateVolume] Bad id:', id); continue; }
      const state = Number(s);
      if (!Number.isFinite(state)) { console.warn('[updateVolume] Bad state for', id, s); continue; }
      vox.push({ ...p, s: state });
    }
    if (vox.length === 0) {
      console.warn('[updateVolume] No valid voxels after parsing → abort.');
      return;
    }

    const imin = Math.min(...vox.map(v => v.i));
    const jmin = Math.min(...vox.map(v => v.j));
    const kmin = Math.min(...vox.map(v => v.k));
    const imax = Math.max(...vox.map(v => v.i));
    const jmax = Math.max(...vox.map(v => v.j));
    const kmax = Math.max(...vox.map(v => v.k));

    let nx = imax - imin + 1;
    let ny = jmax - jmin + 1;
    let nz = kmax - kmin + 1;

    // Guard 2: avoid zero-sized dimensions
    if (nx <= 0 || ny <= 0 || nz <= 0) {
      console.warn('[updateVolume] Non-positive dimensions', { nx, ny, nz, imin, imax, jmin, jmax, kmin, kmax });
      return;
    }
    

    // Build image data
    const imageData = ImageData.newInstance();
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
      // extra guard: ensure inside array
      if (x>=0 && x<nx && y>=0 && y<ny && z>=0 && z<nz) {
        scalars[idx(x, y, z)] = v.s;
      }
    }

    if (scalars.length === 0) {
      console.warn('[updateVolume] Scalar array is empty → abort.');
      return;
    }

    const data = DataArray.newInstance({
      name: 'state',
      numberOfComponents: 1,
      values: scalars,
    });
    imageData.getPointData().setScalars(data);

    // Transfer functions (categorical)
    const ctf = ColorTF.newInstance();
    const otf = Piecewise.newInstance();
    // ensure at least two points exist in each TF
    ctf.addRGBPoint(0, 0, 0, 0);
    otf.addPoint(0, 0.0);
    for (const [k, rgb] of Object.entries(STATE_COLORS)) {
      const s = Number(k);
      if (s === 0) continue;
      const [r,g,b] = rgb || [1,1,1];
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
    const mapper = VolMapper.newInstance();
    mapper.setInputData(imageData); // <- critical: provides the INPUT
    mapper.setSampleDistance(0.75);

    const volume = Volume.newInstance();
    volume.setMapper(mapper);
    const prop = volume.getProperty();
    prop.setRGBTransferFunction(0, ctf);
    prop.setScalarOpacity(0, otf);
    prop.setInterpolationTypeToNearest();
    prop.setShade(false);

    // Final sanity: make sure we really have scalars
    const s0 = imageData.getPointData().getScalars();
    if (!s0 || !s0.getNumberOfValues || s0.getNumberOfValues() === 0) {
      console.warn('[updateVolume] No scalars attached right before render.');
      return;
    }

    renderer.addVolume(volume);
    currentVolume = volume;

    // Either keep existing view, or auto-frame this volume:
    /*
    if (!renderer.getActiveCamera().getParallelProjection()) {
      renderer.resetCamera();
    }*/

    renderWindow.render();
  };
}


function upsertPairsInPlace(arr1, arr2) {
  // index existing keys in arr1 -> position
  const index = new Map();
  for (let i = 0; i < arr1.length; i++) {
    const a = arr1[i][0];
    if (!index.has(a)) index.set(a, i); // first occurrence wins
  }

  for (const [a, b] of arr2) {
    if (index.has(a)) {
      arr1[index.get(a)] = [a, b];        // replace
    } else {
      index.set(a, arr1.length);
      arr1.push([a, b]);                  // append
    }
  }
  return arr1;
}