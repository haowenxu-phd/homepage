// =========================================================
// laneMovement.js
// =========================================================
//
// Closed-loop capable lane movement.
//
// routingGraph:
//   topology / lane connectivity
//
// laneGeoJSON:
//   geographic LineString geometry
//
// =========================================================


// =========================================================
// Distance between two XY points
// =========================================================

function distance2D(
  pointA,
  pointB
) {

  const dx =
    pointB[0] -
    pointA[0];

  const dy =
    pointB[1] -
    pointA[1];


  return Math.sqrt(
    dx * dx +
    dy * dy
  );
}


// =========================================================
// Convert longitude / latitude geometry
// into local XY coordinates in metres
// =========================================================

function lonLatToLocalXY(
  geometryLonLat
) {

  if (
    !Array.isArray(
      geometryLonLat
    ) ||
    geometryLonLat.length === 0
  ) {
    return [];
  }


  const [
    originLon,
    originLat
  ] =
    geometryLonLat[0];


  const metersPerDegreeLat =
    111320;


  const metersPerDegreeLon =
    111320 *
    Math.cos(
      originLat *
      Math.PI /
      180
    );


  return geometryLonLat.map(
    ([lon, lat]) => {

      const x =
        (
          lon -
          originLon
        ) *
        metersPerDegreeLon;


      const y =
        (
          lat -
          originLat
        ) *
        metersPerDegreeLat;


      return [
        x,
        y
      ];

    }
  );
}


// =========================================================
// Find lane geometry
//
// First try routingGraph.
// If geometry is not stored there,
// fall back to GeoJSON.
// =========================================================

function getLaneGeometry(
  laneId,
  routingGraph,
  laneGeoJSON
) {

  const graphLane =
    routingGraph?.lanes?.[
      laneId
    ];


  // -------------------------------------------------------
// Old UNSW graph format
// -------------------------------------------------------

  if (
    Array.isArray(
      graphLane?.geometry_xy
    ) &&
    Array.isArray(
      graphLane?.geometry_lonlat
    )
  ) {

    return {

      graphLane,

      geometryXY:
        graphLane.geometry_xy,

      geometryLonLat:
        graphLane.geometry_lonlat,

    };

  }


  // -------------------------------------------------------
// Centennial Park GeoJSON format
// -------------------------------------------------------

  const feature =
    laneGeoJSON?.features?.find(
      item => {

        const featureLaneId =
          item?.properties?.lane_id ??
          item?.id;


        return (
          featureLaneId ===
          laneId
        );

      }
    );


  if (!feature) {

    console.error(
      `GeoJSON geometry not found for lane: ${laneId}`
    );

    return null;
  }


  const geometryLonLat =
    feature?.geometry?.coordinates;


  if (
    !Array.isArray(
      geometryLonLat
    ) ||
    geometryLonLat.length < 2
  ) {

    console.error(
      `Invalid LineString geometry for lane: ${laneId}`
    );

    return null;
  }


  const geometryXY =
    lonLatToLocalXY(
      geometryLonLat
    );


  return {

    graphLane,

    geometryXY,

    geometryLonLat,

  };
}


// =========================================================
// Determine whether a lane is a closed loop
// =========================================================

function isClosedLoopLane(
  laneId,
  routingGraph
) {

  const lane =
    routingGraph?.lanes?.[
      laneId
    ];


  if (!lane) {
    return false;
  }


  const downstream =
    lane.downstream ?? [];


  const upstream =
    lane.upstream ?? [];


  return (
    downstream.includes(
      laneId
    ) ||
    upstream.includes(
      laneId
    )
  );
}


// =========================================================
// Move vehicle
// =========================================================

export function moveVehicle(
  vehicle,
  routingGraph,
  laneGeoJSON,
  dt
) {

  if (
    vehicle.finished ||
    vehicle.speedMps <= 0
  ) {

    return vehicle;

  }


  // =======================================================
  // Distance vehicle should move in this frame
  // =======================================================

  let distanceRemaining =
    vehicle.speedMps *
    dt;


  // Safety guard against an accidental infinite loop
  let iterationCount =
    0;


  const MAX_ITERATIONS =
    1000;


  // =======================================================
  // Consume movement distance
  // =======================================================

  while (
    distanceRemaining > 0 &&
    !vehicle.finished &&
    iterationCount <
      MAX_ITERATIONS
  ) {

    iterationCount +=
      1;


    // =====================================================
    // Retrieve current lane geometry
    // =====================================================

    const laneData =
      getLaneGeometry(
        vehicle.currentLaneId,
        routingGraph,
        laneGeoJSON
      );


    if (!laneData) {

      console.error(
        "Could not retrieve lane geometry:",
        vehicle.currentLaneId
      );


      vehicle.finished =
        true;


      break;
    }


    const {
      geometryXY,
      geometryLonLat,
    } =
      laneData;


    // =====================================================
    // Current segment
    // =====================================================

    const segmentIndex =
      vehicle.segmentIndex;


    const startXY =
      geometryXY[
        segmentIndex
      ];


    const endXY =
      geometryXY[
        segmentIndex + 1
      ];


    // =====================================================
    // No more geometry segments
    // =====================================================

    if (
      !startXY ||
      !endXY
    ) {

      moveToNextLane(
        vehicle,
        routingGraph,
        laneGeoJSON
      );


      continue;
    }


    // =====================================================
    // Heading
    // =====================================================

    const dx =
      endXY[0] -
      startXY[0];


    const dy =
      endXY[1] -
      startXY[1];


    vehicle.headingRad =
      Math.atan2(
        dy,
        dx
      );


    vehicle.headingDeg =
      vehicle.headingRad *
      180 /
      Math.PI;


    // =====================================================
    // Current segment length
    // =====================================================

    const segmentLengthM =
      distance2D(
        startXY,
        endXY
      );


    // =====================================================
    // Skip zero-length segments
    // =====================================================

    if (
      segmentLengthM <=
      0.000001
    ) {

      vehicle.segmentIndex +=
        1;


      vehicle.distanceAlongSegmentM =
        0;


      continue;
    }


    const segmentRemainingM =
      Math.max(
        0,
        segmentLengthM -
          vehicle.distanceAlongSegmentM
      );


    // =====================================================
    // CASE 1
    //
    // Vehicle remains on current geometry segment
    // =====================================================

    if (
      distanceRemaining <
      segmentRemainingM
    ) {

      const distanceMoved =
        distanceRemaining;


      vehicle.distanceAlongSegmentM +=
        distanceMoved;


      vehicle.distanceAlongLaneM +=
        distanceMoved;


      distanceRemaining =
        0;


      updateInterpolatedPosition(
        vehicle,
        geometryXY,
        geometryLonLat,
        segmentLengthM
      );


      break;
    }


    // =====================================================
    // CASE 2
    //
    // Vehicle reaches end of current segment
    // =====================================================

    distanceRemaining -=
      segmentRemainingM;


    vehicle.distanceAlongSegmentM =
      segmentLengthM;


    vehicle.distanceAlongLaneM +=
      segmentRemainingM;


    // Put vehicle exactly at segment endpoint

    updateInterpolatedPosition(
      vehicle,
      geometryXY,
      geometryLonLat,
      segmentLengthM
    );


    // =====================================================
    // More geometry segments remain on this lane
    // =====================================================

    if (
      segmentIndex + 2 <
      geometryXY.length
    ) {

      vehicle.segmentIndex +=
        1;


      vehicle.distanceAlongSegmentM =
        0;


      continue;
    }


    // =====================================================
    // End of lane reached
    // =====================================================

    moveToNextLane(
      vehicle,
      routingGraph,
      laneGeoJSON
    );

  }


  if (
    iterationCount >=
    MAX_ITERATIONS
  ) {

    console.error(
      "Vehicle movement exceeded safety iteration limit:",
      vehicle.id
    );

  }


  return vehicle;
}


// =========================================================
// Update interpolated position
// =========================================================

function updateInterpolatedPosition(
  vehicle,
  geometryXY,
  geometryLonLat,
  segmentLengthM
) {

  const i =
    vehicle.segmentIndex;


  const startXY =
    geometryXY[i];


  const endXY =
    geometryXY[
      i + 1
    ];


  const startLonLat =
    geometryLonLat[i];


  const endLonLat =
    geometryLonLat[
      i + 1
    ];


  if (
    !startXY ||
    !endXY ||
    !startLonLat ||
    !endLonLat
  ) {

    console.error(
      "Invalid geometry during interpolation:",
      {
        vehicleId:
          vehicle.id,

        laneId:
          vehicle.currentLaneId,

        segmentIndex:
          i,
      }
    );


    return;

  }


  const fraction =
    Math.min(
      Math.max(
        vehicle.distanceAlongSegmentM /
          segmentLengthM,
        0
      ),
      1
    );


  // =======================================================
  // XY position
  // =======================================================

  vehicle.x =
    startXY[0] +
    fraction *
      (
        endXY[0] -
        startXY[0]
      );


  vehicle.y =
    startXY[1] +
    fraction *
      (
        endXY[1] -
        startXY[1]
      );


  // =======================================================
  // Geographic position
  // =======================================================

  vehicle.lon =
    startLonLat[0] +
    fraction *
      (
        endLonLat[0] -
        startLonLat[0]
      );


  vehicle.lat =
    startLonLat[1] +
    fraction *
      (
        endLonLat[1] -
        startLonLat[1]
      );
}


// =========================================================
// Move vehicle to next lane
// =========================================================

function moveToNextLane(
  vehicle,
  routingGraph,
  laneGeoJSON
) {

  const currentLaneId =
    vehicle.currentLaneId;


  // =======================================================
  // SPECIAL CASE:
  // Closed-loop lane
  //
  // lane_0042 -> lane_0042
  //
  // Instead of finishing the vehicle,
  // return it to the beginning of the same lane.
  // =======================================================

  if (
    isClosedLoopLane(
      currentLaneId,
      routingGraph
    )
  ) {

    vehicle.routeIndex =
      0;


    vehicle.currentLaneId =
      currentLaneId;


    vehicle.segmentIndex =
      0;


    vehicle.distanceAlongSegmentM =
      0;


    vehicle.distanceAlongLaneM =
      0;


    vehicle.finished =
      false;


    // -----------------------------------------------------
    // Snap to beginning of loop
    // -----------------------------------------------------

    const laneData =
      getLaneGeometry(
        currentLaneId,
        routingGraph,
        laneGeoJSON
      );


    if (!laneData) {

      console.error(
        "Unable to restart loop lane:",
        currentLaneId
      );


      vehicle.finished =
        true;


      return;

    }


    const firstXY =
      laneData.geometryXY[0];


    const firstLonLat =
      laneData.geometryLonLat[0];


    if (
      !firstXY ||
      !firstLonLat
    ) {

      console.error(
        "Loop start geometry missing:",
        currentLaneId
      );


      vehicle.finished =
        true;


      return;

    }


    vehicle.x =
      firstXY[0];


    vehicle.y =
      firstXY[1];


    vehicle.lon =
      firstLonLat[0];


    vehicle.lat =
      firstLonLat[1];


    // -----------------------------------------------------
    // Initial heading after wrapping
    // -----------------------------------------------------

    if (
      laneData.geometryXY.length >=
      2
    ) {

      const secondXY =
        laneData.geometryXY[1];


      const dx =
        secondXY[0] -
        firstXY[0];


      const dy =
        secondXY[1] -
        firstXY[1];


      vehicle.headingRad =
        Math.atan2(
          dy,
          dx
        );


      vehicle.headingDeg =
        vehicle.headingRad *
        180 /
        Math.PI;

    }


    return;

  }


  // =======================================================
  // NORMAL MULTI-LANE ROUTE
  // =======================================================

  if (
    vehicle.routeIndex >=
    vehicle.route.length - 1
  ) {

    vehicle.finished =
      true;


    vehicle.speedMps =
      0;


    console.log(
      `${vehicle.id} reached destination.`
    );


    return;

  }


  // =======================================================
  // Move to next lane in route
  // =======================================================

  vehicle.routeIndex +=
    1;


  vehicle.currentLaneId =
    vehicle.route[
      vehicle.routeIndex
    ];


  vehicle.segmentIndex =
    0;


  vehicle.distanceAlongSegmentM =
    0;


  vehicle.distanceAlongLaneM =
    0;


  // =======================================================
  // Snap to first coordinate
  // =======================================================

  const laneData =
    getLaneGeometry(
      vehicle.currentLaneId,
      routingGraph,
      laneGeoJSON
    );


  if (!laneData) {

    console.error(
      "Next lane not found:",
      vehicle.currentLaneId
    );


    vehicle.finished =
      true;


    return;

  }


  const firstXY =
    laneData.geometryXY[0];


  const firstLonLat =
    laneData.geometryLonLat[0];


  if (
    !firstXY ||
    !firstLonLat
  ) {

    console.error(
      "Next lane geometry missing:",
      vehicle.currentLaneId
    );


    vehicle.finished =
      true;


    return;

  }


  vehicle.x =
    firstXY[0];


  vehicle.y =
    firstXY[1];


  vehicle.lon =
    firstLonLat[0];


  vehicle.lat =
    firstLonLat[1];


  console.log(
    `${vehicle.id} entered ${vehicle.currentLaneId}`
  );
}