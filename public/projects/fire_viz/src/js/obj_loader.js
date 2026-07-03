import vtkOBJReader from "@kitware/vtk.js/IO/Misc/OBJReader";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";

export function load_obj(renderer, renderWindow) {
  const objUrl =
    "/projects/fire_viz/obj/voxels_by_fuel_shell2_255088-0-1000_0-1000_0-1000_more_class.obj";

  const reader = vtkOBJReader.newInstance({ splitMode: "o" }); 

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

  reader.setUrl(objUrl).then(() => {
    console.log("OBJ loaded");

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
        typeof poly.getName === "function" ? poly.getName() : poly.get("name");

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

    renderer.resetCamera();
    renderWindow.render();
  });
}