function getSceneCenterAndRadius(renderer) {
  const b = renderer.computeVisiblePropBounds(); // [xmin,xmax,ymin,ymax,zmin,zmax]
  if (!b || !isFinite(b[0])) return { center: [0,0,0], radius: 100 };
  const cx = (b[0] + b[1]) / 2;
  const cy = (b[2] + b[3]) / 2;
  const cz = (b[4] + b[5]) / 2;
  const dx = b[1] - b[0], dy = b[3] - b[2], dz = b[5] - b[4];
  const radius = Math.max(dx, dy, dz) * 0.6 || 100;
  return { center: [cx, cy, cz], radius };
}

function snapView(axis, sign = +1, parallel = true) {
  const cam = renderer.getActiveCamera();
  const { center, radius } = getSceneCenterAndRadius(renderer);

  // Set projection type
  cam.setParallelProjection(!!parallel);

  // Position camera along requested axis at a distance
  const d = radius * 2.2; // back off a bit so whole scene fits
  let pos;
  let up;
  if (axis === 'x')      { pos = [center[0] + sign*d, center[1], center[2]]; up = [0, 0, 1]; }
  else if (axis === 'y') { pos = [center[0], center[1] + sign*d, center[2]]; up = [0, 0, 1]; }
  else                   { pos = [center[0], center[1], center[2] + sign*d]; up = [0, 1, 0]; } // 'z'

  cam.setFocalPoint(...center);
  cam.setPosition(...pos);
  cam.setViewUp(...up);

  if (parallel) {
    // Scale the parallel projection so the whole scene is visible
    const size = radius * 1.4;
    cam.setParallelScale(size);
  }

  renderer.resetCameraClippingRange();
  renderWindow.render();
}


function boundsToCorners(bounds) {
  const [xmin, xmax, ymin, ymax, zmin, zmax] = bounds;
  return [
    [xmin, ymin, zmin],
    [xmax, ymin, zmin],
    [xmin, ymax, zmin],
    [xmax, ymax, zmin],
    [xmin, ymin, zmax],
    [xmax, ymin, zmax],
    [xmin, ymax, zmax],
    [xmax, ymax, zmax],
  ];
}