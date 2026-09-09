import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import L from "leaflet";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Tooltip,
  LayersControl,
   useMap,
  useMapEvents,
  
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// =========================================================
// Utility
// =========================================================

function clamp(
  value,
  minValue,
  maxValue
) {

  return Math.min(
    maxValue,
    Math.max(
      minValue,
      value
    )
  );

}


// =========================================================
// Linear interpolation
// =========================================================

function lerp(
  a,
  b,
  t
) {

  return (
    a +
    (
      b -
      a
    ) *
    t
  );

}


// =========================================================
// Interpolate RGB colors
// =========================================================

function interpolateRgb(
  colorA,
  colorB,
  t
) {

  const safeT =
    clamp(
      t,
      0,
      1
    );


  const r =
    Math.round(
      lerp(
        colorA[0],
        colorB[0],
        safeT
      )
    );


  const g =
    Math.round(
      lerp(
        colorA[1],
        colorB[1],
        safeT
      )
    );


  const b =
    Math.round(
      lerp(
        colorA[2],
        colorB[2],
        safeT
      )
    );


  return `rgb(${r}, ${g}, ${b})`;

}


// =========================================================
// Vehicle Speed Ratio
//
// 0.0 = stopped
// 1.0 = vehicle desired speed
//
// IMPORTANT:
//
// Each vehicle has its OWN maximum:
//
// speedRatio =
// currentSpeed / desiredSpeed
//
// =========================================================

function getVehicleSpeedRatio(
  vehicle
) {

  const currentSpeedMps =
    Math.max(
      0,
      Number(
        vehicle?.speedMps
      ) || 0
    );


  const desiredSpeedMps =
    Math.max(
      0,
      Number(
        vehicle?.desiredSpeedMps
      ) || 0
    );


  if (
    desiredSpeedMps <=
      0.0001
  ) {

    return 0;

  }


  return clamp(
    currentSpeedMps /
      desiredSpeedMps,
    0,
    1
  );

}


// =========================================================
// Speed Color Ramp
//
// Normalized against each vehicle's desired speed.
//
// 0.00 -> red
// 0.25 -> orange
// 0.50 -> yellow
// 0.75 -> lime
// 1.00 -> green
//
// =========================================================

function getVehicleSpeedColor(
  vehicle
) {

  const ratio =
    getVehicleSpeedRatio(
      vehicle
    );


  const stops = [

    {
      value: 0.0,
      color: [
        220,
        38,
        38
      ]
    },

    {
      value: 0.25,
      color: [
        249,
        115,
        22
      ]
    },

    {
      value: 0.50,
      color: [
        234,
        179,
        8
      ]
    },

    {
      value: 0.75,
      color: [
        132,
        204,
        22
      ]
    },

    {
      value: 1.0,
      color: [
        22,
        163,
        74
      ]
    }

  ];


  for (
    let i = 0;
    i < stops.length - 1;
    i += 1
  ) {

    const lower =
      stops[i];


    const upper =
      stops[i + 1];


    if (
      ratio >=
        lower.value &&
      ratio <=
        upper.value
    ) {

      const localRatio =
        (
          ratio -
          lower.value
        ) /
        (
          upper.value -
          lower.value
        );


      return interpolateRgb(
        lower.color,
        upper.color,
        localRatio
      );

    }

  }


  return "rgb(22, 163, 74)";

}


// =========================================================
// Create Vehicle Marker Icon
// =========================================================

function createVehicleIcon(
  vehicle,
  isEgo = false,
  isEgoBraking = false
) {

  // =======================================================
  // Vehicle dimensions
  // =======================================================

  const baseLengthPx =
    isEgo
      ? 18
      : 12;


  const baseWidthPx =
    isEgo
      ? 11
      : 8;


  const scale =
    vehicle.lengthM
      ? vehicle.lengthM /
        4.5
      : 1;


  const lengthPx =
    baseLengthPx *
    scale;


  const widthPx =
    baseWidthPx *
    scale;


  // =======================================================
  // Heading
  // =======================================================

  const headingDeg =
    Number(
      vehicle.headingDeg
    ) || 0;


  // =======================================================
  // Speed-dependent vehicle color
  // =======================================================

  const vehicleColor =
    getVehicleSpeedColor(
      vehicle
    );


  // =======================================================
  // Normal vehicle
  // =======================================================

  if (
    !isEgo
  ) {

    return L.divIcon({

      className:
        "vehicle-marker-container",

      html: `
        <div
          style="
            position: relative;

            width:
              ${lengthPx}px;

            height:
              ${widthPx}px;

            background:
              ${vehicleColor};

            border:
              1px solid
              rgba(
                15,
                23,
                42,
                0.85
              );

            border-radius:
              2px;

            box-sizing:
              border-box;

            transform:
              rotate(
                ${-headingDeg}deg
              );

            transform-origin:
              center center;

            box-shadow:
              0 1px 2px
              rgba(
                0,
                0,
                0,
                0.30
              );
          "
        >

          <!-- Front indicator -->

          <div
            style="
              position: absolute;

              right:
                1px;

              top:
                1px;

              width:
                3px;

              height:
                ${Math.max(
                  widthPx - 4,
                  2
                )}px;

              background:
                rgba(
                  255,
                  255,
                  255,
                  0.95
                );

              border-radius:
                1px;
            "
          >
          </div>

        </div>
      `,

      iconSize: [
        lengthPx,
        widthPx
      ],

      iconAnchor: [
        lengthPx / 2,
        widthPx / 2
      ]

    });

  }


  // =======================================================
  // Ego vehicle
  //
  // IMPORTANT:
  //
  // Ego BODY COLOR still represents speed.
  //
  // Blue / red is used only for:
  //
  // - outline
  // - halo
  // - label
  //
  // Therefore Ego remains part of the same speed ramp.
  // =======================================================

  const containerWidthPx =
    64;


  const containerHeightPx =
    42;


  const egoAccentColor =
    isEgoBraking
      ? "#dc2626"
      : "#2563eb";


  const egoDarkAccentColor =
    isEgoBraking
      ? "#7f1d1d"
      : "#1e3a8a";


  const haloColor =
    isEgoBraking
      ? "rgba(220, 38, 38, 0.24)"
      : "rgba(37, 99, 235, 0.24)";


  const labelText =
    isEgoBraking
      ? "BRAKING"
      : "EGO";


  const vehicleCenterY =
    28;


  const haloSizePx =
    Math.max(
      lengthPx,
      widthPx
    ) +
    8;


  return L.divIcon({

    className:
      "ego-vehicle-marker-container",

    html: `
      <div
        style="
          position:
            relative;

          width:
            ${containerWidthPx}px;

          height:
            ${containerHeightPx}px;

          pointer-events:
            none;
        "
      >

        <!-- ==========================================
             EGO Label
        =========================================== -->

        <div
          style="
            position:
              absolute;

            left:
              50%;

            top:
              0;

            transform:
              translateX(-50%);

            background:
              ${egoAccentColor};

            color:
              white;

            padding:
              1px 6px;

            border-radius:
              4px;

            font-family:
              Arial,
              sans-serif;

            font-size:
              8px;

            line-height:
              12px;

            font-weight:
              700;

            white-space:
              nowrap;

            box-shadow:
              0 1px 3px
              rgba(
                0,
                0,
                0,
                0.30
              );
          "
        >
          ${labelText}
        </div>


        <!-- ==========================================
             Small Ego Halo
        =========================================== -->

        <div
          style="
            position:
              absolute;

            left:
              50%;

            top:
              ${vehicleCenterY}px;

            width:
              ${haloSizePx}px;

            height:
              ${haloSizePx}px;

            transform:
              translate(
                -50%,
                -50%
              );

            border-radius:
              50%;

            background:
              transparent;

            border:
              2px solid
              ${egoAccentColor};

            box-shadow:
              0 0 0 2px
              ${haloColor};

            box-sizing:
              border-box;
          "
        >
        </div>


        <!-- ==========================================
             Ego Vehicle Body
             
             BODY COLOR = SPEED COLOR
        =========================================== -->

        <div
          style="
            position:
              absolute;

            left:
              50%;

            top:
              ${vehicleCenterY}px;

            width:
              ${lengthPx}px;

            height:
              ${widthPx}px;

            background:
              ${vehicleColor};

            border:
              2px solid
              ${egoDarkAccentColor};

            border-radius:
              2px;

            box-sizing:
              border-box;

            transform:
              translate(
                -50%,
                -50%
              )
              rotate(
                ${-headingDeg}deg
              );

            transform-origin:
              center center;

            box-shadow:
              0 1px 4px
              rgba(
                0,
                0,
                0,
                0.45
              );
          "
        >

          <!-- Front / windshield indicator -->

          <div
            style="
              position:
                absolute;

              right:
                1px;

              top:
                1px;

              width:
                4px;

              height:
                ${Math.max(
                  widthPx - 5,
                  2
                )}px;

              background:
                white;

              border-radius:
                1px;
            "
          >
          </div>

        </div>

      </div>
    `,

    iconSize: [
      containerWidthPx,
      containerHeightPx
    ],

    iconAnchor: [
      containerWidthPx / 2,
      vehicleCenterY
    ]

  });

}

// =========================================================
// Koala Marker Controller
// =========================================================

function KoalaMarkerController() {

  const map =
    useMap();


  const activeMarkersRef =
    useRef(
      new Set()
    );


  // =======================================================
  // Show Koala
  // =======================================================

  const showKoala =
    (
      lat = null,
      lon = null
    ) => {

      // ---------------------------------------------------
      // If coordinates are not supplied, use map center
      // ---------------------------------------------------

      let targetLat =
        Number(
          lat
        );


      let targetLon =
        Number(
          lon
        );


      if (
        !Number.isFinite(
          targetLat
        ) ||
        !Number.isFinite(
          targetLon
        )
      ) {

        const center =
          map.getCenter();


        targetLat =
          center.lat;


        targetLon =
          center.lng;

      }


      // ===================================================
      // Koala icon
      // ===================================================

      const koalaIcon =
        L.divIcon({

          className:
            "koala-map-marker",

          html: `
            <div
              class="koala-marker-inner"
              style="
                font-size: 20px;
                line-height: 1;
                filter:
                  drop-shadow(
                    0 2px 4px
                    rgba(0,0,0,0.35)
                  );
                transform-origin: center;
              "
            >
              🐨
            </div>
          `,

          iconSize: [
            23,
            23
          ],

          iconAnchor: [
            11,
            11
          ],

        });


      // ===================================================
      // Create Leaflet marker
      // ===================================================

      const marker =
        L.marker(
          [
            targetLat,
            targetLon
          ],
          {
            icon:
              koalaIcon,

            interactive:
              false,

            keyboard:
              false,

            zIndexOffset:
              5000,
          }
        );


      marker.addTo(
        map
      );


      activeMarkersRef.current.add(
        marker
      );


      // ===================================================
      // Fade animation
      // ===================================================

      const markerElement =
        marker.getElement();


      if (
        markerElement
      ) {

        markerElement.style.opacity =
          "1";


        markerElement.style.transition =
          "opacity 15s linear";


        // Force browser to apply initial opacity first

        requestAnimationFrame(
          () => {

            requestAnimationFrame(
              () => {

                if (
                  marker.getElement()
                ) {

                  marker.getElement().style.opacity =
                    "0";

                }

              }
            );

          }
        );

      }


      // ===================================================
      // Remove after 15 seconds
      // ===================================================

      window.setTimeout(
        () => {

          if (
            map.hasLayer(
              marker
            )
          ) {

            map.removeLayer(
              marker
            );

          }


          activeMarkersRef.current.delete(
            marker
          );

        },
        15000
      );


      return marker;

    };


  // =======================================================
  // Browser Console API
  // =======================================================

  useEffect(
    () => {

      window.showKoala =
        showKoala;


      console.log(
        "🐨 Koala command ready:"
      );


      console.log(
        "showKoala()"
      );


      console.log(
        "showKoala(lat, lon)"
      );


      return () => {

        delete window.showKoala;


        activeMarkersRef.current.forEach(
          marker => {

            if (
              map.hasLayer(
                marker
              )
            ) {

              map.removeLayer(
                marker
              );

            }

          }
        );


        activeMarkersRef.current.clear();

      };

    },
    [
      map
    ]
  );


  // =======================================================
  // Click Map -> Koala
  // =======================================================

  useMapEvents({

    click:
      event => {

        showKoala(
          event.latlng.lat,
          event.latlng.lng
        );

      },

  });


  return null;

}


// =========================================================
// TrafficMap
//
// Responsibilities:
// - Display lane-based road network
// - Highlight selected route
// - Display simulation vehicles
// - Color vehicles by normalized speed
// - Highlight Ego vehicle
//
// Vehicle color:
//
// current speed / desired speed
//
// 0% ------------------------------ 100%
//
// Red -> Orange -> Yellow -> Lime -> Green
//
// =========================================================

export default function TrafficMap({

  laneGeoJSON,

  selectedRoute = [],

  trafficStreams = [],

  vehicles = [],

  egoVehicleId = null,

  isEgoBraking = false,

  mapCenter = [
    -33.918692602538094, 151.22634405412714
  ],

  zoom = 17,

  t,

}) {

  // =======================================================
  // Selected route lookup
  // =======================================================

  const selectedRouteSet =
    new Set(
      selectedRoute
    );


  const simulationRouteSet =
    new Set(
      trafficStreams.flatMap(
        stream =>
          stream.route ??
          []
      )
    );


  // =======================================================
  // Lane styling
  // =======================================================

  const getLaneStyle =
    feature => {

      const laneId =
        feature
          ?.properties
          ?.lane_id;


      const isSelected =
        selectedRouteSet.has(
          laneId
        );


      const isSimulationRoute =
        simulationRouteSet.has(
          laneId
        );


      // ---------------------------------------------------
      // Current selected route
      // ---------------------------------------------------

      if (
        isSelected
      ) {

        return {

          color:
            "#94a3b8",

          weight:
            6,

          opacity:
            0.6,

        };

      }


      // ---------------------------------------------------
      // Route used by simulation
      // ---------------------------------------------------

      if (
        isSimulationRoute
      ) {

        return {

          color:
            "#16a34a",

          weight:
            5,

          opacity:
            0.85,

        };

      }


      // ---------------------------------------------------
      // Normal lane
      // ---------------------------------------------------

      return {

        color:
          "#2563eb",

        weight:
          4,

        opacity:
          0.6,

      };

    };


  // =======================================================
  // Lane interaction
  // =======================================================

  const onEachLane =
    (
      feature,
      layer
    ) => {

      const laneId =
        feature
          ?.properties
          ?.lane_id ??
        "Unknown lane";


      layer.bindTooltip(
        `<strong>${laneId}</strong>`,
        {
          permanent:
            false,

          direction:
            "top",

          sticky:
            true,

          opacity:
            0.95,
        }
      );


      layer.on({

        click:
          () => {

            layer.openTooltip();


            console.log(
              "Clicked lane:",
              laneId
            );

          },

      });

    };


  // =======================================================
  // Render
  // =======================================================

  return (

    <section
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-hidden
        rounded-lg
      "
      dir="ltr"
    >

      <MapContainer

        center={
          mapCenter
        }

        zoom={
          zoom
        }

        zoomSnap={0.5}
        zoomDelta={0.5}

        className="
          h-full
          w-full
        "
      >

        {/* ================================================
            Base maps
        ================================================= */}

        <KoalaMarkerController />
        <LayersControl
          position="bottomleft"
        >

          <LayersControl.BaseLayer
            name="OpenStreetMap"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

          </LayersControl.BaseLayer>


          <LayersControl.BaseLayer
            checked
            name="Esri Satellite"
          >

            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={
                19
              }
            />

          </LayersControl.BaseLayer>

        </LayersControl>


        {/* ================================================
            Lane-based road network
        ================================================= */}

        {
          laneGeoJSON && (

            <GeoJSON

              data={
                laneGeoJSON
              }

              style={
                getLaneStyle
              }

              onEachFeature={
                onEachLane
              }

            />

          )
        }


        {/* ================================================
            Vehicle layer
        ================================================= */}

        {
          vehicles.map(
            vehicle => {

              if (
                vehicle.lat == null ||
                vehicle.lon == null
              ) {

                return null;

              }


              const isEgo =
                egoVehicleId != null &&
                vehicle.id ===
                  egoVehicleId;


              const speedRatio =
                getVehicleSpeedRatio(
                  vehicle
                );


              const speedPercent =
                speedRatio *
                100;


              const currentSpeedKmh =
                (
                  Number(
                    vehicle.speedMps
                  ) ||
                  0
                ) *
                3.6;


              const desiredSpeedKmh =
                (
                  Number(
                    vehicle.desiredSpeedMps
                  ) ||
                  0
                ) *
                3.6;


              return (

                <Marker

                  key={
                    vehicle.id
                  }

                  position={[
                    vehicle.lat,
                    vehicle.lon
                  ]}

                  icon={
                    createVehicleIcon(
                      vehicle,
                      isEgo,
                      isEgo &&
                        isEgoBraking
                    )
                  }

                  zIndexOffset={
                    isEgo
                      ? 1000
                      : 0
                  }

                >

                  <Tooltip
                    direction="top"
                    offset={[
                      0,
                      -8
                    ]}
                  >

                    <div>

                      <strong>

                        {
                          isEgo
                            ? "EGO Vehicle"
                            : vehicle.id
                        }

                      </strong>


                      {
                        isEgo && (

                          <div
                            style={{
                              marginTop:
                                "3px",

                              fontWeight:
                                600,

                              color:
                                isEgoBraking
                                  ? "#dc2626"
                                  : "#2563eb",
                            }}
                          >

                            {
                              isEgoBraking
                                ? "BRAKING"
                                : vehicle.id
                            }

                          </div>

                        )
                      }


                      <div>

                        Lane:
                        {" "}

                        {
                          vehicle.currentLaneId
                        }

                      </div>


                      <div>

                        Speed:
                        {" "}

                        {
                          currentSpeedKmh.toFixed(
                            1
                          )
                        }

                        {" "}
                        km/h

                      </div>


                      <div>

                        Desired Speed:
                        {" "}

                        {
                          desiredSpeedKmh.toFixed(
                            1
                          )
                        }

                        {" "}
                        km/h

                      </div>


                      <div>

                        Desired-speed ratio:
                        {" "}

                        {
                          speedPercent.toFixed(
                            0
                          )
                        }

                        %

                      </div>


                      {
                        vehicle.accelerationMps2 != null && (

                          <div>

                            Acceleration:
                            {" "}

                            {
                              Number(
                                vehicle.accelerationMps2
                              ).toFixed(
                                2
                              )
                            }

                            {" "}
                            m/s²

                          </div>

                        )
                      }


                      {
                        vehicle.lengthM != null && (

                          <div>

                            Length:
                            {" "}

                            {
                              Number(
                                vehicle.lengthM
                              ).toFixed(
                                1
                              )
                            }

                            {" "}
                            m

                          </div>

                        )
                      }

                    </div>

                  </Tooltip>

                </Marker>

              );

            }
          )
        }

      </MapContainer>


      {/* ==================================================
          Map title
      =================================================== */}
      {
        /**
         * 
         * 
         <div
        className="
          pointer-events-none
          absolute
          right-4
          top-4
          z-[1000]
          rounded-lg
          border
          border-slate-200
          bg-white/95
          px-4
          py-3
          shadow-md
          backdrop-blur
        "
      >

        <div
          className="
            text-sm
            font-semibold
            text-slate-800
          "
        >

          {
            t?.mapTitle ??
            "Lane-based Road Network"
          }

        </div>


        <div
          className="
            mt-1
            text-xs
            text-slate-500
          "
        >

          {
            t?.mapSubtitle ??
            "Microscopic traffic simulation"
          }

        </div>

      </div>
         * 
         */
      }
      


      {/* ==================================================
          Speed color legend
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-4
          top-4
          z-[1000]
          w-[180px]
          rounded-lg
          border
          border-slate-200
          bg-white/95
          px-3
          py-2
          shadow-md
          backdrop-blur
        "
      >

        <div
          className="
            text-[10px]
            font-semibold
            text-slate-700
          "
        >
          Vehicle Speed
        </div>


        <div
          className="
            mt-0.5
            text-[8px]
            text-slate-400
          "
        >
          % of each vehicle's desired speed
        </div>


        <div
          className="
            mt-2
            h-2
            w-full
            rounded-full
          "
          style={{
            background:
              "linear-gradient(to right, rgb(220,38,38) 0%, rgb(249,115,22) 25%, rgb(234,179,8) 50%, rgb(132,204,22) 75%, rgb(22,163,74) 100%)"
          }}
        />


        <div
          className="
            mt-1
            flex
            items-center
            justify-between
            text-[8px]
            text-slate-500
          "
        >

          <span>
            0%
          </span>


          <span>
            50%
          </span>


          <span>
            100%
          </span>

        </div>


        <div
          className="
            mt-0.5
            flex
            items-center
            justify-between
            text-[7px]
            uppercase
            tracking-wide
            text-slate-400
          "
        >

          <span>
            Stopped
          </span>


          <span>
            Desired
          </span>

        </div>

      </div>


      {/* ==================================================
          Vehicle count / Ego status
      =================================================== */}
 

    </section>

  );

}