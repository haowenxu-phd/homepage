// =========================================================
// laneMovement.js
// =========================================================
//
// Move one vehicle through:
//
// route
//   ↓
// lane
//   ↓
// geometry segment
//   ↓
// interpolated position
//
// geometry_xy     -> movement / distance calculation
// geometry_lonlat -> Leaflet rendering
//
// =========================================================


function distance2D(
  pointA,
  pointB
) {

  const dx =
    pointB[0] - pointA[0];

  const dy =
    pointB[1] - pointA[1];

  return Math.sqrt(
    dx * dx +
    dy * dy
  );
}


// =========================================================
// Move vehicle
// =========================================================

export function moveVehicle(
  vehicle,
  routingGraph,
  dt
) {

  if (
    vehicle.finished ||
    vehicle.speedMps <= 0
  ) {
    return vehicle;
  }


  // How far should the car travel during this timestep?

  let distanceRemaining =
    vehicle.speedMps * dt;


  // =======================================================
  // Keep consuming distance
  //
  // A single timestep may cross:
  //
  // - one geometry vertex
  // - several geometry vertices
  // - even a lane boundary
  // =======================================================

  while (
    distanceRemaining > 0 &&
    !vehicle.finished
  ) {

    const lane =
      routingGraph.lanes[
        vehicle.currentLaneId
      ];


    if (!lane) {

      console.error(
        "Lane not found:",
        vehicle.currentLaneId
      );

      vehicle.finished = true;

      break;
    }


    const geometryXY =
      lane.geometry_xy;

    const geometryLonLat =
      lane.geometry_lonlat;


    // -----------------------------------------------------
    // Current segment
    //
    // segmentIndex = 0:
    // point 0 -> point 1
    //
    // segmentIndex = 1:
    // point 1 -> point 2
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // Current lane has no more segments
    // -----------------------------------------------------

    if (
      !startXY ||
      !endXY
    ) {

      moveToNextLane(
        vehicle,
        routingGraph
      );

      continue;
    }


    const segmentLengthM =
      distance2D(
        startXY,
        endXY
      );


    // Avoid zero-length geometry
    if (
      segmentLengthM <= 0
    ) {

      vehicle.segmentIndex += 1;

      vehicle.distanceAlongSegmentM = 0;

      continue;
    }


    const segmentRemainingM =
      segmentLengthM -
      vehicle.distanceAlongSegmentM;


    // =====================================================
    // CASE 1
    //
    // Vehicle stays inside current segment
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

            distanceRemaining = 0;

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
    // Vehicle reaches the end of current segment
    // =====================================================

    distanceRemaining -=
      segmentRemainingM;


    vehicle.distanceAlongSegmentM =
      segmentLengthM;

    vehicle.distanceAlongLaneM +=
  segmentRemainingM;


    // Put vehicle exactly on the vertex

    updateInterpolatedPosition(
      vehicle,
      geometryXY,
      geometryLonLat,
      segmentLengthM
    );


    // -----------------------------------------------------
    // Is there another segment on this lane?
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // Lane is finished
    // -----------------------------------------------------

    moveToNextLane(
      vehicle,
      routingGraph
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
    geometryXY[i + 1];


  const startLonLat =
    geometryLonLat[i];

  const endLonLat =
    geometryLonLat[i + 1];


  const fraction =
    Math.min(
      Math.max(
        vehicle.distanceAlongSegmentM /
        segmentLengthM,
        0
      ),
      1
    );


  // -------------------------------------------------------
  // Projected position
  // -------------------------------------------------------

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


  // -------------------------------------------------------
  // Geographic position for Leaflet
  // -------------------------------------------------------

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
  routingGraph
) {

  // -------------------------------------------------------
  // Is current lane the final lane?
  // -------------------------------------------------------

  if (
    vehicle.routeIndex >=
    vehicle.route.length - 1
  ) {

    vehicle.finished = true;

    vehicle.speedMps = 0;

    console.log(
      `${vehicle.id} reached destination.`
    );

    return;
  }


  // -------------------------------------------------------
  // Move to next lane in navigation route
  // -------------------------------------------------------

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

    // New lane starts at 0 m
    vehicle.distanceAlongLaneM = 0;


  // -------------------------------------------------------
  // Snap to start coordinate of next lane
  // -------------------------------------------------------

  const nextLane =
    routingGraph.lanes[
      vehicle.currentLaneId
    ];


  if (!nextLane) {

    console.error(
      "Next lane not found:",
      vehicle.currentLaneId
    );

    vehicle.finished = true;

    return;
  }


  const firstXY =
    nextLane.geometry_xy[0];


  const firstLonLat =
    nextLane.geometry_lonlat[0];


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