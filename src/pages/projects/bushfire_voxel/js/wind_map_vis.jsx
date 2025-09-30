// js/wind_map_vis.js
// ESM utilities for wind/voxel visuals with vtk.js (no globals, React-safe)

import vtkPlaneSource from "vtk.js/Sources/Filters/Sources/PlaneSource";
import vtkCubeSource from "vtk.js/Sources/Filters/Sources/CubeSource";
import vtkMapper from "vtk.js/Sources/Rendering/Core/Mapper";
import vtkActor from "vtk.js/Sources/Rendering/Core/Actor";
import vtkTexture from "vtk.js/Sources/Rendering/Core/Texture";
import vtkImageData from "vtk.js/Sources/Common/DataModel/ImageData";
import vtkDataArray from "vtk.js/Sources/Common/Core/DataArray";

/** Add a world-aligned XY plane sized to dims at Z=z */
export function addVoxelPlane(renderer, renderWindow, dims = [336, 368, 131], z = 0) {
  const [nx, ny] = dims;

  const plane = vtkPlaneSource.newInstance({
    xResolution: 1,
    yResolution: 1,
    origin:  [0, 0, z],   // lower-left
    point1:  [nx, 0, z],  // X extent
    point2:  [0, ny, z],  // Y extent
  });

  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(plane.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  return actor;
}

/** Add a world-aligned cube with min corner at (0,0,0) and size = dims */
export function addVoxelCube(renderer, renderWindow, dims = [336, 368, 131]) {
  const [nx, ny, nz] = dims;

  const cube = vtkCubeSource.newInstance({
    xLength: nx,
    yLength: ny,
    zLength: nz,
    center: [nx / 2, ny / 2, nz / 2], // min corner at (0,0,0)
  });

  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(cube.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  return actor;
}

/** Apply an HTML image texture to an actor (uses actor UVs if present) */
export function applyImageTextureToActor(
  actor,
  imageUrl,
  renderer,
  renderWindow,
  {
    flipY = false,
    opaque = true,
    disableLighting = true,
  } = {}
) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const tex = vtkTexture.newInstance();
    tex.setInterpolate(true);
    tex.setRepeat(false);
    tex.setEdgeClamp(true);
    if (tex.setFlipY && flipY) tex.setFlipY(true);
    tex.setImage(img);

    const prop = actor.getProperty();
    if (disableLighting) {
      prop.setLighting?.(false);
      prop.setAmbient?.(1.0);
      prop.setDiffuse?.(0.0);
      prop.setSpecular?.(0.0);
    }
    prop.setColor(1, 1, 1);
    if (opaque) prop.setOpacity(1.0);
    prop.setFrontfaceCulling?.(false);
    prop.setBackfaceCulling?.(false);

    actor.addTexture(tex);

    renderer.resetCameraClippingRange();
    renderWindow.render();
  };
  img.src = imageUrl;
}

/**
 * Apply an image to an actor and explicitly generate planar TCoords
 * mapping world-XY rectangle [u0..u0+width] × [v0..v0+height] → UV [0..1] × [0..1].
 */
export function applyImageTextureToActorWithMapping(
  actor,
  imageUrl,
  renderer,
  renderWindow,
  {
    width = 336,
    height = 368,
    u0 = 0,
    v0 = 0,
    forceOpaque = true,
    flipY = false,
    disableLighting = true,
  } = {}
) {
  const mapper = actor.getMapper?.();
  if (!mapper) {
    console.error("applyImageTextureToActorWithMapping: actor has no mapper");
    return;
  }

  // Access input polydata (plane → mapper pipeline)
  let poly = mapper.getInputData?.();
  if (!poly) {
    try {
      const port0 = mapper.getInputConnection?.(0);
      const prod = port0?.getProducer?.() || port0?.getSource?.();
      poly = prod?.getOutputData?.();
    } catch {/* ignore */}
  }
  if (!poly) {
    console.error("applyImageTextureToActorWithMapping: cannot access mapper input");
    return;
  }

  // Compute planar TCoords from world XY
  const ptsData = poly.getPoints().getData();
  const nPts = ptsData.length / 3;
  const tcoords = new Float32Array(nPts * 2);

  for (let i = 0; i < nPts; i++) {
    const x = ptsData[3 * i + 0];
    const y = ptsData[3 * i + 1];
    let u = (x - u0) / width;
    let v = (y - v0) / height;
    if (flipY) v = 1 - v;
    tcoords[2 * i + 0] = u;
    tcoords[2 * i + 1] = v;
  }

  const tcArray = vtkDataArray.newInstance({
    name: "TCoords",
    numberOfComponents: 2,
    values: tcoords,
  });
  poly.getPointData().setTCoords(tcArray);
  poly.modified?.();

  // Load and attach texture
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const tex = vtkTexture.newInstance();
    tex.setInterpolate(true);
    tex.setRepeat(false);
    tex.setEdgeClamp(true);
    if (tex.setFlipY && flipY) tex.setFlipY(true);
    tex.setImage(img);

    const prop = actor.getProperty();
    if (disableLighting) {
      prop.setLighting?.(false);
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

/** Build a wind texture (RGBA) from angle.bin/speed.bin + windmap.json metadata */
export async function buildWindTexture(basePath = "wind_vis/wind_1/") {
  const metaRes = await fetch(basePath + "windmap.json");
  if (!metaRes.ok) throw new Error(`fetch ${basePath}windmap.json: ${metaRes.status} ${metaRes.statusText}`);
  const meta = await metaRes.json();

  const nx = meta.nx, ny = meta.ny;

  const f32 = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch ${url}: ${r.status} ${r.statusText}`);
    return new Float32Array(await r.arrayBuffer());
  };

  const angle = await f32(basePath + (meta.arrays?.angle || "angle.bin")); // [-pi, pi]
  const speed = await f32(basePath + (meta.arrays?.speed || "speed.bin"));

  // normalize speed to [0,1]
  let sMin = Infinity, sMax = -Infinity;
  for (let i = 0; i < speed.length; i++) {
    const v = speed[i];
    if (v < sMin) sMin = v;
    if (v > sMax) sMax = v;
  }
  const inv = 1 / Math.max(1e-12, (sMax - sMin));

  const hsv2rgb = (h, s, v) => {
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
  };

  const rgba = new Uint8Array(nx * ny * 4);
  for (let i = 0; i < nx * ny; i++) {
    const hue = ((angle[i] + Math.PI) / (2 * Math.PI)) % 1;        // direction → hue
    const val = Math.max(0, Math.min(1, (speed[i] - sMin) * inv)); // speed → value
    const [r, g, b] = hsv2rgb(hue, 1.0, val);
    rgba[4 * i + 0] = Math.round(r * 255);
    rgba[4 * i + 1] = Math.round(g * 255);
    rgba[4 * i + 2] = Math.round(b * 255);
    rgba[4 * i + 3] = 255;
  }

  const image = vtkImageData.newInstance();
  image.setDimensions(nx, ny, 1);
  image.setSpacing(1, 1, 1);
  image.getPointData().setScalars(
    vtkDataArray.newInstance({
      name: "RGBA",
      numberOfComponents: 4,
      values: rgba,
    })
  );

  const texture = vtkTexture.newInstance();
  texture.setInputData(image);
  texture.setInterpolate(true);
  texture.setRepeat(false);
  texture.setEdgeClamp(true);

  return { texture, nx, ny, meta };
}

/**
 * Apply a (prebuilt) wind texture to OBJ pieces from a vtkOBJReader.
 * If pieces lack UVs, we generate planar UVs directly on each polydata.
 * NOTE: This builds fresh mappers/actors. If you already added actors elsewhere,
 * prefer: existingActor.addTexture(texture).
 */
export function applyWindTextureToOBJ(reader, texture, {
  forcePlanar = false,
  nx = 336, ny = 368, z = 0,   // used as [u0..nx] × [v0..ny] at z
  u0 = 0, v0 = 0,
  addToRenderer = false,
  renderer = null,
  flipY = false,
} = {}) {
  const n = reader.getNumberOfOutputPorts();
  const results = [];

  for (let i = 0; i < n; i++) {
    const poly = reader.getOutputData(i);
    if (!poly) continue;

    const hasTCoords = !!poly.getPointData().getTCoords();

    // If no UVs (or forcePlanar), generate planar TCoords in world-XY
    if (!hasTCoords || forcePlanar) {
      const pts = poly.getPoints()?.getData();
      if (pts) {
        const count = pts.length / 3;
        const tcoords = new Float32Array(count * 2);
        for (let p = 0; p < count; p++) {
          const x = pts[3 * p + 0];
          const y = pts[3 * p + 1];
          let u = (x - u0) / nx;
          let v = (y - v0) / ny;
          if (flipY) v = 1 - v;
          tcoords[2 * p + 0] = u;
          tcoords[2 * p + 1] = v;
        }
        const tcArray = vtkDataArray.newInstance({
          name: "TCoords",
          numberOfComponents: 2,
          values: tcoords,
        });
        poly.getPointData().setTCoords(tcArray);
        poly.modified?.();
      }
    }

    const mapper = vtkMapper.newInstance();
    mapper.setInputData(poly);

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.addTexture(texture);

    if (addToRenderer && renderer) {
      renderer.addActor(actor);
    }

    results.push({ mapper, actor });
  }

  return results;
}
