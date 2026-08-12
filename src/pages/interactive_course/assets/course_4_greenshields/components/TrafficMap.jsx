import React from "react";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


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

  vehicles = [],

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

    if (isSelected) {

      return {
        color: "#ef4444",
        weight: 6,
        opacity: 1,
      };

    }

    return {
      color: "#2563eb",
      weight: 3,
      opacity: 0.75,
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
            Base map
        ================================================= */}

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


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
           
            Temporary implementation.
            Later move this into VehicleLayer.jsx.
        ================================================= */}

        {
          vehicles.map(
            (vehicle) => {

              if (
                vehicle.lat == null
                ||
                vehicle.lon == null
              ) {

                return null;

              }

              return (

                <CircleMarker
                  key={
                    vehicle.id
                  }
                  center={[
                    vehicle.lat,
                    vehicle.lon,
                  ]}
                  radius={
                    5
                  }
                  pathOptions={{
                    color: "#111827",
                    fillColor: "#f59e0b",
                    fillOpacity: 1,
                    weight: 1,
                  }}
                >

                  <Tooltip>

                    <div>

                      <div>
                        <strong>
                          {vehicle.id}
                        </strong>
                      </div>

                      <div>
                        Lane:
                        {" "}
                        {
                          vehicle.currentLaneId
                          ?? "—"
                        }
                      </div>

                      <div>
                        Speed:
                        {" "}
                        {
                          vehicle.speedMps
                          != null
                            ? (
                                vehicle.speedMps
                                * 3.6
                              ).toFixed(1)
                            : "—"
                        }
                        {" "}
                        km/h
                      </div>

                    </div>

                  </Tooltip>

                </CircleMarker>

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
          left-4
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