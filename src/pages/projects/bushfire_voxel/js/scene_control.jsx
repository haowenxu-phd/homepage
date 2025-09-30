// src/pages/projects/bushfire_voxel/js/scene_control.jsx
// Camera helpers for vtk.js

/** Compute scene bounds → { center: [x,y,z], radius } */
export function getSceneCenterAndRadius(renderer) {
  if (!renderer) return { center: [0, 0, 0], radius: 1 };

  // Aggregate bounds from actors + volumes
  let xmin =  Infinity, ymin =  Infinity, zmin =  Infinity;
  let xmax = -Infinity, ymax = -Infinity, zmax = -Infinity;

  const update = (prop) => {
    const b = prop?.getBounds?.();
    if (!b || !Number.isFinite(b[0])) return;
    xmin = Math.min(xmin, b[0]); xmax = Math.max(xmax, b[1]);
    ymin = Math.min(ymin, b[2]); ymax = Math.max(ymax, b[3]);
    zmin = Math.min(zmin, b[4]); zmax = Math.max(zmax, b[5]);
  };

  renderer.getActors().forEach(update);
  renderer.getVolumes?.().forEach?.(update);

  // Fallback: if nothing was found, use a tiny box at origin
  if (![xmin, ymin, zmin, xmax, ymax, zmax].every(Number.isFinite)) {
    return { center: [0, 0, 0], radius: 1 };
  }

  const dx = xmax - xmin, dy = ymax - ymin, dz = zmax - zmin;
  const center = [(xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2];
  const radius = 0.5 * Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

  return { center, radius };
}

/**
 * Snap camera to ±X/±Y/±Z and frame the scene.
 * axis: 'x' | 'y' | 'z' ; sign: +1 or -1 ; fit: boolean
 */
export function snapView(renderer, renderWindow, axis = 'z', sign = +1, fit = true) {
  if (!renderer || !renderWindow) return;

  const cam = renderer.getActiveCamera();
  const { center, radius } = getSceneCenterAndRadius(renderer);

  // Choose a reasonable distance so the scene fits
  const isParallel = !!cam.getParallelProjection();
  let dist;
  if (isParallel) {
    // For parallel, distance is arbitrary; use a multiple of radius
    dist = Math.max(1, radius * 3);
    cam.setParallelScale(radius);
  } else {
    // For perspective, back up based on view angle
    const vaDeg = cam.getViewAngle?.() ?? 30;
    const va = (vaDeg * Math.PI) / 180;
    dist = Math.max(1, radius / Math.sin(Math.max(va * 0.5, 0.1))) * 1.1;
  }

  // Position vector along chosen axis
  let pos = [...center];
  if (axis === 'x') pos[0] += sign * dist;
  else if (axis === 'y') pos[1] += sign * dist;
  else pos[2] += sign * dist;

  // View-up to keep things upright
  let viewUp;
  if (axis === 'z') viewUp = [0, 1, 0];
  else if (axis === 'y') viewUp = [0, 0, sign > 0 ? 1 : -1];
  else viewUp = [0, 0, 1];

  cam.setFocalPoint(...center);
  cam.setPosition(...pos);
  cam.setViewUp(...viewUp);

  if (fit) {
    renderer.resetCameraClippingRange();
  }
  renderWindow.render();
}
