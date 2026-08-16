import {
  TrafficSignal
} from "./trafficSignal";


// =========================================================
// Create traffic signal at lane endpoint
// =========================================================

export function createTrafficSignalAtLaneEnd({

  id,

  laneId,

  routingGraph,

  greenDurationS = 20,

  yellowDurationS = 3,

  redDurationS = 20,

  offsetS = 0,

}) {

  // -------------------------------------------------------
  // Find lane
  // -------------------------------------------------------

  const lane =
    routingGraph.lanes[
      laneId
    ];


  if (!lane) {

    console.error(
      "Cannot create traffic signal. Lane not found:",
      laneId
    );

    return null;

  }


  // -------------------------------------------------------
  // Read lane geometry
  // -------------------------------------------------------

  const geometryXY =
    lane.geometry_xy;

  const geometryLonLat =
    lane.geometry_lonlat;


  if (
    !geometryXY ||
    geometryXY.length === 0 ||
    !geometryLonLat ||
    geometryLonLat.length === 0
  ) {

    console.error(
      "Lane has invalid geometry:",
      laneId
    );

    return null;

  }


  // -------------------------------------------------------
  // End vertex
  // -------------------------------------------------------

  const lastIndex =
    geometryXY.length - 1;


  const [
    x,
    y
  ] =
    geometryXY[
      lastIndex
    ];


  const [
    lon,
    lat
  ] =
    geometryLonLat[
      lastIndex
    ];


  // -------------------------------------------------------
  // Calculate lane length
  // -------------------------------------------------------

  let laneLengthM =
    0;


  for (
    let i = 0;
    i < geometryXY.length - 1;
    i += 1
  ) {

    const [
      x1,
      y1
    ] =
      geometryXY[i];


    const [
      x2,
      y2
    ] =
      geometryXY[
        i + 1
      ];


    const dx =
      x2 - x1;

    const dy =
      y2 - y1;


    laneLengthM +=
      Math.sqrt(
        dx * dx +
        dy * dy
      );

  }


  // -------------------------------------------------------
  // Create signal
  // -------------------------------------------------------

  return new TrafficSignal({

    id,

    laneId,

    lon,
    lat,

    x,
    y,

    distanceAlongLaneM:
      laneLengthM,

    greenDurationS,

    yellowDurationS,

    redDurationS,

    offsetS,

  });

}