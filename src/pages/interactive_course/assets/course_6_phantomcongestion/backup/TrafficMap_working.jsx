import React from "react";

import L from "leaflet";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Tooltip,
  LayersControl
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// =========================================================
// Create vehicle marker icon
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
      ? vehicle.lengthM / 4.5
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

            width: ${lengthPx}px;
            height: ${widthPx}px;

            background: #f59e0b;

            border: 1px solid #111827;

            border-radius: 2px;

            box-sizing: border-box;

            transform:
              rotate(${
                -headingDeg
              }deg);

            transform-origin:
              center center;
          "
        >

          <div
            style="
              position: absolute;

              right: 1px;
              top: 1px;

              width: 3px;

              height: ${Math.max(
                widthPx - 4,
                2
              )}px;

              background: white;

              border-radius: 1px;
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
  // Outer wrapper stays horizontal.
  // Vehicle body itself rotates with heading.
  // =======================================================

  const containerWidthPx =
    84;


  const containerHeightPx =
    58;


  const vehicleColor =
    isEgoBraking
      ? "#dc2626"
      : "#2563eb";


  const vehicleBorderColor =
    isEgoBraking
      ? "#7f1d1d"
      : "#1e3a8a";


  const haloColor =
    isEgoBraking
      ? "rgba(220, 38, 38, 0.28)"
      : "rgba(37, 99, 235, 0.28)";


  const labelText =
    isEgoBraking
      ? "BRAKING"
      : "EGO";


  const haloSizePx =
    Math.max(
      lengthPx,
      widthPx
    ) +
    18;


  return L.divIcon({

    className:
      "ego-vehicle-marker-container",

    html: `
      <div
        style="
          position: relative;

          width: ${containerWidthPx}px;
          height: ${containerHeightPx}px;

          pointer-events: none;
        "
      >

        <!-- ==========================================
             Label
        =========================================== -->

        <div
          style="
            position: absolute;

            left: 50%;
            top: 0;

            transform:
              translateX(-50%);

            background:
              ${vehicleColor};

            color:
              white;

            padding:
              2px 7px;

            border-radius:
              4px;

            font-family:
              Arial,
              sans-serif;

            font-size:
              9px;

            line-height:
              13px;

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
                0.3
              );
          "
        >
          ${labelText}
        </div>


        <!-- ==========================================
             Halo
        =========================================== -->

        <div
          style="
            position: absolute;

            left: 50%;
            top: 37px;

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
              ${haloColor};

            border:
              2px solid
              ${vehicleColor};

            box-sizing:
              border-box;
          "
        >
        </div>


        <!-- ==========================================
             Vehicle body
        =========================================== -->

        <div
          style="
            position: absolute;

            left: 50%;
            top: 37px;

            width:
              ${lengthPx}px;

            height:
              ${widthPx}px;

            background:
              ${vehicleColor};

            border:
              2px solid
              ${vehicleBorderColor};

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
                0.4
              );
          "
        >

          <!-- Front / windshield indicator -->

          <div
            style="
              position: absolute;

              right: 1px;
              top: 1px;

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
      37
    ]

  });

}


// =========================================================
// TrafficMap
//
// Responsibilities:
// - Display lane-based road network
// - Highlight selected route
// - Display simulation vehicles
// - Highlight Ego vehicle
//
// It should NOT:
// - Run A*
// - Update vehicle physics
// - Calculate car-following behavior
// =========================================================

export default function TrafficMap({

  laneGeoJSON,

  selectedRoute = [],

  trafficStreams = [],

  vehicles = [],

  egoVehicleId = null,

  isEgoBraking = false,

  mapCenter = [
    -33.89684065544656,
    151.23551856640137
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
            "green",

          weight:
            6,

          opacity:
            0.7,

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
            "green",

          weight:
            5,

          opacity:
            0.95,

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

        className="
          h-full
          w-full
        "
      >

        {/* ================================================
            Base maps
        ================================================= */}

        <LayersControl
          position="bottomleft"
        >

          {/* ----------------------------------------------
              OpenStreetMap
          ----------------------------------------------- */}

          <LayersControl.BaseLayer
            name="OpenStreetMap"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

          </LayersControl.BaseLayer>


          {/* ----------------------------------------------
              Esri satellite imagery
          ----------------------------------------------- */}

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


                      {isEgo && (

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

                      )}


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
                          (
                            (
                              Number(
                                vehicle.speedMps
                              ) ||
                              0
                            ) *
                            3.6
                          ).toFixed(
                            1
                          )
                        }

                        {" "}
                        km/h

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
                        vehicle.desiredSpeedMps != null && (

                          <div>

                            Desired Speed:
                            {" "}

                            {
                              (
                                Number(
                                  vehicle.desiredSpeedMps
                                ) *
                                3.6
                              ).toFixed(
                                1
                              )
                            }

                            {" "}
                            km/h

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
          Map title overlay
      =================================================== */}

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


      {/* ==================================================
          Vehicle count / Ego legend
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-4
          right-4
          z-[1000]

          rounded-md
          border
          border-slate-200
          bg-white/95
          px-3
          py-2
          text-xs
          text-slate-600
          shadow
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span>

            {
              vehicles.length
            }

            {" "}

            {
              t?.vehicleUnit ??
              "vehicles"
            }

          </span>


          {
            egoVehicleId &&
            vehicles.length > 0 && (

              <>

                <span
                  className="
                    text-slate-300
                  "
                >
                  •
                </span>


                <span
                  className={`
                    font-semibold

                    ${
                      isEgoBraking
                        ? "text-red-600"
                        : "text-blue-600"
                    }
                  `}
                >

                  {
                    isEgoBraking
                      ? "EGO BRAKING"
                      : "EGO"
                  }

                </span>

              </>

            )
          }

        </div>

      </div>

    </section>

  );

}