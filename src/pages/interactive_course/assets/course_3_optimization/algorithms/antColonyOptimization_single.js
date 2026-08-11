// ============================================================
// Ant Colony Optimization
// Fixed Origin + Fixed Destination
//
// Problem:
//
// Origin
//   ↓
// Intermediate stops in optimised order
//   ↓
// Destination
//
// The intermediate stop order is optimised using ACO.
//
// Road-network travel cost between every pair of stops is
// calculated using Dijkstra shortest-path search.
// ============================================================


// ============================================================
// Utility
// ============================================================

function safeNumber(
  value,
  fallback = Infinity
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : fallback;

}


// ============================================================
// Read outgoing edges from routingGraph
//
// This function tries to support several common graph formats.
//
// Expected preferred structure:
//
// routingGraph.nodes[nodeId].edges
//
// OR:
//
// routingGraph.adjacency[nodeId]
//
// OR:
//
// routingGraph.edges
// ============================================================

function getOutgoingEdges(
  routingGraph,
  nodeId
) {

  const id =
    String(
      nodeId
    );


  // ----------------------------------------------------------
  // Format 1:
  // routingGraph.adjacency[nodeId]
  // ----------------------------------------------------------

  const adjacency =
    routingGraph
      ?.adjacency
      ?.[id];


  if (
    Array.isArray(
      adjacency
    )
  ) {

    return adjacency.map(
      (
        edge,
        index
      ) => normalizeEdge(
        edge,
        id,
        index
      )
    );

  }


  // ----------------------------------------------------------
  // Format 2:
  // routingGraph.nodes[nodeId].edges
  // ----------------------------------------------------------

  const node =
    routingGraph
      ?.nodes
      ?.[id];


  if (
    Array.isArray(
      node?.edges
    )
  ) {

    return node.edges.map(
      (
        edge,
        index
      ) => normalizeEdge(
        edge,
        id,
        index
      )
    );

  }


  // ----------------------------------------------------------
  // Format 3:
  // routingGraph.nodes[nodeId].neighbors
  // ----------------------------------------------------------

  if (
    Array.isArray(
      node?.neighbors
    )
  ) {

    return node.neighbors.map(
      (
        neighbor,
        index
      ) => {

        if (
          typeof neighbor ===
          "string"
        ) {

          return {

            from:
              id,

            to:
              String(
                neighbor
              ),

            edgeId:
              `${id}-${neighbor}-${index}`,

            weight:
              1,

          };

        }


        return normalizeEdge(
          neighbor,
          id,
          index
        );

      }
    );

  }


  // ----------------------------------------------------------
  // Format 4:
  // global routingGraph.edges object
  // ----------------------------------------------------------

  const globalEdges =
    routingGraph?.edges;


  if (
    globalEdges &&
    typeof globalEdges === "object"
  ) {

    const outgoing =
      [];


    for (
      const [
        edgeId,
        edge
      ]
      of Object.entries(
        globalEdges
      )
    ) {

      const from =
        String(
          edge?.from ??
          edge?.source ??
          edge?.u ??
          ""
        );


      if (
        from !== id
      ) {

        continue;

      }


      outgoing.push({

        ...normalizeEdge(
          edge,
          id,
          outgoing.length
        ),

        edgeId:
          String(
            edge?.edgeId ??
            edge?.edge_id ??
            edgeId
          ),

      });

    }


    return outgoing;

  }


  return [];

}


// ============================================================
// Normalize edge structure
// ============================================================

function normalizeEdge(
  edge,
  fallbackFrom,
  index = 0
) {

  const from =
    String(
      edge?.from ??
      edge?.source ??
      edge?.u ??
      fallbackFrom
    );


  const to =
    String(
      edge?.to ??
      edge?.target ??
      edge?.v ??
      edge?.nodeId ??
      edge?.node_id ??
      edge?.neighbor ??
      ""
    );


  const edgeId =
    String(
      edge?.edgeId ??
      edge?.edge_id ??
      edge?.id ??
      `${from}-${to}-${edge?.key ?? index}`
    );


  const weight =
    safeNumber(

      edge?.weight ??
      edge?.cost ??
      edge?.distance ??
      edge?.length ??
      edge?.travel_time ??
      edge?.travelTime,

      1

    );


  return {

    from,
    to,
    edgeId,
    weight,

  };

}


// ============================================================
// Priority queue
//
// Small binary heap implementation for Dijkstra.
// ============================================================

class MinHeap {

  constructor() {

    this.items =
      [];

  }


  push(
    item
  ) {

    this.items.push(
      item
    );


    this.bubbleUp(
      this.items.length - 1
    );

  }


  pop() {

    if (
      this.items.length === 0
    ) {

      return null;

    }


    if (
      this.items.length === 1
    ) {

      return this.items.pop();

    }


    const root =
      this.items[0];


    this.items[0] =
      this.items.pop();


    this.bubbleDown(
      0
    );


    return root;

  }


  bubbleUp(
    index
  ) {

    let current =
      index;


    while (
      current > 0
    ) {

      const parent =
        Math.floor(
          (
            current - 1
          ) / 2
        );


      if (
        this.items[parent].priority <=
        this.items[current].priority
      ) {

        break;

      }


      [
        this.items[parent],
        this.items[current],
      ] = [
        this.items[current],
        this.items[parent],
      ];


      current =
        parent;

    }

  }


  bubbleDown(
    index
  ) {

    let current =
      index;


    while (
      true
    ) {

      const left =
        current * 2 + 1;


      const right =
        current * 2 + 2;


      let smallest =
        current;


      if (
        left <
          this.items.length &&
        this.items[left].priority <
          this.items[smallest].priority
      ) {

        smallest =
          left;

      }


      if (
        right <
          this.items.length &&
        this.items[right].priority <
          this.items[smallest].priority
      ) {

        smallest =
          right;

      }


      if (
        smallest === current
      ) {

        break;

      }


      [
        this.items[current],
        this.items[smallest],
      ] = [
        this.items[smallest],
        this.items[current],
      ];


      current =
        smallest;

    }

  }


  get size() {

    return this.items.length;

  }

}


// ============================================================
// Dijkstra shortest path
//
// Returns:
// {
//   cost,
//   nodeIds,
//   edgeIds
// }
// ============================================================

function shortestPath(
  routingGraph,
  startNodeId,
  targetNodeId
) {

  const start =
    String(
      startNodeId
    );


  const target =
    String(
      targetNodeId
    );


  if (
    start === target
  ) {

    return {

      cost:
        0,

      nodeIds: [
        start,
      ],

      edgeIds:
        [],

    };

  }


  const distances =
    new Map();


  const previousNode =
    new Map();


  const previousEdge =
    new Map();


  const visited =
    new Set();


  const heap =
    new MinHeap();


  distances.set(
    start,
    0
  );


  heap.push({

    nodeId:
      start,

    priority:
      0,

  });


  while (
    heap.size > 0
  ) {

    const current =
      heap.pop();


    if (!current) {
      break;
    }


    const currentNodeId =
      current.nodeId;


    if (
      visited.has(
        currentNodeId
      )
    ) {

      continue;

    }


    visited.add(
      currentNodeId
    );


    if (
      currentNodeId ===
      target
    ) {

      break;

    }


    const currentDistance =
      distances.get(
        currentNodeId
      ) ??
      Infinity;


    const outgoingEdges =
      getOutgoingEdges(
        routingGraph,
        currentNodeId
      );


    for (
      const edge
      of outgoingEdges
    ) {

      if (
        !edge.to
      ) {

        continue;

      }


      const newDistance =
        currentDistance +
        safeNumber(
          edge.weight,
          Infinity
        );


      const knownDistance =
        distances.get(
          edge.to
        ) ??
        Infinity;


      if (
        newDistance <
        knownDistance
      ) {

        distances.set(
          edge.to,
          newDistance
        );


        previousNode.set(
          edge.to,
          currentNodeId
        );


        previousEdge.set(
          edge.to,
          edge.edgeId
        );


        heap.push({

          nodeId:
            edge.to,

          priority:
            newDistance,

        });

      }

    }

  }


  if (
    !distances.has(
      target
    )
  ) {

    return null;

  }


  // ----------------------------------------------------------
  // Reconstruct path
  // ----------------------------------------------------------

  const nodeIds =
    [];


  const edgeIds =
    [];


  let cursor =
    target;


  nodeIds.push(
    cursor
  );


  while (
    cursor !== start
  ) {

    const prev =
      previousNode.get(
        cursor
      );


    const edgeId =
      previousEdge.get(
        cursor
      );


    if (
      prev == null ||
      edgeId == null
    ) {

      return null;

    }


    edgeIds.push(
      String(
        edgeId
      )
    );


    cursor =
      prev;


    nodeIds.push(
      cursor
    );

  }


  nodeIds.reverse();

  edgeIds.reverse();


  return {

    cost:
      distances.get(
        target
      ),

    nodeIds,

    edgeIds,

  };

}


// ============================================================
// Build pairwise shortest-path matrix
//
// For N optimisation stops, calculate:
//
// stop 0 → stop 1
// stop 0 → stop 2
// ...
//
// This gives ACO a much smaller abstract graph.
// ============================================================

function buildPairwisePaths(
  routingGraph,
  stopNodeIds
) {

  const costMatrix =
    {};


  const pathMatrix =
    {};


  for (
    const fromNodeId
    of stopNodeIds
  ) {

    const from =
      String(
        fromNodeId
      );


    costMatrix[from] =
      {};


    pathMatrix[from] =
      {};


    for (
      const toNodeId
      of stopNodeIds
    ) {

      const to =
        String(
          toNodeId
        );


      if (
        from === to
      ) {

        costMatrix[from][to] =
          0;


        pathMatrix[from][to] = {

          cost:
            0,

          nodeIds: [
            from,
          ],

          edgeIds:
            [],

        };


        continue;

      }


      const path =
        shortestPath(
          routingGraph,
          from,
          to
        );


      if (!path) {

        costMatrix[from][to] =
          Infinity;


        pathMatrix[from][to] =
          null;

      }

      else {

        costMatrix[from][to] =
          path.cost;


        pathMatrix[from][to] =
          path;

      }

    }

  }


  return {

    costMatrix,
    pathMatrix,

  };

}


// ============================================================
// Roulette-wheel selection
// ============================================================

function chooseNextStop({

  currentNodeId,

  candidates,

  pheromone,

  costMatrix,

  alpha,

  beta,

}) {

  const current =
    String(
      currentNodeId
    );


  const desirabilities =
    candidates.map(
      (
        candidate
      ) => {

        const next =
          String(
            candidate
          );


        const tau =
          Math.pow(

            pheromone
              ?.[current]
              ?.[next] ??
            1,

            alpha

          );


        const distance =
          costMatrix
            ?.[current]
            ?.[next] ??
          Infinity;


        if (
          !Number.isFinite(
            distance
          ) ||
          distance <= 0
        ) {

          return {

            nodeId:
              next,

            score:
              0,

          };

        }


        const eta =
          Math.pow(
            1 / distance,
            beta
          );


        return {

          nodeId:
            next,

          score:
            tau * eta,

        };

      }
    );


  const total =
    desirabilities.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.score,
      0
    );


  // ----------------------------------------------------------
  // Fall back to random candidate
  // ----------------------------------------------------------

  if (
    total <= 0 ||
    !Number.isFinite(
      total
    )
  ) {

    return candidates[
      Math.floor(
        Math.random() *
        candidates.length
      )
    ];

  }


  let threshold =
    Math.random() *
    total;


  for (
    const item
    of desirabilities
  ) {

    threshold -=
      item.score;


    if (
      threshold <= 0
    ) {

      return item.nodeId;

    }

  }


  return desirabilities[
    desirabilities.length - 1
  ].nodeId;

}


// ============================================================
// Calculate abstract tour cost
// ============================================================

function calculateTourCost(
  tour,
  costMatrix
) {

  let total =
    0;


  for (
    let i = 0;
    i < tour.length - 1;
    i += 1
  ) {

    const from =
      String(
        tour[i]
      );


    const to =
      String(
        tour[i + 1]
      );


    const cost =
      costMatrix
        ?.[from]
        ?.[to];


    if (
      !Number.isFinite(
        cost
      )
    ) {

      return Infinity;

    }


    total +=
      cost;

  }


  return total;

}


// ============================================================
// Convert best abstract tour back to the complete road route
// ============================================================

function reconstructRoadRoute(
  bestTour,
  pathMatrix
) {

  const nodeIds =
    [];


  const edgeIds =
    [];


  for (
    let i = 0;
    i < bestTour.length - 1;
    i += 1
  ) {

    const from =
      String(
        bestTour[i]
      );


    const to =
      String(
        bestTour[i + 1]
      );


    const segment =
      pathMatrix
        ?.[from]
        ?.[to];


    if (!segment) {

      throw new Error(
        `No road-network path exists between ${from} and ${to}.`
      );

    }


    // --------------------------------------------------------
    // Avoid duplicating boundary nodes
    // --------------------------------------------------------

    if (
      nodeIds.length === 0
    ) {

      nodeIds.push(
        ...segment.nodeIds
      );

    }

    else {

      nodeIds.push(
        ...segment.nodeIds.slice(
          1
        )
      );

    }


    edgeIds.push(
      ...segment.edgeIds
    );

  }


  return {

    nodeIds,
    edgeIds,

  };

}


// ============================================================
// Main Ant Colony Optimization
// ============================================================

export async function antColonyOptimization({

  routingGraph,

  stopNodeIds,

  originNodeId,

  destinationNodeId,

  waypointNodeIds,

  iterations = 100,

  numberOfAnts = 30,

  alpha = 1,

  beta = 2,

  evaporationRate = 0.5,

  pheromoneDeposit = 1,

}) {

  // ==========================================================
  // Validate inputs
  // ==========================================================

  if (!routingGraph) {

    throw new Error(
      "routingGraph is required."
    );

  }


  const origin =
    String(
      originNodeId ??
      stopNodeIds?.[0] ??
      ""
    );


  const destination =
    String(
      destinationNodeId ??
      stopNodeIds?.[
        stopNodeIds.length - 1
      ] ??
      ""
    );


  const waypoints =
    (
      waypointNodeIds ??
      stopNodeIds?.slice(
        1,
        -1
      ) ??
      []
    ).map(
      String
    );


  if (
    !origin ||
    !destination
  ) {

    throw new Error(
      "Origin and destination are required."
    );

  }


  if (
    waypoints.length < 1
  ) {

    throw new Error(
      "At least one intermediate stop is required."
    );

  }


  const allStopNodeIds = [

    origin,

    ...waypoints,

    destination,

  ];


  // ==========================================================
  // Build stop-to-stop road-network shortest paths
  // ==========================================================

  const {
    costMatrix,
    pathMatrix,
  } =
    buildPairwisePaths(
      routingGraph,
      allStopNodeIds
    );


  // ==========================================================
  // Initialize pheromone matrix
  // ==========================================================

  const pheromone =
    {};


  for (
    const from
    of allStopNodeIds
  ) {

    pheromone[from] =
      {};


    for (
      const to
      of allStopNodeIds
    ) {

      if (
        from === to
      ) {

        pheromone[from][to] =
          0;

      }

      else {

        pheromone[from][to] =
          1;

      }

    }

  }


  // ==========================================================
  // ACO state
  // ==========================================================

  let bestTour =
    null;


  let bestCost =
    Infinity;


  let initialBestCost =
    null;


  const history =
    [];


  const safeIterations =
    Math.max(
      1,
      Number(
        iterations
      ) || 1
    );


  const safeAntCount =
    Math.max(
      1,
      Number(
        numberOfAnts
      ) || 1
    );


  // ==========================================================
  // Main iteration loop
  // ==========================================================

  for (
    let iteration = 0;
    iteration < safeIterations;
    iteration += 1
  ) {

    const antSolutions =
      [];


    // ========================================================
    // Construct one solution per ant
    // ========================================================

    for (
      let ant = 0;
      ant < safeAntCount;
      ant += 1
    ) {

      const remaining =
        [...waypoints];


      const tour = [
        origin,
      ];


      let current =
        origin;


      // ------------------------------------------------------
      // Choose intermediate stops
      // ------------------------------------------------------

      while (
        remaining.length > 0
      ) {

        const next =
          chooseNextStop({

            currentNodeId:
              current,

            candidates:
              remaining,

            pheromone,

            costMatrix,

            alpha,

            beta,

          });


        tour.push(
          next
        );


        const index =
          remaining.indexOf(
            next
          );


        if (
          index >= 0
        ) {

          remaining.splice(
            index,
            1
          );

        }


        current =
          next;

      }


      // ------------------------------------------------------
      // Destination is always last
      // ------------------------------------------------------

      tour.push(
        destination
      );


      const cost =
        calculateTourCost(
          tour,
          costMatrix
        );


      if (
        Number.isFinite(
          cost
        )
      ) {

        antSolutions.push({

          tour,
          cost,

        });


        if (
          cost <
          bestCost
        ) {

          bestCost =
            cost;


          bestTour =
            [...tour];

        }

      }

    }


    // ========================================================
    // Initial baseline
    // ========================================================

    if (
      iteration === 0 &&
      Number.isFinite(
        bestCost
      )
    ) {

      initialBestCost =
        bestCost;

    }


    // ========================================================
    // Evaporate pheromone
    // ========================================================

    for (
      const from
      of allStopNodeIds
    ) {

      for (
        const to
        of allStopNodeIds
      ) {

        if (
          from === to
        ) {

          continue;

        }


        pheromone[from][to] *=
          (
            1 -
            evaporationRate
          );


        // Avoid pheromone completely disappearing

        pheromone[from][to] =
          Math.max(
            pheromone[from][to],
            1e-12
          );

      }

    }


    // ========================================================
    // Deposit pheromone from all successful ants
    // ========================================================

    for (
      const solution
      of antSolutions
    ) {

      const deposit =
        pheromoneDeposit /
        solution.cost;


      for (
        let i = 0;
        i < solution.tour.length - 1;
        i += 1
      ) {

        const from =
          solution.tour[i];


        const to =
          solution.tour[i + 1];


        pheromone[from][to] +=
          deposit;

      }

    }


    // ========================================================
    // Save convergence history
    // ========================================================

    history.push({

      iteration:
        iteration + 1,

      bestCost:
        Number.isFinite(
          bestCost
        )
          ? bestCost
          : null,

      antCount:
        antSolutions.length,

    });


    // ========================================================
    // Give React/browser occasional breathing room
    // ========================================================

    if (
      iteration % 20 === 0
    ) {

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            0
          )
      );

    }

  }


  // ==========================================================
  // No valid solution
  // ==========================================================

  if (
    !bestTour ||
    !Number.isFinite(
      bestCost
    )
  ) {

    throw new Error(
      "ACO could not construct a valid tour. Some generated stops may not be connected through the directed road network."
    );

  }


  // ==========================================================
  // Reconstruct real road-network route
  // ==========================================================

  const {
    nodeIds,
    edgeIds,
  } =
    reconstructRoadRoute(
      bestTour,
      pathMatrix
    );


  // ==========================================================
  // Improvement
  // ==========================================================

  let improvement =
    null;


  if (
    Number.isFinite(
      initialBestCost
    ) &&
    initialBestCost > 0
  ) {

    improvement =
      (
        (
          initialBestCost -
          bestCost
        ) /
        initialBestCost
      ) *
      100;

  }


  // ==========================================================
  // Return result
  // ==========================================================

  return {

    algorithm:
      "aco",

    bestTour,

    tourNodeIds:
      bestTour,

    bestCost,

    cost:
      bestCost,

    nodeIds,

    edgeIds,

    history,

    improvement,

    iterationsCompleted:
      safeIterations,

    numberOfAnts:
      safeAntCount,

    parameters: {

      alpha,

      beta,

      evaporationRate,

      pheromoneDeposit,

    },

  };

}


// ============================================================
// Optional default export
// ============================================================

export default antColonyOptimization;