// ============================================================
// graphUtils.js
//
// Shared utility functions for routing algorithms.
// ============================================================


// ============================================================
// Get node coordinates from routingGraph
//
// Expected graph structure:
//
// routingGraph.nodes[nodeId] = {
//   lat: ...,
//   lon: ...
// }
//
// Some datasets may instead use:
// latitude / longitude
// x / y
//
// This helper tries several possibilities.
// ============================================================

export function getNodeCoordinates(
  graph,
  nodeId
) {

  const node =
    graph?.nodes?.[String(nodeId)];


  if (!node) {
    return null;
  }


  const lat =
    Number(
      node.lat ??
      node.latitude ??
      node.y
    );


  const lon =
    Number(
      node.lon ??
      node.lng ??
      node.longitude ??
      node.x
    );


  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {

    return null;

  }


  return {
    lat,
    lon,
  };

}



// ============================================================
// Haversine distance
//
// Returns straight-line geographic distance in metres.
// ============================================================

export function haversineDistanceMeters(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R =
    6371000;


  const toRadians =
    (degrees) =>
      degrees *
      Math.PI /
      180;


  const φ1 =
    toRadians(lat1);

  const φ2 =
    toRadians(lat2);


  const Δφ =
    toRadians(
      lat2 - lat1
    );


  const Δλ =
    toRadians(
      lon2 - lon1
    );


  const a =
    Math.sin(
      Δφ / 2
    ) ** 2 +

    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(
      Δλ / 2
    ) ** 2;


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return R * c;

}



// ============================================================
// Heuristic for A*
//
// distance mode:
// straight-line distance in metres
//
// time mode:
// straight-line distance divided by an assumed
// maximum network speed.
//
// IMPORTANT:
// For A* to remain optimal, heuristic should not
// overestimate the remaining cost.
// ============================================================

export function estimateHeuristic({
  graph,
  nodeId,
  goalNodeId,
  weightMode = "distance",
}) {

  const current =
    getNodeCoordinates(
      graph,
      nodeId
    );


  const goal =
    getNodeCoordinates(
      graph,
      goalNodeId
    );


  if (
    !current ||
    !goal
  ) {

    return 0;

  }


  const distanceM =
    haversineDistanceMeters(
      current.lat,
      current.lon,
      goal.lat,
      goal.lon
    );


  // ----------------------------------------------------------
  // Distance objective
  // ----------------------------------------------------------

  if (
    weightMode ===
    "distance"
  ) {

    return distanceM;

  }


  // ----------------------------------------------------------
  // Travel-time objective
  //
  // Use a deliberately high assumed maximum speed so the
  // heuristic stays conservative.
  // 130 km/h = 36.111... m/s
  // ----------------------------------------------------------

  if (
    weightMode ===
    "time"
  ) {

    const maxSpeedMps =
      130 / 3.6;


    return (
      distanceM /
      maxSpeedMps
    );

  }


  return 0;

}



// ============================================================
// Get edge weight
// ============================================================

export function getEdgeWeight(
  edge,
  weightMode = "distance"
) {

  if (!edge) {
    return Infinity;
  }


  // ----------------------------------------------------------
  // Fastest route
  // ----------------------------------------------------------

  if (
    weightMode ===
    "time"
  ) {

    const travelTime =
      Number(
        edge.travel_time_s
      );


    if (
      Number.isFinite(
        travelTime
      )
    ) {

      return travelTime;

    }

  }


  // ----------------------------------------------------------
  // Shortest distance
  // ----------------------------------------------------------

  const length =
    Number(
      edge.length_m
    );


  if (
    Number.isFinite(
      length
    )
  ) {

    return length;

  }


  return 1;

}



// ============================================================
// Get an application-level edge ID
//
// Your routing JSON may or may not already contain edge_id.
// ============================================================

export function getEdgeId(
  edge,
  sourceNodeId,
  targetNodeId
) {

  const id =
    edge?.edge_id ??
    edge?.id ??
    edge?.osmid ??
    null;


  if (
    id != null
  ) {

    return String(id);

  }


  return (
    `${String(sourceNodeId)}->${String(targetNodeId)}`
  );

}



// ============================================================
// Reconstruct path from previous map
//
// previous[targetNodeId] = {
//   nodeId: previousNodeId,
//   edge: edgeObject
// }
// ============================================================

export function reconstructPath({
  previous,
  startNodeId,
  endNodeId,
}) {

  const nodeIds = [];

  const edgeIds = [];


  let currentNodeId =
    String(endNodeId);


  while (
    currentNodeId
  ) {

    nodeIds.push(
      currentNodeId
    );


    if (
      currentNodeId ===
      String(startNodeId)
    ) {

      break;

    }


    const info =
      previous[
        currentNodeId
      ];


    if (!info) {

      return {
        nodeIds: [],
        edgeIds: [],
      };

    }


    const previousNodeId =
      String(
        info.nodeId
      );


    edgeIds.push(
      getEdgeId(
        info.edge,
        previousNodeId,
        currentNodeId
      )
    );


    currentNodeId =
      previousNodeId;

  }


  nodeIds.reverse();

  edgeIds.reverse();


  return {
    nodeIds,
    edgeIds,
  };

}



// ============================================================
// Find nearest graph node to a geographic coordinate
//
// Useful after user drags O/D marker.
//
// point = {
//   lat,
//   lng
// }
// ============================================================

export function findNearestGraphNode(
  graph,
  point
) {

  if (
    !graph?.nodes ||
    !point
  ) {

    return null;

  }


  let nearestNodeId =
    null;


  let nearestDistance =
    Infinity;


  for (
    const [
      nodeId,
      node
    ]
    of Object.entries(
      graph.nodes
    )
  ) {

    const lat =
      Number(
        node.lat ??
        node.latitude ??
        node.y
      );


    const lon =
      Number(
        node.lon ??
        node.lng ??
        node.longitude ??
        node.x
      );


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {

      continue;

    }


    const distance =
      haversineDistanceMeters(
        point.lat,
        point.lng,
        lat,
        lon
      );


    if (
      distance <
      nearestDistance
    ) {

      nearestDistance =
        distance;

      nearestNodeId =
        String(nodeId);

    }

  }


  if (
    nearestNodeId == null
  ) {

    return null;

  }


  return {

    nodeId:
      nearestNodeId,

    distanceM:
      nearestDistance,

  };

}