// ============================================================
// astar.js
//
// A* shortest-path algorithm
//
// f(n) = g(n) + h(n)
//
// g(n):
// accumulated network cost from origin
//
// h(n):
// estimated remaining cost to destination
//
// Input format:
//
// astar({
//   graph,
//   startNodeId,
//   endNodeId,
//   weightMode
// })
//
// Output format matches dijkstra.js:
//
// {
//   found,
//   nodeIds,
//   edgeIds,
//   searchOrder,
//   nodesVisited,
//   edgesVisited,
//   cost,
//   iterations
// }
// ============================================================

import {
  estimateHeuristic,
} from "./graphUtils.js";


// ============================================================
// A* shortest-path search
// ============================================================

export function astar({

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
      "A* requires graph, startNodeId, and endNodeId."
    );

    return null;

  }


  // ==========================================================
  // Normalize IDs
  // ==========================================================

  const start =
    String(
      startNodeId
    );


  const goal =
    String(
      endNodeId
    );


  const nodes =
    graph.nodes ??
    {};


  const adjacency =
    graph.adjacency ??
    {};


  // ==========================================================
  // Validate graph nodes
  // ==========================================================

  if (
    nodes[start] == null
  ) {

    console.error(
      "A* start node does not exist:",
      start
    );

    return null;

  }


  if (
    nodes[goal] == null
  ) {

    console.error(
      "A* destination node does not exist:",
      goal
    );

    return null;

  }


  // ==========================================================
  // Trivial case
  // ==========================================================

  if (
    start === goal
  ) {

    return {

      found:
        true,

      nodeIds:
        [
          start,
        ],

      edgeIds:
        [],

      searchOrder:
        [
          start,
        ],

      nodesVisited:
        1,

      edgesVisited:
        0,

      cost:
        0,

      iterations:
        [

          {

            iteration:
              0,

            currentNodeId:
              start,

            currentCost:
              0,

            currentG:
              0,

            currentH:
              0,

            currentF:
              0,

            visitedNodeIds:
              [
                start,
              ],

            visitedEdgeIds:
              [],

            frontierNodeIds:
              [],

            frontier:
              [],

            relaxedEdges:
              [],

            destinationReached:
              true,

          },

        ],

    };

  }


  // ==========================================================
  // Cost maps
  // ==========================================================

  const gScore =
    {};


  const fScore =
    {};


  const previous =
    {};


  // ==========================================================
  // Initialize graph
  // ==========================================================

  for (
    const nodeId
    of Object.keys(
      nodes
    )
  ) {

    gScore[
      nodeId
    ] =
      Infinity;


    fScore[
      nodeId
    ] =
      Infinity;


    previous[
      nodeId
    ] =
      null;

  }


  // ==========================================================
  // Start node
  // ==========================================================

  gScore[
    start
  ] =
    0;


  const startHeuristic =
    getSafeHeuristic({

      graph,

      nodeId:
        start,

      goalNodeId:
        goal,

      weightMode,

    });


  fScore[
    start
  ] =
    startHeuristic;


  // ==========================================================
  // Open set
  //
  // Simple array priority queue.
  // Fine for this teaching network.
  // ==========================================================

  const openSet =
    [

      {

        nodeId:
          start,

        priority:
          fScore[start],

        g:
          0,

      },

    ];


  // ==========================================================
  // Search state
  // ==========================================================

  const closedSet =
    new Set();


  const searchedEdgeIds =
    new Set();


  const searchOrder =
    [];


  const iterations =
    [];


  // ==========================================================
  // Main search
  // ==========================================================

  while (
    openSet.length > 0
  ) {

    // --------------------------------------------------------
    // Sort by lowest f score
    // --------------------------------------------------------

    openSet.sort(
      (a, b) => {

        if (
          a.priority !==
          b.priority
        ) {

          return (
            a.priority -
            b.priority
          );

        }


        // Tie breaker:
        // prefer smaller accumulated g
        return (
          a.g -
          b.g
        );

      }
    );


    // --------------------------------------------------------
    // Pop best candidate
    // --------------------------------------------------------

    const current =
      openSet.shift();


    const currentNodeId =
      String(
        current.nodeId
      );


    // --------------------------------------------------------
    // Ignore stale / already closed entries
    // --------------------------------------------------------

    if (
      closedSet.has(
        currentNodeId
      )
    ) {

      continue;

    }


    // ========================================================
    // Permanently visit current node
    // ========================================================

    closedSet.add(
      currentNodeId
    );


    searchOrder.push(
      currentNodeId
    );


    // ========================================================
    // Current heuristic state
    // ========================================================

    const currentG =
      gScore[
        currentNodeId
      ];


    const currentH =
      getSafeHeuristic({

        graph,

        nodeId:
          currentNodeId,

        goalNodeId:
          goal,

        weightMode,

      });


    const currentF =
      currentG +
      currentH;


    // ========================================================
    // Create iteration snapshot
    // ========================================================

    const iterationState =
      {

        iteration:
          iterations.length,

        currentNodeId,

        currentCost:
          currentG,

        // A*-specific fields
        currentG,

        currentH,

        currentF,

        visitedNodeIds:
          Array.from(
            closedSet
          ),

        visitedEdgeIds:
          Array.from(
            searchedEdgeIds
          ),

        frontierNodeIds:
          getUniqueFrontierNodeIds(
            openSet,
            closedSet
          ),

        frontier:
          getFrontierSnapshot(
            openSet,
            closedSet
          ),

        relaxedEdges:
          [],

        destinationReached:
          false,

      };


    // ========================================================
    // Destination reached
    // ========================================================

    if (
      currentNodeId ===
      goal
    ) {

      iterationState.destinationReached =
        true;


      iterationState.visitedNodeIds =
        Array.from(
          closedSet
        );


      iterationState.visitedEdgeIds =
        Array.from(
          searchedEdgeIds
        );


      iterationState.frontierNodeIds =
        getUniqueFrontierNodeIds(
          openSet,
          closedSet
        );


      iterationState.frontier =
        getFrontierSnapshot(
          openSet,
          closedSet
        );


      iterations.push(
        iterationState
      );


      // ======================================================
      // Reconstruct route
      // ======================================================

      const path =
        reconstructAStarPath({

          previous,

          startNodeId:
            start,

          endNodeId:
            goal,

        });


      if (
        !path
      ) {

        console.error(
          "A* reached the destination but path reconstruction failed."
        );


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


      // ======================================================
      // Successful result
      // ======================================================

      return {

        found:
          true,

        nodeIds:
          path.nodeIds,

        edgeIds:
          path.edgeIds,

        searchOrder,

        nodesVisited:
          searchOrder.length,

        edgesVisited:
          searchedEdgeIds.size,

        cost:
          gScore[goal],

        iterations,

      };

    }


    // ========================================================
    // Expand neighbours
    // ========================================================

    const neighbours =
      adjacency[
        currentNodeId
      ] ??
      [];


    for (
      const edge
      of neighbours
    ) {

      // ======================================================
      // IMPORTANT:
      //
      // Routing JSON uses:
      //
      // edge.to
      //
      // NOT:
      //
      // edge.target
      // ======================================================

      if (
        edge?.to == null
      ) {

        console.warn(
          "A* skipping malformed edge with no `to`:",
          edge
        );

        continue;

      }


      const targetNodeId =
        String(
          edge.to
        );


      // ------------------------------------------------------
      // Make sure target exists
      // ------------------------------------------------------

      if (
        nodes[
          targetNodeId
        ] == null
      ) {

        console.warn(
          "A* edge points to missing routing node:",
          currentNodeId,
          "->",
          targetNodeId
        );

        continue;

      }


      // ------------------------------------------------------
      // Edge ID
      // ------------------------------------------------------

      const edgeId =
        getEdgeId(
          edge,
          currentNodeId,
          targetNodeId
        );


      // ------------------------------------------------------
      // Record searched edge
      // ------------------------------------------------------

      searchedEdgeIds.add(
        edgeId
      );


      // ------------------------------------------------------
      // If permanently closed, skip
      // ------------------------------------------------------

      if (
        closedSet.has(
          targetNodeId
        )
      ) {

        continue;

      }


      // ------------------------------------------------------
      // Get network edge weight
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
          "A* invalid edge weight:",
          edge
        );

        continue;

      }


      // ======================================================
      // Tentative g score
      // ======================================================

      const tentativeG =
        gScore[
          currentNodeId
        ] +
        edgeWeight;


      const oldG =
        gScore[
          targetNodeId
        ] ??
        Infinity;


      // ======================================================
      // Better route to target discovered
      // ======================================================

      if (
        tentativeG <
        oldG
      ) {

        // ----------------------------------------------------
        // Path reconstruction information
        // ----------------------------------------------------

        previous[
          targetNodeId
        ] =
          {

            nodeId:
              currentNodeId,

            edge,

          };


        // ----------------------------------------------------
        // Update g
        // ----------------------------------------------------

        gScore[
          targetNodeId
        ] =
          tentativeG;


        // ----------------------------------------------------
        // Calculate h
        // ----------------------------------------------------

        const heuristic =
          getSafeHeuristic({

            graph,

            nodeId:
              targetNodeId,

            goalNodeId:
              goal,

            weightMode,

          });


        // ----------------------------------------------------
        // Calculate f = g + h
        // ----------------------------------------------------

        const newF =
          tentativeG +
          heuristic;


        fScore[
          targetNodeId
        ] =
          newF;


        // ----------------------------------------------------
        // Add candidate to priority queue
        // ----------------------------------------------------

        openSet.push(
          {

            nodeId:
              targetNodeId,

            priority:
              newF,

            g:
              tentativeG,

          }
        );


        // ----------------------------------------------------
        // Record relaxation for animation / teaching
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
                  oldG
                )
                  ? oldG
                  : null,

              newCost:
                tentativeG,

              // A*-specific values

              g:
                tentativeG,

              h:
                heuristic,

              f:
                newF,

            }
          );

      }

    }


    // ========================================================
    // Finish iteration snapshot
    // ========================================================

    iterationState.visitedNodeIds =
      Array.from(
        closedSet
      );


    iterationState.visitedEdgeIds =
      Array.from(
        searchedEdgeIds
      );


    iterationState.frontierNodeIds =
      getUniqueFrontierNodeIds(
        openSet,
        closedSet
      );


    iterationState.frontier =
      getFrontierSnapshot(
        openSet,
        closedSet
      );


    iterations.push(
      iterationState
    );

  }


  // ==========================================================
  // No route found
  // ==========================================================

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


// ============================================================
// Edge weight
//
// Same interpretation as dijkstra.js
// ============================================================

function getEdgeWeight(
  edge,
  weightMode
) {

  // ==========================================================
  // Fastest route
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
    // Fallback if travel time is unavailable
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
// Safe heuristic wrapper
//
// graphUtils.js should calculate the actual heuristic.
//
// If it returns NaN/undefined for some reason, use 0.
// h = 0 reduces A* to Dijkstra rather than breaking routing.
// ============================================================

function getSafeHeuristic({

  graph,
  nodeId,
  goalNodeId,
  weightMode,

}) {

  const heuristic =
    Number(
      estimateHeuristic({

        graph,

        nodeId,

        goalNodeId,

        weightMode,

      })
    );


  if (
    !Number.isFinite(
      heuristic
    ) ||
    heuristic < 0
  ) {

    return 0;

  }


  return heuristic;

}


// ============================================================
// Edge ID
// ============================================================

function getEdgeId(
  edge,
  fromNodeId,
  toNodeId
) {

  return String(

    edge?.edge_id ??
    edge?.id ??
    `${fromNodeId}->${toNodeId}`

  );

}


// ============================================================
// Reconstruct A* path
// ============================================================

function reconstructAStarPath({

  previous,

  startNodeId,
  endNodeId,

}) {

  const start =
    String(
      startNodeId
    );


  const end =
    String(
      endNodeId
    );


  const nodeIds =
    [];


  const edgeIds =
    [];


  let currentNodeId =
    end;


  while (
    currentNodeId != null
  ) {

    nodeIds.push(
      currentNodeId
    );


    if (
      currentNodeId ===
      start
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

      return null;

    }


    const previousNodeId =
      String(
        previousInfo.nodeId
      );


    const edgeId =
      getEdgeId(

        previousInfo.edge,

        previousNodeId,

        currentNodeId

      );


    edgeIds.push(
      edgeId
    );


    currentNodeId =
      previousNodeId;

  }


  // ----------------------------------------------------------
  // Verify reconstruction actually reached origin
  // ----------------------------------------------------------

  if (
    nodeIds[
      nodeIds.length - 1
    ] !== start
  ) {

    return null;

  }


  // Destination → Origin
  // becomes
  // Origin → Destination

  nodeIds.reverse();

  edgeIds.reverse();


  return {

    nodeIds,

    edgeIds,

  };

}


// ============================================================
// Unique frontier node IDs
// ============================================================

function getUniqueFrontierNodeIds(
  openSet,
  closedSet
) {

  const frontier =
    new Set();


  for (
    const item
    of openSet
  ) {

    const nodeId =
      String(
        item.nodeId
      );


    if (
      !closedSet.has(
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
// Stores the best currently-known f value for each open node.
//
// This is useful for showing students how A* ranks candidates.
// ============================================================

function getFrontierSnapshot(
  openSet,
  closedSet
) {

  const best =
    new Map();


  for (
    const item
    of openSet
  ) {

    const nodeId =
      String(
        item.nodeId
      );


    if (
      closedSet.has(
        nodeId
      )
    ) {

      continue;

    }


    const priority =
      Number(
        item.priority
      );


    const g =
      Number(
        item.g
      );


    const existing =
      best.get(
        nodeId
      );


    if (
      existing == null ||
      priority <
      existing.priority
    ) {

      best.set(
        nodeId,
        {

          nodeId,

          priority,

          g,

        }
      );

    }

  }


  return Array.from(
    best.values()
  )
    .sort(
      (a, b) =>
        a.priority -
        b.priority
    );

}