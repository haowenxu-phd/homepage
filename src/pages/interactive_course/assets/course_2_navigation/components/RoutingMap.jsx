import React, {
  useEffect,
  useRef,
} from "react";

import L from "leaflet";

import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";


// ============================================================
// Custom OD marker icons
// ============================================================

const originIcon = L.divIcon({

  className: "",

  html: `
    <div
      style="
        width: 20px;
        height: 20px;
        background: #dc2626;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 5px rgba(0,0,0,0.45);
      "
    ></div>
  `,

  iconSize: [
    20,
    20,
  ],

  iconAnchor: [
    10,
    10,
  ],

});


const destinationIcon = L.divIcon({

  className: "",

  html: `
    <div
      style="
        width: 20px;
        height: 20px;
        background: #2563eb;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 5px rgba(0,0,0,0.45);
      "
    ></div>
  `,

  iconSize: [
    20,
    20,
  ],

  iconAnchor: [
    10,
    10,
  ],

});


// ============================================================
// Fit map to Origin + Destination
// ============================================================

function FitODBounds({
  origin,
  destination,
}) {

  const map =
    useMap();


  useEffect(() => {

    if (
      !origin ||
      !destination
    ) {

      return;

    }


    const originLat =
      Number(
        origin.lat
      );


    const originLng =
      Number(
        origin.lng
      );


    const destinationLat =
      Number(
        destination.lat
      );


    const destinationLng =
      Number(
        destination.lng
      );


    if (
      !Number.isFinite(
        originLat
      ) ||
      !Number.isFinite(
        originLng
      ) ||
      !Number.isFinite(
        destinationLat
      ) ||
      !Number.isFinite(
        destinationLng
      )
    ) {

      return;

    }


    const bounds =
      L.latLngBounds([
        [
          originLat,
          originLng,
        ],
        [
          destinationLat,
          destinationLng,
        ],
      ]);


    map.fitBounds(
      bounds,
      {

        padding: [
          80,
          80,
        ],

        maxZoom:
          16,

        animate:
          true,

        duration:
          0.6,

      }
    );

  }, [
    map,
    origin,
    destination,
  ]);


  return null;

}


// ============================================================
// Routing Map
// ============================================================

export default function RoutingMap({

  roadNodes,
  roadEdges,
  routingGraph,

  currentStep,

  origin,
  destination,

  setOrigin,
  setDestination,

  originNodeId,
  destinationNodeId,

  setOriginNodeId,
  setDestinationNodeId,

  waypoints,
  setWaypoints,

  searchState,
  routeResult,

  closedEdgeIds,

}) {

  // ==========================================================
  // GeoJSON Leaflet layer reference
  // ==========================================================

  const roadLayerRef =
    useRef(null);


  // ==========================================================
  // Default map center
  // ==========================================================

  const mapCenter = [
    -33.921,
    151.24,
  ];


  // ==========================================================
  // Resolve a GeoJSON feature into the SAME edge ID format
  // used by the routing graph:
  //
  // u-v-key
  //
  // Example:
  //
  // 6207700448-1804572098-0
  // ==========================================================

  const getFeatureEdgeId =
    (feature) => {

      const properties =
        feature?.properties ??
        {};


      // ------------------------------------------------------
      // If edge_id already exists, use it.
      // ------------------------------------------------------

      if (
        properties.edge_id != null
      ) {

        return String(
          properties.edge_id
        );

      }


      // ------------------------------------------------------
      // OSMnx edge:
      //
      // u
      // v
      // key
      //
      // Reconstruct the routing-graph edge ID.
      // ------------------------------------------------------

      if (
        properties.u != null &&
        properties.v != null
      ) {

        return `${String(
          properties.u
        )}-${String(
          properties.v
        )}-${String(
          properties.key ?? 0
        )}`;

      }


      // ------------------------------------------------------
      // Fall back only if needed.
      // ------------------------------------------------------

      if (
        properties.id != null
      ) {

        return String(
          properties.id
        );

      }


      if (
        properties.osmid != null
      ) {

        return String(
          properties.osmid
        );

      }


      return null;

    };


  // ==========================================================
  // Build fast lookup Sets
  //
  // These are recreated each render.
  // Fine for this network size.
  // ==========================================================

  const routeEdgeIdSet =
    new Set(
      (
        routeResult?.edgeIds ??
        routeResult?.laneIds ??
        []
      ).map(
        String
      )
    );


  const visitedEdgeIdSet =
    new Set(
      (
        searchState?.visitedEdgeIds ??
        searchState?.visitedLaneIds ??
        []
      ).map(
        String
      )
    );


  const closedEdgeIdSet =
    new Set(
      (
        closedEdgeIds ??
        []
      ).map(
        String
      )
    );


  // ==========================================================
  // Edge styling
  // ==========================================================

  const roadStyle =
    (feature) => {

      const edgeId =
        getFeatureEdgeId(
          feature
        );


      // ------------------------------------------------------
      // Closed road
      // ------------------------------------------------------

      if (
        edgeId != null &&
        closedEdgeIdSet.has(
          edgeId
        )
      ) {

        return {

          color:
            "#ef4444",

          weight:
            8,

          opacity:
            1,

        };

      }


      // ------------------------------------------------------
      // Final route
      //
      // Give final route highest visible priority after
      // closed-road styling.
      // ------------------------------------------------------

      if (
        edgeId != null &&
        routeEdgeIdSet.has(
          edgeId
        )
      ) {

        return {

          color:
            "#22c55e",

          weight:
            9,

          opacity:
            1,

        };

      }


      // ------------------------------------------------------
      // Search animation
      // ------------------------------------------------------

      if (
        edgeId != null &&
        visitedEdgeIdSet.has(
          edgeId
        )
      ) {

        return {

          color:
            "#f59e0b",

          weight:
            8,

          opacity:
            1,

        };

      }


      // ------------------------------------------------------
      // Default road network
      // ------------------------------------------------------

      return {

        color:
          "#00aaff",

        weight:
          5,

        opacity:
          0.8,

      };

    };


  // ==========================================================
  // IMPORTANT:
  //
  // Explicitly restyle existing Leaflet GeoJSON layer whenever
  // animation / route state changes.
  //
  // This is what makes the 0.5-second animation visible.
  // ==========================================================

  useEffect(() => {

    if (
      !roadLayerRef.current
    ) {

      return;

    }

    /*
    console.log(
      "Leaflet road restyle:",
      {

        iteration:
          searchState?.iteration ??
          null,

        visitedEdges:
          searchState
            ?.visitedEdgeIds
            ?.length ??
          0,

        routeEdges:
          routeResult
            ?.edgeIds
            ?.length ??
          0,

      }
    );
*/

    roadLayerRef
      .current
      .setStyle(
        roadStyle
      );

  }, [
    searchState,
    routeResult,
    closedEdgeIds,
  ]);


  // ==========================================================
  // Edge tooltip / interaction
  // ==========================================================

  const onEachRoadFeature =
    (
      feature,
      layer
    ) => {

      const properties =
        feature?.properties ??
        {};


      const roadName =
        properties.name ??
        properties.road_name ??
        properties.ref ??
        "Unknown";


      const edgeId =
        getFeatureEdgeId(
          feature
        );


      layer.bindTooltip(

        `
          Road: ${roadName}
          <br/>
          Edge ID: ${edgeId ?? "Unknown"}
        `,

        {
          sticky:
            true,
        }

      );

    };


  // ==========================================================
  // Render
  // ==========================================================

  return (

    <MapContainer

      center={
        mapCenter
      }

      zoom={
        15
      }

      style={{

        width:
          "100%",

        height:
          "100%",

        minHeight:
          "520px",

      }}

    >

      {/* ====================================================
          Basemap
      ==================================================== */}

      <TileLayer

        attribution="Tiles &copy; Esri"

        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

      />


      {/* ====================================================
          Automatically fit map to O + D
      ==================================================== */}

      <FitODBounds

        origin={
          origin
        }

        destination={
          destination
        }

      />


      {/* ====================================================
          Road network
      ==================================================== */}

      {roadEdges && (

        <GeoJSON

          ref={
            roadLayerRef
          }

          data={
            roadEdges
          }

          style={
            roadStyle
          }

          onEachFeature={
            onEachRoadFeature
          }

        />

      )}


      {/* ====================================================
          Origin
      ==================================================== */}

      {origin && (

        <Marker

          position={[
            origin.lat,
            origin.lng,
          ]}

          icon={
            originIcon
          }

          draggable

          eventHandlers={{

            dragend:
              (
                event
              ) => {

                const position =
                  event
                    .target
                    .getLatLng();


                setOrigin?.({

                  lat:
                    position.lat,

                  lng:
                    position.lng,

                });


                // Marker moved:
                // previous graph snap is no longer valid.

                setOriginNodeId?.(
                  null
                );

              },

          }}

        />

      )}


      {/* ====================================================
          Destination
      ==================================================== */}

      {destination && (

        <Marker

          position={[
            destination.lat,
            destination.lng,
          ]}

          icon={
            destinationIcon
          }

          draggable

          eventHandlers={{

            dragend:
              (
                event
              ) => {

                const position =
                  event
                    .target
                    .getLatLng();


                setDestination?.({

                  lat:
                    position.lat,

                  lng:
                    position.lng,

                });


                setDestinationNodeId?.(
                  null
                );

              },

          }}

        />

      )}

    </MapContainer>

  );

}