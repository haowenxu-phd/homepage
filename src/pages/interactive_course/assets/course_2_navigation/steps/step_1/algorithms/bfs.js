// ============================================================
// bfs.js
//
// Breadth-First Search
//
// Input format matches dijkstra.js / astar.js:
//
// bfs({
//   graph,
//   startNodeId,
//   endNodeId,
//   weightMode
// })
//
// NOTE:
// BFS ignores edge weights.
//
// Output format matches:
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
//
// For BFS:
// cost = number of edges in final path
// ============================================================


// ============================================================
// Breadth-First Search
// ============================================================

export function bfs({

  graph,

  startNodeId,
  endNodeId,

  // Kept only for API consistency.
  // BFS does not use weighted costs.
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
      "BFS requires graph, startNodeId, and endNodeId."
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
      "BFS start node does not exist:",
      start
    );

    return null;

  }


  if (
    nodes[goal] == null
  ) {

    console.error(
      "BFS destination node does not exist:",
      goal
    );

    return null;

  }


  // ==========================================================
  // Trivial route
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
  // BFS state
  // ==========================================================

  const queue =
    [
      start,
    ];


  const visited =
    new Set(
      [
        start,
      ]
    );


  const searchedEdgeIds =
    new Set();


  const previous =
    {};


  const depth =
    {};


  previous[start] =
    null;


  depth[start] =
    0;


  const searchOrder =
    [];


  const iterations =
    [];


  // ==========================================================
  // Main BFS loop
  // ==========================================================

  while (
    queue.length > 0
  ) {

    // --------------------------------------------------------
    // FIFO queue
    // --------------------------------------------------------

    const currentNodeId =
      String(
        queue.shift()
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

        // For BFS this is graph depth,
        // i.e. number of edges from origin.
        currentCost:
          depth[
            currentNodeId
          ] ?? 0,

        visitedNodeIds:
          Array.from(
            visited
          ),

        visitedEdgeIds:
          Array.from(
            searchedEdgeIds
          ),

        frontierNodeIds:
          Array.from(
            queue
          ).map(
            String
          ),

        frontier:
          getFrontierSnapshot(
            queue,
            depth
          ),

        // We keep this field to match Dijkstra/A*.
        //
        // In BFS this represents newly discovered edges,
        // not weighted relaxation.
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
          visited
        );


      iterationState.visitedEdgeIds =
        Array.from(
          searchedEdgeIds
        );


      iterationState.frontierNodeIds =
        Array.from(
          queue
        ).map(
          String
        );


      iterationState.frontier =
        getFrontierSnapshot(
          queue,
          depth
        );


      iterations.push(
        iterationState
      );


      const path =
        reconstructBfsPath({

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
          "BFS reached destination but path reconstruction failed."
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
      // BFS cost:
      //
      // number of edges / hops
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
          path.edgeIds.length,

        iterations,

      };

    }


    // ========================================================
    // Expand outgoing neighbors
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
      // routing JSON uses edge.to
      // ======================================================

      if (
        edge?.to == null
      ) {

        console.warn(
          "BFS skipping malformed edge with no `to`:",
          edge
        );

        continue;

      }


      const targetNodeId =
        String(
          edge.to
        );


      // ------------------------------------------------------
      // Make sure target node exists
      // ------------------------------------------------------

      if (
        nodes[
          targetNodeId
        ] == null
      ) {

        console.warn(
          "BFS edge points to missing node:",
          currentNodeId,
          "->",
          targetNodeId
        );

        continue;

      }


      // ------------------------------------------------------
      // Build edge ID
      // ------------------------------------------------------

      const edgeId =
        getEdgeId(
          edge,
          currentNodeId,
          targetNodeId
        );


      // ------------------------------------------------------
      // This edge was examined
      // ------------------------------------------------------

      searchedEdgeIds.add(
        edgeId
      );


      // ------------------------------------------------------
      // BFS only discovers each node once
      // ------------------------------------------------------

      if (
        visited.has(
          targetNodeId
        )
      ) {

        continue;

      }


      // ======================================================
      // Discover target
      // ======================================================

      visited.add(
        targetNodeId
      );


      previous[
        targetNodeId
      ] =
        {

          nodeId:
            currentNodeId,

          edge,

        };


      depth[
        targetNodeId
      ] =
        (
          depth[
            currentNodeId
          ] ?? 0
        ) + 1;


      queue.push(
        targetNodeId
      );


      // ------------------------------------------------------
      // Same shape as Dijkstra/A*
      //
      // Here:
      // oldCost = null because node was undiscovered
      // newCost = BFS depth
      // ------------------------------------------------------

      iterationState
        .relaxedEdges
        .push(
          {

            from:
              currentNodeId,

            to:
              targetNodeId,

            edgeId,

            oldCost:
              null,

            newCost:
              depth[
                targetNodeId
              ],

          }
        );

    }


    // ========================================================
    // Finish iteration snapshot
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
      Array.from(
        queue
      ).map(
        String
      );


    iterationState.frontier =
      getFrontierSnapshot(
        queue,
        depth
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
// Reconstruct BFS path
// ============================================================

function reconstructBfsPath({

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
  // Validate reconstruction
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
// Frontier snapshot
//
// For BFS, "cost" means depth / number of hops from origin.
// ============================================================

function getFrontierSnapshot(
  queue,
  depth
) {

  return queue.map(
    (nodeId) => {

      const id =
        String(
          nodeId
        );


      return {

        nodeId:
          id,

        cost:
          depth[
            id
          ] ?? null,

      };

    }
  );

}