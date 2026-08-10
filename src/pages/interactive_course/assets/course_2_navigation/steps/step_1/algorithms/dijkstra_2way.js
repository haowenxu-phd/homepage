// ============================================================
// Bidirectional Dijkstra
//
// Two simultaneous searches:
//
// Forward:
// Origin → Destination
//
// Backward:
// Destination → Origin
//
// IMPORTANT:
// The backward search must traverse REVERSED directed edges.
//
// Input format is identical to dijkstra.js:
//
// dijkstra2way({
//   graph,
//   startNodeId,
//   endNodeId,
//   weightMode
// })
//
// Output format is compatible with dijkstra.js:
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
// Additional iteration fields are provided for visualization:
// - currentForwardNodeId
// - currentBackwardNodeId
// - forwardVisitedNodeIds
// - backwardVisitedNodeIds
// - meetingNodeId
// ============================================================

export function dijkstra2way({

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
      "Bidirectional Dijkstra requires graph, startNodeId, and endNodeId."
    );

    return null;

  }


  // ==========================================================
  // Normalize IDs
  // ==========================================================

  const startId =
    String(
      startNodeId
    );


  const endId =
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
  // Validate nodes
  // ==========================================================

  if (
    nodes[startId] == null
  ) {

    console.error(
      "Bidirectional Dijkstra start node does not exist:",
      startId
    );

    return null;

  }


  if (
    nodes[endId] == null
  ) {

    console.error(
      "Bidirectional Dijkstra destination node does not exist:",
      endId
    );

    return null;

  }


  // ==========================================================
  // Trivial route
  // ==========================================================

  if (
    startId === endId
  ) {

    return {

      found:
        true,

      nodeIds:
        [
          startId,
        ],

      edgeIds:
        [],

      searchOrder:
        [
          startId,
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
              startId,

            currentForwardNodeId:
              startId,

            currentBackwardNodeId:
              endId,

            currentCost:
              0,

            visitedNodeIds:
              [
                startId,
              ],

            visitedEdgeIds:
              [],

            frontierNodeIds:
              [],

            frontier:
              [],

            relaxedEdges:
              [],

            forwardVisitedNodeIds:
              [
                startId,
              ],

            backwardVisitedNodeIds:
              [
                endId,
              ],

            meetingNodeId:
              startId,

            destinationReached:
              true,

          },

        ],

    };

  }


  // ==========================================================
  // Build reverse adjacency
  //
  // Original:
  //
  // A → B
  //
  // Reverse representation:
  //
  // B → A
  //
  // We retain the ORIGINAL edge because the final route must
  // still use A → B.
  // ==========================================================

  const reverseAdjacency =
    buildReverseAdjacency(
      adjacency
    );


  // ==========================================================
  // Distances
  // ==========================================================

  const forwardDistances =
    {};


  const backwardDistances =
    {};


  // ==========================================================
  // Path reconstruction
  // ==========================================================

  // Forward:
  //
  // previousForward[B] =
  // {
  //   nodeId: A,
  //   edge: A→B
  // }

  const previousForward =
    {};


  // Backward:
  //
  // nextBackward[A] =
  // {
  //   nodeId: B,
  //   edge: A→B
  // }
  //
  // This allows:
  //
  // meeting → ... → destination

  const nextBackward =
    {};


  // ==========================================================
  // Initialize node state
  // ==========================================================

  for (
    const nodeId
    of Object.keys(
      nodes
    )
  ) {

    forwardDistances[
      nodeId
    ] =
      Infinity;


    backwardDistances[
      nodeId
    ] =
      Infinity;


    previousForward[
      nodeId
    ] =
      null;


    nextBackward[
      nodeId
    ] =
      null;

  }


  forwardDistances[
    startId
  ] =
    0;


  backwardDistances[
    endId
  ] =
    0;


  // ==========================================================
  // Priority queues
  //
  // Array implementation is fine for ~1,500 nodes.
  // ==========================================================

  const forwardQueue =
    [

      {
        nodeId:
          startId,

        cost:
          0,
      },

    ];


  const backwardQueue =
    [

      {
        nodeId:
          endId,

        cost:
          0,
      },

    ];


  // ==========================================================
  // Settled nodes
  // ==========================================================

  const forwardVisited =
    new Set();


  const backwardVisited =
    new Set();


  // Combined sets used by existing visualization
  const searchedEdgeIds =
    new Set();


  const searchOrder =
    [];


  const iterations =
    [];


  // ==========================================================
  // Best route discovered so far
  // ==========================================================

  let meetingNodeId =
    null;


  let bestPathCost =
    Infinity;


  // ==========================================================
  // Main bidirectional search
  // ==========================================================

  while (
    forwardQueue.length > 0 &&
    backwardQueue.length > 0
  ) {

    // --------------------------------------------------------
    // Remove stale queue entries and find current minimums
    // --------------------------------------------------------

    cleanQueue(
      forwardQueue,
      forwardVisited
    );


    cleanQueue(
      backwardQueue,
      backwardVisited
    );


    if (
      forwardQueue.length === 0 ||
      backwardQueue.length === 0
    ) {

      break;

    }


    // --------------------------------------------------------
    // Correct bidirectional Dijkstra stopping rule
    //
    // If the best remaining forward cost +
    // best remaining backward cost cannot improve the
    // best complete route discovered, stop.
    // --------------------------------------------------------

    const minimumForwardCost =
      getMinimumQueueCost(
        forwardQueue
      );


    const minimumBackwardCost =
      getMinimumQueueCost(
        backwardQueue
      );


    if (
      meetingNodeId != null &&
      minimumForwardCost +
      minimumBackwardCost >=
      bestPathCost
    ) {

      break;

    }


    // ========================================================
    // One animation iteration contains:
    //
    // 1 forward expansion
    // +
    // 1 backward expansion
    // ========================================================

    const iterationState =
      {

        iteration:
          iterations.length,

        currentNodeId:
          null,

        currentForwardNodeId:
          null,

        currentBackwardNodeId:
          null,

        currentCost:
          null,

        visitedNodeIds:
          [],

        visitedEdgeIds:
          [],

        frontierNodeIds:
          [],

        frontier:
          [],

        relaxedEdges:
          [],

        forwardVisitedNodeIds:
          [],

        backwardVisitedNodeIds:
          [],

        forwardFrontierNodeIds:
          [],

        backwardFrontierNodeIds:
          [],

        meetingNodeId,

        bestPathCost:
          Number.isFinite(
            bestPathCost
          )
            ? bestPathCost
            : null,

        destinationReached:
          false,

      };


    // ========================================================
    // FORWARD EXPANSION
    // ========================================================

    const forwardCurrent =
      popLowestCost(
        forwardQueue,
        forwardVisited
      );


    if (
      forwardCurrent
    ) {

      const currentNodeId =
        String(
          forwardCurrent.nodeId
        );


      forwardVisited.add(
        currentNodeId
      );


      searchOrder.push(
        currentNodeId
      );


      iterationState.currentNodeId =
        currentNodeId;


      iterationState.currentForwardNodeId =
        currentNodeId;


      iterationState.currentCost =
        forwardDistances[
          currentNodeId
        ];


      // ------------------------------------------------------
      // If backward search already reached this node,
      // we have a complete candidate route.
      // ------------------------------------------------------

      if (
        Number.isFinite(
          backwardDistances[
            currentNodeId
          ]
        )
      ) {

        const candidateCost =
          forwardDistances[
            currentNodeId
          ] +
          backwardDistances[
            currentNodeId
          ];


        if (
          candidateCost <
          bestPathCost
        ) {

          bestPathCost =
            candidateCost;


          meetingNodeId =
            currentNodeId;

        }

      }


      // ------------------------------------------------------
      // Expand normal outgoing directed edges
      // ------------------------------------------------------

      const neighbours =
        adjacency[
          currentNodeId
        ] ??
        [];


      for (
        const edge
        of neighbours
      ) {

        if (
          edge?.to == null
        ) {

          continue;

        }


        const targetNodeId =
          String(
            edge.to
          );


        if (
          nodes[targetNodeId] ==
          null
        ) {

          continue;

        }


        const edgeId =
          getEdgeId(
            edge,
            currentNodeId,
            targetNodeId
          );


        searchedEdgeIds.add(
          edgeId
        );


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

          continue;

        }


        const oldCost =
          forwardDistances[
            targetNodeId
          ];


        const newCost =
          forwardDistances[
            currentNodeId
          ] +
          edgeWeight;


        // ----------------------------------------------------
        // Forward relaxation
        // ----------------------------------------------------

        if (
          newCost <
          oldCost
        ) {

          forwardDistances[
            targetNodeId
          ] =
            newCost;


          previousForward[
            targetNodeId
          ] =
            {

              nodeId:
                currentNodeId,

              edge,

            };


          forwardQueue.push(
            {

              nodeId:
                targetNodeId,

              cost:
                newCost,

            }
          );


          iterationState
            .relaxedEdges
            .push(
              {

                direction:
                  "forward",

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


        // ----------------------------------------------------
        // Does backward search already know this target?
        // ----------------------------------------------------

        if (
          Number.isFinite(
            forwardDistances[
              targetNodeId
            ]
          ) &&
          Number.isFinite(
            backwardDistances[
              targetNodeId
            ]
          )
        ) {

          const candidateCost =
            forwardDistances[
              targetNodeId
            ] +
            backwardDistances[
              targetNodeId
            ];


          if (
            candidateCost <
            bestPathCost
          ) {

            bestPathCost =
              candidateCost;


            meetingNodeId =
              targetNodeId;

          }

        }

      }

    }


    // ========================================================
    // BACKWARD EXPANSION
    //
    // Search from destination through incoming edges.
    // ========================================================

    const backwardCurrent =
      popLowestCost(
        backwardQueue,
        backwardVisited
      );


    if (
      backwardCurrent
    ) {

      const currentNodeId =
        String(
          backwardCurrent.nodeId
        );


      backwardVisited.add(
        currentNodeId
      );


      searchOrder.push(
        currentNodeId
      );


      iterationState.currentBackwardNodeId =
        currentNodeId;


      // If forward expansion did not occur, expose the
      // backward node through currentNodeId for compatibility.

      if (
        iterationState.currentNodeId ==
        null
      ) {

        iterationState.currentNodeId =
          currentNodeId;


        iterationState.currentCost =
          backwardDistances[
            currentNodeId
          ];

      }


      // ------------------------------------------------------
      // Have the two searches met?
      // ------------------------------------------------------

      if (
        Number.isFinite(
          forwardDistances[
            currentNodeId
          ]
        )
      ) {

        const candidateCost =
          forwardDistances[
            currentNodeId
          ] +
          backwardDistances[
            currentNodeId
          ];


        if (
          candidateCost <
          bestPathCost
        ) {

          bestPathCost =
            candidateCost;


          meetingNodeId =
            currentNodeId;

        }

      }


      // ------------------------------------------------------
      // Reverse neighbours represent ORIGINAL incoming edges.
      //
      // reverseEdge:
      //
      // {
      //   from: predecessor,
      //   edge: original predecessor → current
      // }
      // ------------------------------------------------------

      const reverseNeighbours =
        reverseAdjacency[
          currentNodeId
        ] ??
        [];


      for (
        const reverseEdge
        of reverseNeighbours
      ) {

        const predecessorNodeId =
          String(
            reverseEdge.from
          );


        const edge =
          reverseEdge.edge;


        if (
          nodes[
            predecessorNodeId
          ] == null
        ) {

          continue;

        }


        const edgeId =
          getEdgeId(
            edge,
            predecessorNodeId,
            currentNodeId
          );


        searchedEdgeIds.add(
          edgeId
        );


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

          continue;

        }


        const oldCost =
          backwardDistances[
            predecessorNodeId
          ];


        const newCost =
          backwardDistances[
            currentNodeId
          ] +
          edgeWeight;


        // ----------------------------------------------------
        // Backward relaxation
        // ----------------------------------------------------

        if (
          newCost <
          oldCost
        ) {

          backwardDistances[
            predecessorNodeId
          ] =
            newCost;


          // IMPORTANT:
          //
          // Original road direction is:
          //
          // predecessor → current
          //
          // Therefore when reconstructing toward destination:
          //
          // predecessor's next node = current

          nextBackward[
            predecessorNodeId
          ] =
            {

              nodeId:
                currentNodeId,

              edge,

            };


          backwardQueue.push(
            {

              nodeId:
                predecessorNodeId,

              cost:
                newCost,

            }
          );


          iterationState
            .relaxedEdges
            .push(
              {

                direction:
                  "backward",

                // Preserve ORIGINAL road direction
                from:
                  predecessorNodeId,

                to:
                  currentNodeId,

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


        // ----------------------------------------------------
        // Has forward search reached predecessor?
        // ----------------------------------------------------

        if (
          Number.isFinite(
            forwardDistances[
              predecessorNodeId
            ]
          ) &&
          Number.isFinite(
            backwardDistances[
              predecessorNodeId
            ]
          )
        ) {

          const candidateCost =
            forwardDistances[
              predecessorNodeId
            ] +
            backwardDistances[
              predecessorNodeId
            ];


          if (
            candidateCost <
            bestPathCost
          ) {

            bestPathCost =
              candidateCost;


            meetingNodeId =
              predecessorNodeId;

          }

        }

      }

    }


    // ========================================================
    // Complete iteration snapshot
    // ========================================================

    const combinedVisited =
      new Set([
        ...forwardVisited,
        ...backwardVisited,
      ]);


    const forwardFrontierNodeIds =
      getUniqueFrontierNodeIds(
        forwardQueue,
        forwardVisited
      );


    const backwardFrontierNodeIds =
      getUniqueFrontierNodeIds(
        backwardQueue,
        backwardVisited
      );


    const combinedFrontier =
      new Set([
        ...forwardFrontierNodeIds,
        ...backwardFrontierNodeIds,
      ]);


    iterationState.visitedNodeIds =
      Array.from(
        combinedVisited
      );


    iterationState.visitedEdgeIds =
      Array.from(
        searchedEdgeIds
      );


    iterationState.forwardVisitedNodeIds =
      Array.from(
        forwardVisited
      );


    iterationState.backwardVisitedNodeIds =
      Array.from(
        backwardVisited
      );


    iterationState.forwardFrontierNodeIds =
      forwardFrontierNodeIds;


    iterationState.backwardFrontierNodeIds =
      backwardFrontierNodeIds;


    iterationState.frontierNodeIds =
      Array.from(
        combinedFrontier
      );


    iterationState.frontier =
      [

        ...getFrontierSnapshot(
          forwardQueue,
          forwardVisited
        ).map(
          (item) => ({
            ...item,
            direction:
              "forward",
          })
        ),

        ...getFrontierSnapshot(
          backwardQueue,
          backwardVisited
        ).map(
          (item) => ({
            ...item,
            direction:
              "backward",
          })
        ),

      ];


    iterationState.meetingNodeId =
      meetingNodeId;


    iterationState.bestPathCost =
      Number.isFinite(
        bestPathCost
      )
        ? bestPathCost
        : null;


    iterationState.destinationReached =
      meetingNodeId != null;


    iterations.push(
      iterationState
    );

  }


  // ==========================================================
  // No route
  // ==========================================================

  if (
    meetingNodeId == null ||
    !Number.isFinite(
      bestPathCost
    )
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
        new Set(
          searchOrder
        ).size,

      edgesVisited:
        searchedEdgeIds.size,

      cost:
        Infinity,

      iterations,

    };

  }


  // ==========================================================
  // Reconstruct final path
  // ==========================================================

  const reconstructed =
    reconstructBidirectionalPath({

      startId,

      endId,

      meetingNodeId,

      previousForward,

      nextBackward,

    });


  if (
    !reconstructed
  ) {

    console.error(
      "Bidirectional Dijkstra found a meeting point but path reconstruction failed.",
      {
        startId,
        endId,
        meetingNodeId,
      }
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
        new Set(
          searchOrder
        ).size,

      edgesVisited:
        searchedEdgeIds.size,

      cost:
        Infinity,

      iterations,

    };

  }


  // ==========================================================
  // Mark final animation state
  // ==========================================================

  if (
    iterations.length > 0
  ) {

    const finalIteration =
      iterations[
        iterations.length - 1
      ];


    finalIteration.destinationReached =
      true;


    finalIteration.meetingNodeId =
      meetingNodeId;


    finalIteration.bestPathCost =
      bestPathCost;

  }


  // ==========================================================
  // Return same principal format as dijkstra()
  // ==========================================================

  return {

    found:
      true,

    nodeIds:
      reconstructed.nodeIds,

    edgeIds:
      reconstructed.edgeIds,

    searchOrder,

    nodesVisited:
      new Set(
        searchOrder
      ).size,

    edgesVisited:
      searchedEdgeIds.size,

    cost:
      bestPathCost,

    iterations,

  };

}


// ============================================================
// Build reverse adjacency
//
// For every original:
//
// u → v
//
// create reverse lookup:
//
// reverse[v] contains u
//
// NOTE:
// We do NOT reverse the actual road edge.
// We preserve the original edge object.
// ============================================================

function buildReverseAdjacency(
  adjacency
) {

  const reverse =
    {};


  // ----------------------------------------------------------
  // Initialize all known adjacency nodes
  // ----------------------------------------------------------

  for (
    const nodeId
    of Object.keys(
      adjacency
    )
  ) {

    reverse[
      String(nodeId)
    ] =
      [];

  }


  // ----------------------------------------------------------
  // Build incoming-edge lookup
  // ----------------------------------------------------------

  for (
    const [
      fromNodeId,
      edges,
    ]
    of Object.entries(
      adjacency
    )
  ) {

    for (
      const edge
      of edges ?? []
    ) {

      if (
        edge?.to == null
      ) {

        continue;

      }


      const toNodeId =
        String(
          edge.to
        );


      if (
        !reverse[
          toNodeId
        ]
      ) {

        reverse[
          toNodeId
        ] =
          [];

      }


      reverse[
        toNodeId
      ].push(
        {

          from:
            String(
              fromNodeId
            ),

          edge,

        }
      );

    }

  }


  return reverse;

}


// ============================================================
// Reconstruct complete route
// ============================================================

function reconstructBidirectionalPath({

  startId,
  endId,

  meetingNodeId,

  previousForward,
  nextBackward,

}) {

  // ==========================================================
  // Forward section:
  //
  // start → meeting
  // ==========================================================

  const forwardNodes =
    [];


  const forwardEdges =
    [];


  let current =
    meetingNodeId;


  while (
    current != null
  ) {

    forwardNodes.push(
      current
    );


    if (
      current === startId
    ) {

      break;

    }


    const previousInfo =
      previousForward[
        current
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
        current
      );


    forwardEdges.push(
      edgeId
    );


    current =
      previousNodeId;

  }


  // We currently have:
  //
  // meeting → ... → start

  forwardNodes.reverse();
  forwardEdges.reverse();


  // ==========================================================
  // Backward section:
  //
  // meeting → destination
  // ==========================================================

  const backwardNodes =
    [];


  const backwardEdges =
    [];


  current =
    meetingNodeId;


  while (
    current !== endId
  ) {

    const nextInfo =
      nextBackward[
        current
      ];


    if (
      !nextInfo
    ) {

      return null;

    }


    const nextNodeId =
      String(
        nextInfo.nodeId
      );


    const edgeId =
      getEdgeId(
        nextInfo.edge,
        current,
        nextNodeId
      );


    backwardEdges.push(
      edgeId
    );


    backwardNodes.push(
      nextNodeId
    );


    current =
      nextNodeId;

  }


  // ==========================================================
  // Combine
  //
  // forwardNodes already includes meeting.
  // backwardNodes starts AFTER meeting.
  // ==========================================================

  return {

    nodeIds:
      [
        ...forwardNodes,
        ...backwardNodes,
      ],

    edgeIds:
      [
        ...forwardEdges,
        ...backwardEdges,
      ],

  };

}


// ============================================================
// Get edge ID
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
// Remove visited/stale items from front after sorting
// ============================================================

function cleanQueue(
  queue,
  visited
) {

  queue.sort(
    (a, b) =>
      a.cost -
      b.cost
  );


  while (
    queue.length > 0 &&
    visited.has(
      String(
        queue[0].nodeId
      )
    )
  ) {

    queue.shift();

  }

}


// ============================================================
// Pop lowest-cost unvisited node
// ============================================================

function popLowestCost(
  queue,
  visited
) {

  cleanQueue(
    queue,
    visited
  );


  if (
    queue.length === 0
  ) {

    return null;

  }


  return queue.shift();

}


// ============================================================
// Minimum queue cost
// ============================================================

function getMinimumQueueCost(
  queue
) {

  if (
    queue.length === 0
  ) {

    return Infinity;

  }


  queue.sort(
    (a, b) =>
      a.cost -
      b.cost
  );


  return Number(
    queue[0].cost
  );

}


// ============================================================
// Unique frontier node IDs
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


    const previousCost =
      bestCosts.get(
        nodeId
      );


    if (
      previousCost == null ||
      cost <
      previousCost
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
      ]) => ({

        nodeId,

        cost,

      })
    )
    .sort(
      (a, b) =>
        a.cost -
        b.cost
    );

}