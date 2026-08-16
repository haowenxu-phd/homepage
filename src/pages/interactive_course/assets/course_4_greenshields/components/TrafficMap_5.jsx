import React from "react";
import TrafficSignalLayer
  from "./TrafficSignalLayer";

import {
  getTrafficSignalState
} from "../simulation/trafficControl/signalTiming";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Tooltip,
  LayersControl 
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


    function createVehicleIcon(
      vehicle
    ) {

      // Make it deliberately long for testing rotation.
      const baseLengthPx =
        12;

      const baseWidthPx =
        8;


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


      const headingDeg =
        Number(
          vehicle.headingDeg
        ) || 0;


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

// =========================================================
// TrafficMap
//
// Responsibilities:
// - Display lane-based road network
// - Highlight selected route
// - Display vehicles later
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

      trafficSignals = [],

      simulationTime = 0,

      mapCenter = [
        -33.9195,
        151.2255,
      ],

      zoom = 17,

      t,
}) {

  // -------------------------------------------------------
  // Selected route lookup
  //
  // Set is faster/cleaner than repeatedly calling
  // selectedRoute.includes(...)
  // -------------------------------------------------------

  const selectedRouteSet =
    new Set(selectedRoute);

    const simulationRouteSet =
  new Set(
    trafficStreams.flatMap(
      stream =>
        stream.route ?? []
    )
  );

  // -------------------------------------------------------
  // Lane styling
  //
  // GeoJSON gives us each feature here.
  // We use lane_id to determine whether it belongs
  // to the currently selected A* route.
  // -------------------------------------------------------

      const getLaneStyle = (
        feature
      ) => {

        const laneId =
          feature?.properties?.lane_id;


        const isSelected =
          selectedRouteSet.has(
            laneId
          );


        const isSimulationRoute =
          simulationRouteSet.has(
            laneId
          );


        // Current manually selected route
        if (
          isSelected
        ) {

          return {
            color: "green",
            weight: 6,
            opacity: 0.7,
          };

        }


        // Any route currently used by traffic simulation
        if (
          isSimulationRoute
        ) {

          return {
            color: "green",
            weight: 5,
            opacity: 0.95,
          };

        }


        // Normal lane
        return {
          color: "#2563eb",
          weight: 4,
          opacity: 0.6,
        };

      };


  // -------------------------------------------------------
  // Optional interaction for each lane
  // -------------------------------------------------------

  const onEachLane = (
    feature,
    layer
    ) => {

    const laneId =
        feature?.properties?.lane_id
        ?? "Unknown lane";


    layer.bindTooltip(
        `<strong>${laneId}</strong>`,
        {
        permanent: false,
        direction: "top",
        sticky: true,
        opacity: 0.95,
        }
    );


    layer.on({
        click: () => {

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
        maxZoom={19}
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
    Traffic signals
      ================================================= */}

      <TrafficSignalLayer

        signals={
          trafficSignals
        }

        simulationTimeS={
          simulationTime
        }

        getSignalState={
          getTrafficSignalState
        }

      />


  {/* ================================================
      Vehicle layer
  ================================================= */}

  {
    vehicles.map(
      (vehicle) => {

        if (
          vehicle.lat == null ||
          vehicle.lon == null
        ) {

          return null;

        }


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
                vehicle
              )
            }
          >

            <Tooltip>

              <div>

                <strong>
                  {vehicle.id}
                </strong>


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
                      vehicle.speedMps *
                      3.6
                    ).toFixed(1)
                  }
                  {" "}
                  km/h
                </div>


                {
                  vehicle.desiredSpeedMps != null && (

                    <div>
                      Desired Speed:
                      {" "}
                      {
                        (
                          vehicle.desiredSpeedMps *
                          3.6
                        ).toFixed(1)
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
                        vehicle.lengthM.toFixed(1)
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
            t?.mapTitle
            ?? "Lane-based Road Network"
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
            t?.mapSubtitle
            ?? "Microscopic traffic simulation"
          }

        </div>

      </div>


      {/* ==================================================
          Vehicle count overlay
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

        {
          vehicles.length
        }
        {" "}
        {
          t?.vehicleUnit
          ?? "vehicles"
        }

      </div>

    </section>

  );

}