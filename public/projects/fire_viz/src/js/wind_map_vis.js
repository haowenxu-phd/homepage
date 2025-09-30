// basicShapes.js
function addVoxelPlane(renderer, renderWindow, dims = [336, 368, 131], z = 0) {
  const [nx, ny, nz] = dims;

  const plane = vtk.Filters.Sources.vtkPlaneSource.newInstance({
    XResolution: 1,
    YResolution: 1,
    origin:  [0, 0, z],     // lower-left
    point1:  [nx, 0, z],    // X extent
    point2:  [0, ny, z],    // Y extent
  });

  const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
  mapper.setInputConnection(plane.getOutputPort());

  const actor = vtk.Rendering.Core.vtkActor.newInstance();
  actor.setMapper(mapper);

  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  return actor;
}

function addVoxelCube(renderer, renderWindow, dims = [336, 368, 131]) {
  const [nx, ny, nz] = dims;

  const cube = vtk.Filters.Sources.vtkCubeSource.newInstance({
    xLength: nx,
    yLength: ny,
    zLength: nz,
    center: [nx / 2, ny / 2, nz / 2],  // min corner at (0,0,0)
  });

  const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
  mapper.setInputConnection(cube.getOutputPort());

  const actor = vtk.Rendering.Core.vtkActor.newInstance();
  actor.setMapper(mapper);

  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  return actor;
}

// Expose globally if not using imports
window.addVoxelPlane = addVoxelPlane;
window.addVoxelCube  = addVoxelCube;



// Apply an image texture to a vtk.js actor (works with UMD bundle)
function applyImageTextureToActor_old(actor, imageUrl, renderer, renderWindow) {
  const img = new Image();
  img.crossOrigin = 'anonymous'; // needed if the PNG is not same-origin
  img.onload = () => {
    const tex = vtk.Rendering.Core.vtkTexture.newInstance();
    tex.setInterpolate(true);  // bilinear
    tex.setRepeat(false);
    tex.setEdgeClamp(true);
    // If your image looks upside-down, try: tex.setFlipY(true);  // some builds support this

    tex.setImage(img);         // HTMLImageElement → texture
    actor.addTexture(tex);

    renderer.resetCameraClippingRange();
    renderWindow.render();
  };
  img.src = imageUrl;
}

// Use this with your planeActor returned by addVoxelPlane(...)
function applyImageTextureToActor(actor, imageUrl, renderer, renderWindow, {
  flipY = false,        // set true if image appears upside down
  opaque = true,        // set true if your PNG has unwanted transparency
  disableLighting = true,
} = {}) {
  const img = new Image();
  img.crossOrigin = 'anonymous'; // if loading from another origin
  img.onload = () => {
    const tex = vtk.Rendering.Core.vtkTexture.newInstance();
    tex.setInterpolate(true);
    tex.setRepeat(false);
    tex.setEdgeClamp(true);
    if (tex.setFlipY && flipY) tex.setFlipY(true);
    tex.setImage(img);

    // Ensure the texture is not darkened by material settings
    const prop = actor.getProperty();
    if (disableLighting) {
      if (prop.setLighting) prop.setLighting(false);
      prop.setAmbient?.(1.0);
      prop.setDiffuse?.(0.0);
      prop.setSpecular?.(0.0);
    }
    prop.setColor(1, 1, 1); // keep texture colors unmodified
    prop.setOpacity(opaque ? 1.0 : prop.getOpacity());
    // Avoid accidental face culling hiding the plane
    prop.setFrontfaceCulling?.(false);
    prop.setBackfaceCulling?.(false);

    actor.addTexture(tex);

    renderer.resetCameraClippingRange();
    renderWindow.render();
  };
  img.src = imageUrl;
}

// Apply a PNG texture and *explicitly* set planar UVs over [u0..u0+width]×[v0..v0+height] at z
function applyImageTextureToActorWithMapping(
  actor,
  imageUrl,
  renderer,
  renderWindow,
  {
    width = 336,
    height = 368,
    u0 = 0,      // world X where U=0 starts
    v0 = 0,      // world Y where V=0 starts
    forceOpaque = true,
    flipY = false,        // set true if the image shows upside-down
    disableLighting = true,
  } = {}
) {
  const mapper = actor.getMapper?.();
  if (!mapper) {
    console.error('No mapper on actor');
    return;
  }

  // Try to get the input polydata (works for vtkPlaneSource → mapper pipeline)
  let poly = mapper.getInputData?.();
  if (!poly) {
    // Fallback: try to walk the connection (depends on UMD build)
    try {
      const port0 = mapper.getInputConnection?.(0);
      const prod = port0?.getProducer?.() || port0?.getSource?.();
      poly = prod?.getOutputData?.();
    } catch (e) {
      /* ignore */
    }
  }
  if (!poly) {
    console.error('Could not access mapper input polydata');
    return;
  }

  // Build TCoords from point positions: u=(x - u0)/width, v=(y - v0)/height
  const ptsData = poly.getPoints().getData();
  const nPts = ptsData.length / 3;
  const tcoords = new Float32Array(nPts * 2);

  for (let i = 0; i < nPts; i++) {
    const x = ptsData[3 * i + 0];
    const y = ptsData[3 * i + 1];
    let u = (x - u0) / width;
    let v = (y - v0) / height;
    if (flipY) v = 1 - v; // optional vertical flip
    tcoords[2 * i + 0] = u;
    tcoords[2 * i + 1] = v;
  }

  const vtkDataArray = vtk.Common.Core.vtkDataArray;
  const tcArray = vtkDataArray.newInstance({
    name: 'TCoords',
    numberOfComponents: 2,
    values: tcoords,
  });
  poly.getPointData().setTCoords(tcArray);
  poly.modified?.(); // notify pipeline

  // Load image → vtkTexture and attach
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const tex = vtk.Rendering.Core.vtkTexture.newInstance();
    tex.setInterpolate(true);
    tex.setRepeat(false);
    tex.setEdgeClamp(true);
    if (tex.setFlipY && flipY) tex.setFlipY(true); // some builds support this
    tex.setImage(img);

    const prop = actor.getProperty();
    if (disableLighting) {
      if (prop.setLighting) prop.setLighting(false);
      prop.setAmbient?.(1.0);
      prop.setDiffuse?.(0.0);
      prop.setSpecular?.(0.0);
    }
    prop.setColor(1, 1, 1);
    if (forceOpaque) prop.setOpacity(1.0);
    prop.setFrontfaceCulling?.(false);
    prop.setBackfaceCulling?.(false);

    actor.addTexture(tex);

    renderer.resetCameraClippingRange();
    renderWindow.render();
  };
  img.src = imageUrl;
}





// -------------------- Below is for loading the file -----------------------------

// wind_texture.js — build a wind RGBA texture from angle.bin + speed.bin
// and apply it to OBJ pieces (with or without UVs). Works with vtk.js UMD.

(function (w) {
  // ---- helpers ----
  async function f32(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch ${url}: ${r.status} ${r.statusText}`);
    return new Float32Array(await r.arrayBuffer());
  }

  function hsv2rgb(h, s, v) {
    const i = Math.floor(h * 6), f = h * 6 - i;
    const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: return [v, t, p];
      case 1: return [q, v, p];
      case 2: return [p, v, t];
      case 3: return [p, q, v];
      case 4: return [t, p, v];
      default: return [v, p, q];
    }
  }

  // ---- build a vtkTexture from wind files ----
  async function buildWindTexture(basePath = 'wind_vis/wind_1/') {
    const meta = await (await fetch(basePath + 'windmap.json')).json();
    const nx = meta.nx, ny = meta.ny;

    const angle = await f32(basePath + (meta.arrays?.angle || 'angle.bin')); // [-pi, pi]
    const speed = await f32(basePath + (meta.arrays?.speed || 'speed.bin'));

    // normalize speed to [0,1]
    let sMin = Infinity, sMax = -Infinity;
    for (let i = 0; i < speed.length; i++) {
      const v = speed[i]; if (v < sMin) sMin = v; if (v > sMax) sMax = v;
    }
    const inv = 1 / Math.max(1e-12, (sMax - sMin));

    // bake RGBA
    const rgba = new Uint8Array(nx * ny * 4);
    for (let i = 0; i < nx * ny; i++) {
      const hue = ((angle[i] + Math.PI) / (2 * Math.PI)) % 1;   // direction → hue
      const val = Math.max(0, Math.min(1, (speed[i] - sMin) * inv)); // speed → value
      const [r, g, b] = hsv2rgb(hue, 1.0, val);
      rgba[4 * i + 0] = Math.round(r * 255);
      rgba[4 * i + 1] = Math.round(g * 255);
      rgba[4 * i + 2] = Math.round(b * 255);
      rgba[4 * i + 3] = 255;
    }

    // vtkImageData -> vtkTexture
    const image = vtk.Common.DataModel.vtkImageData.newInstance();
    image.setDimensions(nx, ny, 1);
    image.setSpacing(1, 1, 1);
    image.getPointData().setScalars(
      vtk.Common.Core.vtkDataArray.newInstance({
        name: 'RGBA', numberOfComponents: 4, values: rgba
      })
    );

    const texture = vtk.Rendering.Core.vtkTexture.newInstance();
    texture.setInputData(image);
    texture.setInterpolate(true); // smooth
    texture.setRepeat(false);
    texture.setEdgeClamp(true);

    return { texture, nx, ny, meta };
  }

  // ---- apply texture to OBJ outputs ----
  // If the OBJ has UVs, we just addTexture(). If not, we generate planar TCoords.
  function applyWindTextureToOBJ(reader, texture, opts = {}) {
    const {
      // If your OBJ lacks UVs, generate planar UVs in world-XY covering [0..nx]x[0..ny] at Z=z
      forcePlanar = false,
      nx = 336, ny = 368, z = 0,
      // If you positioned your OBJ by shifting actors (not geometry), planar mapping
      // per-piece will use each piece's local bounds. That’s usually fine for visuals.
    } = opts;

    const n = reader.getNumberOfOutputPorts();
    for (let i = 0; i < n; i++) {
      let poly = reader.getOutputData(i);

      // Does this piece already have texture coords?
      const hasTCoords = !!poly.getPointData().getTCoords();

      let mapper, actor;
      if (!hasTCoords || forcePlanar) {
        // Generate planar TCoords in XY
        const tmap = vtk.Filters.General.vtkTextureMapToPlane.newInstance({
          automaticPlaneGeneration: false,
          origin:  [0, 0, z],   // lower-left in world-XY
          point1:  [nx, 0, z],  // x axis
          point2:  [0, ny, z],  // y axis
        });
        tmap.setInputData(poly);

        mapper = vtk.Rendering.Core.vtkMapper.newInstance();
        mapper.setInputConnection(tmap.getOutputPort());
      } else {
        mapper = vtk.Rendering.Core.vtkMapper.newInstance();
        mapper.setInputData(poly); // use OBJ UVs
      }

      actor = vtk.Rendering.Core.vtkActor.newInstance();
      actor.setMapper(mapper);
      actor.addTexture(texture);
      // You likely already set actor positions/colors elsewhere after reading the OBJ.
      // Return the mapper/actor pair so you can position/opacify like your other code.
      // For convenience we add them now; you can re-style later.
      // If you already created actors for these pieces, you can instead just call:
      //   existingActor.addTexture(texture)
      // and skip creating new ones.

      // NOTE: Do NOT add to renderer here if you already added actors elsewhere.
      // If you prefer to let this helper add them:
      // renderer.addActor(actor);
      // (But to keep this generic, we just return the built parts.)

      // Replace the reader's output pipe in your app if needed.
    }
  }

  // Expose globals
  w.buildWindTexture = buildWindTexture;
  w.applyWindTextureToOBJ = applyWindTextureToOBJ;
})(window);
