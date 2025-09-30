    
function load_obj(renderer){
            //liverpool_obj_2_color.obj
                // === VTK.js setup ===     
                //const obj_dict = ['voxels_by_fuel_shell2_255088-0-1000_0-1000_0-1000-0-1000_0-1000_0-1000_more_class.obj'];
                const objUrl = './obj/voxels_by_fuel_shell2_255088-0-1000_0-1000_0-1000_more_class.obj';
                console.log(objUrl)

                const reader = vtk.IO.Misc.vtkOBJReader.newInstance({splitMode:'o'});
                const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
                const actor  = vtk.Rendering.Core.vtkActor.newInstance();

                actor.setMapper(mapper);
                mapper.setInputConnection(reader.getOutputPort());
                renderer.addActor(actor);

                // Load OBJ into vtk.js
                //const reader = vtk.IO.Misc.vtkOBJReader.newInstance({ /* splitMode:'o'|'g'|'usemtl' */ });
                const PALETTE = [
                      [0.1, 0.8, 0.1],
                      [0.1, 0.8, 0.4],
                      [0.4, 0.4, 0.3],
                      [0.44, 0.31, 0.22],
                    ];

                const PALETTE_dict = {
                    'obj_2':   [0.1, 0.8, 0.1],        
                    'obj_0':   [0.4, 0.4, 0.3],
                    'obj_111': [0.44, 0.31, 0.22],
                    'obj_14':  [0.44, 0.31, 0.22],

                    // 🌲 Trees (distinct greenish variants: yellow-green → green → blue-green → cyan)
                    'obj_5':  [0.6, 0.75, 0.1],   // yellow-green
                    'obj_7':  [0.2, 0.7, 0.15],   // natural leafy green
                    'obj_8':  [0.0, 0.5, 0.25],   // deep forest green
                    'obj_6':  [0.0, 0.7, 0.5],    // teal / green-cyan
                    'obj_9':  [0.1, 0.55, 0.65],  // turquoise
                    'obj_10': [0.05, 0.8, 0.35],  // spring green
                    'obj_11': [0.0, 0.8, 0.8],     // cyan-green

                    // 🌱 Grassy ground (green-brownish)
                    'obj_3':   [0.35, 0.55, 0.25], // muted grassy green
                    'obj_4':   [0.4, 0.5, 0.3],    // green-brown mix

                    // 🏠 Wood house (light coffee color)
                    'obj_15':  [0.65, 0.45, 0.3]
                };
 

                reader.setUrl(objUrl).then(() => {
                  // optional cleanup if this can run more than once
                  console.log("obj loaded?")
                  renderer.getActors().forEach(a => renderer.removeActor(a));

                  // compute global mins once (to shift to origin)
                  let xmin=Infinity, ymin=Infinity, zmin=Infinity;
                    let xmax = -Infinity, ymax = -Infinity, zmax = -Infinity;

                  const n = reader.getNumberOfOutputPorts();
                  for (let i = 0; i < n; i++) {
                      const b = reader.getOutputData(i).getBounds(); // [xmin,xmax,ymin,ymax,zmin,zmax]
                      if (!b || !isFinite(b[0])) continue;
                      xmin = Math.min(xmin, b[0]);
                      ymin = Math.min(ymin, b[2]);
                      zmin = Math.min(zmin, b[4]);
                      xmax = Math.max(xmax, b[1]);
                      ymax = Math.max(ymax, b[3]);
                      zmax = Math.max(zmax, b[5]);
                    }

                    const dims   = [xmax - xmin, ymax - ymin, zmax - zmin];
                    const center = [(xmin + xmax)/2, (ymin + ymax)/2, (zmin + zmax)/2];

                    console.log('OBJ bounds:', [xmin, xmax, ymin, ymax, zmin, zmax]);
                    console.log('OBJ dims  :', dims);
                    console.log('OBJ center:', center);

                    // If you want to shift to origin using these mins:
                    const shift = [-xmin, -ymin, -zmin];
                  console.log("shift", shift)
                  // add per-piece actors (shifted)
                  for (let i = 0; i < n; i++) {
                        const poly   = reader.getOutputData(i);
                      
                        const objName = typeof poly.getName === 'function' ? poly.getName() : poly.get('name');
                        obj_name = objName["name"];
                        
                      

                        const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
                        mapper.setInputData(poly);

                        // IMPORTANT: disable scalar/texture coloring
                        mapper.setScalarVisibility(false);
                        mapper.setColorByArrayName(null);
                        mapper.setScalarModeToDefault();

                        const actor  = vtk.Rendering.Core.vtkActor.newInstance();
                        actor.setMapper(mapper);

                        // if the OBJ brought in textures, remove them
                        actor.getTextures?.().forEach(t => actor.removeTexture(t));

                        actor.getProperty().setColor(PALETTE_dict[obj_name]);   // solid red
                        actor.getProperty().setLighting(true);   // optional: enable shading
                        actor.getProperty().setAmbient(0.15);
                        actor.getProperty().setDiffuse(0.85);

                        actor.setPosition(shift[0], 0, 0);       // your shift
                        renderer.addActor(actor);

                        console.log('scalarVis:', mapper.getScalarVisibility(),
                        'pointScalars?', !!poly.getPointData().getScalars(),
                        'textures:', actor.getTextures?.().length || 0);
                      }

                          // assuming you already have renderer and renderWindow set up
                      const planeActor = addVoxelPlane(renderer, renderWindow, [336, 368, 131],40);
                      // Load wind data and build texture
                      ////applyImageTextureToActor(planeActor, 'wind_vis/wind_1/wind_field.png', renderer, renderWindow);
                        
                      planeActor.getProperty().setEdgeVisibility(true);
                      planeActor.getProperty().setEdgeColor(0.3, 0.3, 0.3);   // black edges
                      planeActor.getProperty().setLineWidth(2);         // thicker lines
                      

                      // Apply the PNG so that (x=0,y=0)→UV(0,0) and (x=336,y=368)→UV(1,1)
                    applyImageTextureToActorWithMapping(
                      planeActor,
                      WindUrl,
                      renderer,
                      renderWindow,
                      { width: 336, height: 368, u0: 0, v0: 0, forceOpaque: true, flipY: false }
                    );
                              

                      renderer.resetCamera();
                      renderWindow.render();
                });



        // === Parse OBJ text to list object names ===
        async function listObjGroups(url, renderer) {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch OBJ: " + res.statusText);
            const text = await res.text();

            const groups = [];
            text.split(/\r?\n/).forEach(line => {
              if (line.startsWith('o ')) {
                groups.push(line.substring(2).trim());
              }
            });

            // Show in console
            //console.log("OBJ objects found:", groups);

            // Show in HUD
            /*
            const hud = document.getElementById('hud');
            hud.innerHTML = `<b>Objects in OBJ:</b><br>` + groups.join("<br>");*/
            } catch (err) {
              console.error(err);
              document.getElementById('hud').textContent = "Error loading OBJ";
            }
        } //end of listObjGroups

        listObjGroups(objUrl, renderer);

    } //end of "load_obj"



    //comment - connectFramesUI
    function connectFramesUI(frames, onFrameChange) {
        const slider = document.getElementById("timeSlider");
        const label  = document.getElementById("tl");
        const playBtn = document.getElementById("play");

        // Extract timesteps and configure slider
        const timesteps = Object.keys(frames).map(Number).sort((a,b)=>a-b);
        slider.min = timesteps[0];
        slider.max = timesteps[timesteps.length - 1];
        slider.value = timesteps[0];
        label.textContent = timesteps[0];

        // Helper to update when slider changes
        function updateFrame(t) {
          const frame = frames[t] || [];
          label.textContent = t;
          onFrameChange(t, frame);
        }

        // Manual slider move
        slider.addEventListener("input", () => {
          const t = parseInt(slider.value);
          updateFrame(t);
        });

        // Play/pause animation
        let playing = false;
        let intervalId = null;
        let interval_step = 1;

        playBtn.addEventListener("click", () => {
          if (!playing) {
            playing = true;
            playBtn.textContent = "⏸"; // change button to pause
            intervalId = setInterval(() => {
              let t = parseInt(slider.value);
              if (t >= slider.max) {
                t = slider.min; // loop back
              } else {
                t++;
              }
              slider.value = t;
              updateFrame(t);
            }, interval_step); // 100ms per frame
          } else {
            playing = false;
            playBtn.textContent = "▶";
            clearInterval(intervalId);
          }
        });

        // Initialize first frame
        updateFrame(parseInt(slider.value));
      }