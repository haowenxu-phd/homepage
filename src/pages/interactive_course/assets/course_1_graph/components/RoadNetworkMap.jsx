import React from "react";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    useMap,
    useMapEvents,
} from "react-leaflet";


function MapClickHandler({ onClearSelection }) {
  useMapEvents({
    click: () => {
      onClearSelection();
    },
  });

  return null;
}

function LaneFocusController({
  roadNetwork,
  selectedLaneId,
  hoveredLaneId,
}) {
  const map = useMap();

  React.useEffect(() => {
    // ==========================================================
    // Hover has temporary priority.
    // If nothing is hovered, use persistent selection.
    // ==========================================================

    const focusLaneId =
      hoveredLaneId ?? selectedLaneId;

    if (!focusLaneId) {
      return;
    }

    // ==========================================================
    // Find matching GeoJSON lane
    // ==========================================================

    const feature =
      roadNetwork?.features?.find(
        (feature) =>
          feature?.properties?.lane_id ===
          focusLaneId
      );

    if (!feature) {
      console.warn(
        "Leaflet could not find lane:",
        focusLaneId
      );

      return;
    }

    // ==========================================================
    // Let Leaflet calculate the bounds directly.
    //
    // This is better than manually converting
    // [longitude, latitude] -> [latitude, longitude].
    //
    // It also works for LineString / MultiLineString.
    // ==========================================================

    const temporaryLayer =
      L.geoJSON(feature);

    const bounds =
      temporaryLayer.getBounds();

    if (!bounds.isValid()) {
      return;
    }

    // ==========================================================
    // Fly to lane
    // ==========================================================

    map.flyToBounds(bounds, {
      padding: [60, 60],
      maxZoom: 19,
      duration: 0.4,
    });

  }, [
    selectedLaneId,
    //hoveredLaneId,
    roadNetwork,
    map,
  ]);

  return null;
}


function HoveredLaneZoom({
      roadNetwork,
      hoveredLaneId,
    }) {

      const map =
        useMap();


      React.useEffect(() => {

        if (!hoveredLaneId) {
          return;
        }


        // ==========================================================
        // Find corresponding GeoJSON feature
        // ==========================================================

        const feature =
          roadNetwork?.features?.find(
            (feature) =>
              feature?.properties?.lane_id ===
              hoveredLaneId
          );


        if (!feature) {
          return;
        }


        const coordinates =
          feature?.geometry?.coordinates;


        if (
          !coordinates ||
          coordinates.length === 0
        ) {
          return;
        }


        // ==========================================================
        // GeoJSON uses:
        //
        // [longitude, latitude]
        //
        // Leaflet uses:
        //
        // [latitude, longitude]
        // ==========================================================

        const latLngs =
          coordinates.map(
            ([lng, lat]) => [
              lat,
              lng,
            ]
          );


        // ==========================================================
        // Create bounds around selected lane
        // ==========================================================

        const bounds =
          L.latLngBounds(
            latLngs
          );


        // ==========================================================
        // Zoom / pan to lane
        // ==========================================================

        map.flyToBounds(
            bounds,
            {
              padding: [
                60,
                60,
              ],

              maxZoom:
                19,

              duration:
                0.4,
            }
          );


      }, [
        hoveredLaneId,
        roadNetwork,
        map,
      ]);


      return null;
    }

export default function RoadNetworkMap({
  roadNetwork,
  selectedLaneId,
  hoveredLaneId,
  onSelectLane,
  onHoverLane,
}) {

  // ============================================================
  // Map center
  // UNSW Kensington campus
  // ============================================================

  const mapCenter = [
    -33.91941827274292,
    151.22645894264798,
  ];


  // ============================================================
  // Style each road segment
  // ============================================================

  const roadStyle = (feature) => {

        const laneId =
          feature?.properties?.lane_id;


        const isSelected =
          laneId === selectedLaneId;


        const isHovered =
          laneId === hoveredLaneId;


        // ============================================================
        // D3 node is currently being hovered
        // ============================================================

        if (hoveredLaneId) {

          // Corresponding Leaflet lane
          if (isHovered) {

            return {
              color: "#ff0000",
              weight: 10,
              opacity: 1,
            };

          }


          // Everything else becomes transparent
          return {
            color: "#00aaff",
            weight: 6,
            opacity: 0.3,
          };

        }


        // ============================================================
        // Persistent clicked selection
        // ============================================================

        if (isSelected) {

          return {
            color: "#ff0000",
            weight: 10,
            opacity: 1,
          };

        }


        // ============================================================
        // Normal display
        // ============================================================

        return {
          color: "#00aaff",
          weight: 6,
          opacity: 0.8,
        };

      };


  // ============================================================
  // Add interaction to every GeoJSON feature
  // ============================================================

  const onEachRoadFeature = (
      feature,
      layer
    ) => {

      const laneId =
        feature?.properties?.lane_id;

      const roadName =
        feature?.properties?.road_name;


      if (!laneId) {
        return;
      }


      // ============================================================
      // Tooltip
      // ============================================================

      layer.bindTooltip(
        `Lane ID: ${laneId}<br/>Road Name: ${roadName ?? "Unknown"}`,
        {
          sticky: true,
        }
      );


      // ============================================================
      // Leaflet -> linked views
      // ============================================================

      layer.on({

        // ----------------------------------------------------------
        // Hover road
        // ----------------------------------------------------------

        mouseover: () => {

          onHoverLane(
            laneId
          );

        },


        // ----------------------------------------------------------
        // Leave road
        // ----------------------------------------------------------

        mouseout: () => {

          onHoverLane(
            null
          );

        },


        // ----------------------------------------------------------
        // Click road
        // ----------------------------------------------------------

        click: (event) => {

          L.DomEvent.stopPropagation(
            event.originalEvent
          );

          onSelectLane(
            laneId
          );

        },

      });

    };


  // ============================================================
  // Render
  // ============================================================

  return (

    <MapContainer

      center={mapCenter}

      zoom={18}

      style={{
        width: "100%",
        height: "100%",
        minHeight: "420px",
      }}

    >


    {/* ======================================================
            Add D3 Events
        ====================================================== */}

      <LaneFocusController
          roadNetwork={roadNetwork}
          selectedLaneId={selectedLaneId}
          hoveredLaneId={hoveredLaneId}
        />


    {/* ======================================================
            Map Onclik deselect
        ====================================================== */}


        <MapClickHandler
            onClearSelection={() => onSelectLane(null)}
        />



      {/* ======================================================
          Esri World Imagery
      ====================================================== */}

      <TileLayer
        attribution="Tiles &copy; Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />


      {/* ======================================================
          UNSW Lane Network
      ====================================================== */}

      <GeoJSON

        key={
          selectedLaneId ??
          "no-selection"
        }

        data={
          roadNetwork
        }

        style={
          roadStyle
        }

        onEachFeature={
          onEachRoadFeature
        }

      />

    </MapContainer>

  );

}