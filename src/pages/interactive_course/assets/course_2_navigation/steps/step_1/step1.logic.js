import {
  dijkstra,
} from "./algorithms/dijkstra.js";

import {
  astar,
} from "./algorithms/astar.js";

import {
  bfs,
} from "./algorithms/bfs.js";

import {
  dijkstra2way,
} from "./algorithms/dijkstra_2way.js";

// ============================================================
// Generate Random Origin / Destination
// ============================================================

export function generateRandomOD({

  roadNodes,
  roadEdges,
  routingGraph,

}) {

  // ----------------------------------------------------------
  // Basic validation
  // ----------------------------------------------------------

  if (
    !routingGraph ||
    !routingGraph.nodes
  ) {

    console.warn(
      "Cannot generate OD: routing graph is missing."
    );

    return null;

  }


  const nodeIds =
    Object.keys(
      routingGraph.nodes
    );


  if (
    nodeIds.length < 2
  ) {

    console.warn(
      "Cannot generate OD: not enough routing nodes."
    );

    return null;

  }


  // ----------------------------------------------------------
  // Select random origin
  // ----------------------------------------------------------

  const originIndex =
    Math.floor(
      Math.random() *
      nodeIds.length
    );


  let destinationIndex =
    Math.floor(
      Math.random() *
      nodeIds.length
    );


  // ----------------------------------------------------------
  // Ensure O and D are different
  // ----------------------------------------------------------

  while (
    destinationIndex ===
    originIndex
  ) {

    destinationIndex =
      Math.floor(
        Math.random() *
        nodeIds.length
      );

  }


  const originNodeId =
    nodeIds[
      originIndex
    ];


  const destinationNodeId =
    nodeIds[
      destinationIndex
    ];


  // ----------------------------------------------------------
  // Get coordinates from routing graph
  // ----------------------------------------------------------

  const originNode =
    routingGraph.nodes[
      originNodeId
    ];


  const destinationNode =
    routingGraph.nodes[
      destinationNodeId
    ];


  if (
    !originNode ||
    !destinationNode
  ) {

    console.warn(
      "Random OD node coordinates could not be found."
    );

    return null;

  }


  // ----------------------------------------------------------
  // Convert graph coordinates into Leaflet coordinates
  // ----------------------------------------------------------

  const origin = {

    lat:
      Number(
        originNode.lat
      ),

    lng:
      Number(
        originNode.lon
      ),

  };


  const destination = {

    lat:
      Number(
        destinationNode.lat
      ),

    lng:
      Number(
        destinationNode.lon
      ),

  };


  // ----------------------------------------------------------
  // Validate coordinates
  // ----------------------------------------------------------

  if (
    !Number.isFinite(
      origin.lat
    ) ||
    !Number.isFinite(
      origin.lng
    ) ||
    !Number.isFinite(
      destination.lat
    ) ||
    !Number.isFinite(
      destination.lng
    )
  ) {

    console.warn(
      "Generated OD contains invalid coordinates."
    );

    return null;

  }


  return {

    origin,

    destination,

    originNodeId,

    destinationNodeId,

  };

}


// ============================================================
// Run selected routing algorithm
// ============================================================

export async function runRoutingDemo({

  routingGraph,

  originNodeId,
  destinationNodeId,

  algorithm,
  weightMode,

}) {

  if (
    !routingGraph ||
    originNodeId == null ||
    destinationNodeId == null
  ) {

    return null;

  }


  const startNodeId =
    String(
      originNodeId
    );


  const endNodeId =
    String(
      destinationNodeId
    );


  const startTime =
    performance.now();


  let result;


  switch (
    algorithm
  ) {

    case "dijkstra":

      result =
        dijkstra({

          graph:
            routingGraph,

          startNodeId,

          endNodeId,

          weightMode,

        });

      break;

    case "dijkstra_2way":
        result =
          dijkstra2way({

            graph:
              routingGraph,

            startNodeId,

            endNodeId,

            weightMode,

          });

        break;

    case "astar":

      result =
        astar({

          graph:
            routingGraph,

          startNodeId,

          endNodeId,

          weightMode,

        });

      break;


    case "bfs":

      result =
        bfs({

          graph:
            routingGraph,

          startNodeId,

          endNodeId,

        });

      break;


    default:

      throw new Error(
        `Unknown routing algorithm: ${algorithm}`
      );

  }


  const endTime =
    performance.now();


  if (
    !result
  ) {

    return null;

  }


  return {

    ...result,

    algorithm,

    runtimeMs:
      endTime -
      startTime,

    version:
      Date.now(),

  };

}


// ============================================================
// Simple animation delay
// ============================================================

function delay(
  milliseconds
) {

  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}


// ============================================================
// Geographic utility
// ============================================================

function haversineDistanceMeters(
  lat1,
  lng1,
  lat2,
  lng2
) {

  const R = 6371000;


  const toRadians =
    (degrees) =>
      degrees *
      Math.PI /
      180;


  const phi1 =
    toRadians(
      lat1
    );


  const phi2 =
    toRadians(
      lat2
    );


  const deltaPhi =
    toRadians(
      lat2 - lat1
    );


  const deltaLambda =
    toRadians(
      lng2 - lng1
    );


  const a =
    Math.sin(
      deltaPhi / 2
    ) ** 2 +
    Math.cos(
      phi1
    ) *
    Math.cos(
      phi2
    ) *
    Math.sin(
      deltaLambda / 2
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
// Find nearest routing node
// ============================================================

export function findNearestRoutingNode({

  point,
  routingGraph,

}) {

  if (
    !point ||
    !routingGraph?.nodes
  ) {

    return null;

  }


  let nearestNodeId =
    null;


  let nearestNode =
    null;


  let minimumDistance =
    Infinity;


  for (
    const [
      nodeId,
      node
    ]
    of Object.entries(
      routingGraph.nodes
    )
  ) {

    const lat =
      Number(
        node.lat
      );


    const lng =
      Number(
        node.lon
      );


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {

      continue;

    }


    const distance =
      haversineDistanceMeters(

        Number(
          point.lat
        ),

        Number(
          point.lng
        ),

        lat,

        lng

      );


    if (
      distance <
      minimumDistance
    ) {

      minimumDistance =
        distance;


      nearestNodeId =
        nodeId;


      nearestNode =
        node;

    }

  }


  if (
    nearestNodeId ==
    null
  ) {

    return null;

  }


  return {

    nodeId:
      String(
        nearestNodeId
      ),

    node:
      nearestNode,

    point: {

      lat:
        Number(
          nearestNode.lat
        ),

      lng:
        Number(
          nearestNode.lon
        ),

    },

    distanceMeters:
      minimumDistance,

  };

}

// ============================================================
// Convert lon/lat to local XY metres
//
// Sufficient for a small local road network such as Coogee.
// ============================================================

function lonLatToLocalXY(
  lng,
  lat,
  referenceLat
) {

  const metersPerDegreeLat =
    111320;


  const metersPerDegreeLng =
    111320 *
    Math.cos(
      referenceLat *
      Math.PI /
      180
    );


  return {

    x:
      lng *
      metersPerDegreeLng,

    y:
      lat *
      metersPerDegreeLat,

  };

}


// ============================================================
// Distance from point P to line segment AB
// ============================================================

function pointToSegmentDistance(

  px,
  py,

  ax,
  ay,

  bx,
  by

) {

  const abx =
    bx - ax;


  const aby =
    by - ay;


  const apx =
    px - ax;


  const apy =
    py - ay;


  const denominator =
    abx * abx +
    aby * aby;


  let t =
    denominator === 0
      ? 0
      : (
          apx * abx +
          apy * aby
        ) /
        denominator;


  t =
    Math.max(
      0,
      Math.min(
        1,
        t
      )
    );


  const closestX =
    ax +
    t * abx;


  const closestY =
    ay +
    t * aby;


  const dx =
    px -
    closestX;


  const dy =
    py -
    closestY;


  return {

    distance:
      Math.sqrt(
        dx * dx +
        dy * dy
      ),

    t,

  };

}


// ============================================================
// Find nearest GeoJSON road edge
// ============================================================

export function findNearestRoadEdge({

  point,
  roadEdges,

}) {

  if (
    !point ||
    !roadEdges?.features
  ) {

    return null;

  }


  const referenceLat =
    Number(
      point.lat
    );


  const p =
    lonLatToLocalXY(

      Number(
        point.lng
      ),

      Number(
        point.lat
      ),

      referenceLat

    );


  let bestFeature =
    null;


  let bestDistance =
    Infinity;


  let bestSegmentIndex =
    null;


  for (
    const feature
    of roadEdges.features
  ) {

    const geometry =
      feature?.geometry;


    if (
      geometry?.type !==
      "LineString"
    ) {

      continue;

    }


    const coordinates =
      geometry.coordinates ??
      [];


    for (
      let i = 0;
      i <
      coordinates.length - 1;
      i++
    ) {

      const [
        lngA,
        latA
      ] =
        coordinates[i];


      const [
        lngB,
        latB
      ] =
        coordinates[i + 1];


      const a =
        lonLatToLocalXY(
          lngA,
          latA,
          referenceLat
        );


      const b =
        lonLatToLocalXY(
          lngB,
          latB,
          referenceLat
        );


      const result =
        pointToSegmentDistance(

          p.x,
          p.y,

          a.x,
          a.y,

          b.x,
          b.y

        );


      if (
        result.distance <
        bestDistance
      ) {

        bestDistance =
          result.distance;


        bestFeature =
          feature;


        bestSegmentIndex =
          i;

      }

    }

  }


  if (
    !bestFeature
  ) {

    return null;

  }


  const properties =
    bestFeature.properties ??
    {};


  return {

    feature:
      bestFeature,

    distanceMeters:
      bestDistance,

    segmentIndex:
      bestSegmentIndex,

    u:
      properties.u != null
        ? String(
            properties.u
          )
        : null,

    v:
      properties.v != null
        ? String(
            properties.v
          )
        : null,

    edgeId:
      properties.edge_id ??
      (
        properties.u != null &&
        properties.v != null
          ? `${properties.u}-${properties.v}-${properties.key ?? 0}`
          : null
      ),

  };

}

// ============================================================
// Snap arbitrary map point to routing graph
// ============================================================

export function snapPointToRoutingGraph({

  point,
  roadEdges,
  routingGraph,

}) {

  if (
    !point ||
    !routingGraph?.nodes
  ) {

    return null;

  }


  // ==========================================================
  // 1. Find nearest road edge
  // ==========================================================

  const nearestEdge =
    findNearestRoadEdge({

      point,
      roadEdges,

    });


  // ==========================================================
  // 2. Get candidate edge endpoints
  // ==========================================================

  if (
    nearestEdge
  ) {

    const u =
      nearestEdge.u != null
        ? String(nearestEdge.u)
        : null;


    const v =
      nearestEdge.v != null
        ? String(nearestEdge.v)
        : null;


    const uExists =
      u != null &&
      routingGraph.nodes[u] != null;


    const vExists =
      v != null &&
      routingGraph.nodes[v] != null;


    console.log(
      "Snap candidate edge:",
      nearestEdge
    );


    console.log(
      "Candidate U:",
      u,
      "exists:",
      uExists
    );


    console.log(
      "Candidate V:",
      v,
      "exists:",
      vExists
    );


    // ========================================================
    // 3. Build list containing ONLY valid routing nodes
    // ========================================================

    const candidates =
      [];


    if (
      uExists
    ) {

      candidates.push(
        u
      );

    }


    if (
      vExists
    ) {

      candidates.push(
        v
      );

    }


    // ========================================================
    // 4. Select closest VALID endpoint
    // ========================================================

    if (
      candidates.length >
      0
    ) {

      let bestNodeId =
        null;


      let bestNode =
        null;


      let bestDistance =
        Infinity;


      for (
        const nodeId
        of candidates
      ) {

        const node =
          routingGraph.nodes[
            nodeId
          ];


        const distance =
          haversineDistanceMeters(

            Number(
              point.lat
            ),

            Number(
              point.lng
            ),

            Number(
              node.lat
            ),

            Number(
              node.lon
            )

          );


        if (
          distance <
          bestDistance
        ) {

          bestDistance =
            distance;


          bestNodeId =
            nodeId;


          bestNode =
            node;

        }

      }


      console.log(
        "Selected valid routing node:",
        bestNodeId
      );


      return {

        nodeId:
          bestNodeId,

        snappedPoint: {

          lat:
            Number(
              bestNode.lat
            ),

          lng:
            Number(
              bestNode.lon
            ),

        },

        nodeDistanceMeters:
          bestDistance,

        edge:
          nearestEdge,

      };

    }

  }


  // ==========================================================
  // 5. Fallback:
  //
  // If neither endpoint of the nearest road edge exists in
  // routingGraph, find nearest VALID graph node globally.
  // ==========================================================

  console.warn(
    "Nearest edge has no valid routing endpoints. Falling back to nearest graph node."
  );


  const nearestNode =
    findNearestRoutingNode({

      point,
      routingGraph,

    });


  if (
    !nearestNode
  ) {

    return null;

  }


  return {

    nodeId:
      nearestNode.nodeId,

    snappedPoint:
      nearestNode.point,

    nodeDistanceMeters:
      nearestNode.distanceMeters,

    edge:
      nearestEdge ??
      null,

  };

}