// ============================================================
// Dijkstra shortest-path algorithm
//
// Returns:
// {
//   found,
//   nodeIds,
//   edgeIds,
//   searchOrder,
//   nodesVisited,
//   cost,
//   iterations
// }
//
// Each iteration stores:
// - currentNodeId
// - currentCost
// - visitedNodeIds
// - visitedEdgeIds
// - frontierNodeIds
// - frontier
// - relaxedEdges
// ============================================================

export function dijkstra({

  graph,

  startNodeId,
  endNodeId,

  weightMode = "distance",

}) {

  // ==========================================================
  // Validate input
  // ==========================================================

  if (
    !graph ||
    startNodeId == null ||
    endNodeId == null
  ) {

    console.warn(
      "Dijkstra requires graph, startNodeId, and endNodeId."
    );

    return null;

  }


  // ==========================================================
  // Normalize node IDs
  // ==========================================================

  const startId =
    String(
      startNodeId
    );


  const endId =
    String(
      endNodeId
    );


  const adjacency =
    graph.adjacency ??
    {};


  const nodes =
    graph.nodes ??
    {};


  // ==========================================================
  // Validate graph nodes
  // ==========================================================

  if (
    nodes[startId] == null
  ) {

    console.error(
      "Dijkstra start node does not exist:",
      startId
    );

    return null;

  }


  if (
    nodes[endId] == null
  ) {

    console.error(
      "Dijkstra destination node does not exist:",
      endId
    );

    return null;

  }


  // ==========================================================
  // Core algorithm state
  // ==========================================================

  const distances =
    {};


  const previous =
    {};


  const visited =
    new Set();


  const searchedEdgeIds =
    new Set();


  const searchOrder =
    [];


  // Full iteration history for animation
  const iterations =
    [];


  // ==========================================================
  // Initialize distances
  // ==========================================================

  for (
    const nodeId
    of Object.keys(nodes)
  ) {

    distances[nodeId] =
      Infinity;


    previous[nodeId] =
      null;

  }


  distances[startId] =
    0;


  // ==========================================================
  // Priority queue
  //
  // Simple array-based queue.
  // Fine for this teaching network.
  // ==========================================================

  const queue =
    [

      {

        nodeId:
          startId,

        cost:
          0,

      },

    ];


  // ==========================================================
  // Main Dijkstra loop
  // ==========================================================

  while (
    queue.length > 0
  ) {

    // --------------------------------------------------------
    // Sort queue by accumulated cost
    // --------------------------------------------------------

    queue.sort(
      (a, b) =>
        a.cost -
        b.cost
    );


    // --------------------------------------------------------
    // Pop lowest-cost candidate
    // --------------------------------------------------------

    const current =
      queue.shift();


    const currentNodeId =
      String(
        current.nodeId
      );


    // --------------------------------------------------------
    // Skip stale queue entries
    // --------------------------------------------------------

    if (
      visited.has(
        currentNodeId
      )
    ) {

      continue;

    }


    // --------------------------------------------------------
    // Mark current node visited
    // --------------------------------------------------------

    visited.add(
      currentNodeId
    );


    searchOrder.push(
      currentNodeId
    );


    // ========================================================
    // Create iteration snapshot
    // ========================================================

    const iterationState =
      {

        iteration:
          iterations.length,

        currentNodeId,

        currentCost:
          distances[currentNodeId],

        // Updated again at end of iteration
        visitedNodeIds:
          Array.from(
            visited
          ),

        visitedEdgeIds:
          Array.from(
            searchedEdgeIds
          ),

        frontierNodeIds:
          getUniqueFrontierNodeIds(
            queue,
            visited
          ),

        frontier:
          getFrontierSnapshot(
            queue,
            visited
          ),

        relaxedEdges:
          [],

      };


    // ========================================================
    // Destination reached
    // ========================================================

    if (
      currentNodeId ===
      endId
    ) {

      iterationState.visitedNodeIds =
        Array.from(
          visited
        );


      iterationState.visitedEdgeIds =
        Array.from(
          searchedEdgeIds
        );


      iterationState.frontierNodeIds =
        getUniqueFrontierNodeIds(
          queue,
          visited
        );


      iterationState.frontier =
        getFrontierSnapshot(
          queue,
          visited
        );


      iterationState.destinationReached =
        true;


      iterations.push(
        iterationState
      );


      break;

    }


    // ========================================================
    // Get outgoing edges
    // ========================================================

    const neighbours =
      adjacency[
        currentNodeId
      ] ??
      [];


    // ========================================================
    // Examine each outgoing edge
    // ========================================================

    for (
      const edge
      of neighbours
    ) {

      // ------------------------------------------------------
      // IMPORTANT:
      //
      // routing graph uses:
      //
      // edge.to
      //
      // not edge.target
      // ------------------------------------------------------

      if (
        edge?.to == null
      ) {

        console.warn(
          "Skipping malformed edge with no `to` field:",
          edge
        );

        continue;

      }


      const targetNodeId =
        String(
          edge.to
        );


      // ------------------------------------------------------
      // Validate target
      // ------------------------------------------------------

      if (
        nodes[targetNodeId] ==
        null
      ) {

        console.warn(
          "Edge points to missing routing node:",
          currentNodeId,
          "->",
          targetNodeId,
          edge
        );

        continue;

      }


      // ------------------------------------------------------
      // Build edge ID
      // ------------------------------------------------------

      const edgeId =
        String(

          edge.edge_id ??
          edge.id ??
          `${currentNodeId}->${targetNodeId}`

        );


      // ------------------------------------------------------
      // Record that this edge was examined
      // ------------------------------------------------------

      searchedEdgeIds.add(
        edgeId
      );


      // ------------------------------------------------------
      // Skip already-finalized target
      // ------------------------------------------------------

      if (
        visited.has(
          targetNodeId
        )
      ) {

        continue;

      }


      // ------------------------------------------------------
      // Determine edge weight
      // ------------------------------------------------------

      const edgeWeight =
        getEdgeWeight(
          edge,
          weightMode
        );


      if (
        !Number.isFinite(
          edgeWeight
        )
      ) {

        console.warn(
          "Invalid edge weight:",
          edge
        );

        continue;

      }


      // ------------------------------------------------------
      // Calculate candidate cost
      // ------------------------------------------------------

      const currentCost =
        distances[
          currentNodeId
        ];


      const newCost =
        currentCost +
        edgeWeight;


      const oldCost =
        distances[
          targetNodeId
        ] ??
        Infinity;


      // ======================================================
      // Relax edge
      // ======================================================

      if (
        newCost <
        oldCost
      ) {

        distances[
          targetNodeId
        ] =
          newCost;


        previous[
          targetNodeId
        ] =
          {

            nodeId:
              currentNodeId,

            edge,

          };


        queue.push(
          {

            nodeId:
              targetNodeId,

            cost:
              newCost,

          }
        );


        // ----------------------------------------------------
        // Record successful relaxation
        // ----------------------------------------------------

        iterationState
          .relaxedEdges
          .push(
            {

              from:
                currentNodeId,

              to:
                targetNodeId,

              edgeId,

              edgeWeight,

              oldCost:
                Number.isFinite(
                  oldCost
                )
                  ? oldCost
                  : null,

              newCost,

            }
          );

      }

    }


    // ========================================================
    // Complete iteration snapshot
    // ========================================================

    iterationState.visitedNodeIds =
      Array.from(
        visited
      );


    iterationState.visitedEdgeIds =
      Array.from(
        searchedEdgeIds
      );


    iterationState.frontierNodeIds =
      getUniqueFrontierNodeIds(
        queue,
        visited
      );


    iterationState.frontier =
      getFrontierSnapshot(
        queue,
        visited
      );


    iterationState.destinationReached =
      false;


    iterations.push(
      iterationState
    );

  }


  // ==========================================================
  // Determine whether route exists
  // ==========================================================

  const found =
    Number.isFinite(
      distances[endId]
    );


  // ==========================================================
  // No route found
  // ==========================================================

  if (
    !found
  ) {

    return {

      found:
        false,

      nodeIds:
        [],

      edgeIds:
        [],

      searchOrder,

      nodesVisited:
        searchOrder.length,

      edgesVisited:
        searchedEdgeIds.size,

      cost:
        Infinity,

      iterations,

    };

  }


  // ==========================================================
  // Reconstruct shortest path
  // ==========================================================

  const nodeIds =
    [];


  const edgeIds =
    [];


  let currentNodeId =
    endId;


  while (
    currentNodeId != null
  ) {

    nodeIds.push(
      currentNodeId
    );


    // --------------------------------------------------------
    // Origin reached
    // --------------------------------------------------------

    if (
      currentNodeId ===
      startId
    ) {

      break;

    }


    const previousInfo =
      previous[
        currentNodeId
      ];


    if (
      !previousInfo
    ) {

      console.error(
        "Dijkstra path reconstruction failed at node:",
        currentNodeId
      );

      break;

    }


    const edge =
      previousInfo.edge;


    const edgeId =
      String(

        edge.edge_id ??
        edge.id ??
        `${previousInfo.nodeId}->${currentNodeId}`

      );


    edgeIds.push(
      edgeId
    );


    currentNodeId =
      String(
        previousInfo.nodeId
      );

  }


  // Destination → origin
  // becomes
  // origin → destination

  nodeIds.reverse();

  edgeIds.reverse();


  // ==========================================================
  // Return complete algorithm result
  // ==========================================================

  return {

    found:
      true,

    // Final optimal route
    nodeIds,

    edgeIds,

    // Order in which Dijkstra permanently visited nodes
    searchOrder,

    nodesVisited:
      searchOrder.length,

    edgesVisited:
      searchedEdgeIds.size,

    cost:
      distances[endId],

    // Full search history for visualization
    iterations,

  };

}


// ============================================================
// Edge weight
// ============================================================

function getEdgeWeight(
  edge,
  weightMode
) {

  // ==========================================================
  // Fastest travel time
  // ==========================================================

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
      ) &&
      travelTime >= 0
    ) {

      return travelTime;

    }


    // --------------------------------------------------------
    // Fallback to distance
    // --------------------------------------------------------

    const fallbackLength =
      Number(
        edge.length_m
      );


    if (
      Number.isFinite(
        fallbackLength
      ) &&
      fallbackLength >= 0
    ) {

      return fallbackLength;

    }


    return Infinity;

  }


  // ==========================================================
  // Shortest distance
  // ==========================================================

  const length =
    Number(
      edge.length_m
    );


  if (
    Number.isFinite(
      length
    ) &&
    length >= 0
  ) {

    return length;

  }


  return Infinity;

}


// ============================================================
// Extract unique frontier node IDs
// ============================================================

function getUniqueFrontierNodeIds(
  queue,
  visited
) {

  const frontier =
    new Set();


  for (
    const item
    of queue
  ) {

    const nodeId =
      String(
        item.nodeId
      );


    if (
      !visited.has(
        nodeId
      )
    ) {

      frontier.add(
        nodeId
      );

    }

  }


  return Array.from(
    frontier
  );

}


// ============================================================
// Frontier snapshot
//
// Includes node IDs and current tentative costs.
// Useful later for visualizing the priority queue.
// ============================================================

function getFrontierSnapshot(
  queue,
  visited
) {

  const bestCosts =
    new Map();


  for (
    const item
    of queue
  ) {

    const nodeId =
      String(
        item.nodeId
      );


    if (
      visited.has(
        nodeId
      )
    ) {

      continue;

    }


    const cost =
      Number(
        item.cost
      );


    const existing =
      bestCosts.get(
        nodeId
      );


    if (
      existing == null ||
      cost < existing
    ) {

      bestCosts.set(
        nodeId,
        cost
      );

    }

  }


  return Array.from(
    bestCosts.entries()
  )
    .map(
      ([
        nodeId,
        cost,
      ]) => {

        return {

          nodeId,

          cost,

        };

      }
    )
    .sort(
      (a, b) =>
        a.cost -
        b.cost
    );

}