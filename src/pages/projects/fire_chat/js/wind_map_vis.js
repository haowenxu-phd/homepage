import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkTexture from "@kitware/vtk.js/Rendering/Core/Texture";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";

export function addVoxelPlane(renderer, renderWindow, dims = [336, 368, 131], z = 40) {
  const [nx, ny] = dims;

  const plane = vtkPlaneSource.newInstance({
    XResolution: 1,
    YResolution: 1,
    origin: [0, 0, z],
    point1: [nx, 0, z],
    point2: [0, ny, z],
  });

  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(plane.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  renderer.addActor(actor);
  renderWindow.render();

  return actor;
}

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
  const poly = mapper?.getInputData?.();

  if (!poly) {
    console.error("Could not access mapper input polydata");
    return;
  }

  const ptsData = poly.getPoints().getData();
  const nPts = ptsData.length / 3;
  const tcoords = new Float32Array(nPts * 2);

  for (let i = 0; i < nPts; i++) {
    const x = ptsData[3 * i];
    const y = ptsData[3 * i + 1];

    let u = (x - u0) / width;
    let v = (y - v0) / height;

    if (flipY) v = 1 - v;

    tcoords[2 * i] = u;
    tcoords[2 * i + 1] = v;
  }

  const tcArray = vtkDataArray.newInstance({
    name: "TCoords",
    numberOfComponents: 2,
    values: tcoords,
  });

  poly.getPointData().setTCoords(tcArray);
  poly.modified?.();

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

    actor.addTexture(tex);

    renderer.resetCameraClippingRange();
    renderWindow.render();
  };

  img.src = imageUrl;
}