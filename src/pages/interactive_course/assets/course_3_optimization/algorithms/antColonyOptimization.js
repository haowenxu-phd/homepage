// ============================================================
// Ant Colony Optimization
//
// Fixed-origin / fixed-destination multi-stop optimisation.
//
// Example:
//
// Origin
//   ↓
// Stop 3
//   ↓
// Stop 1
//   ↓
// Stop 4
//   ↓
// Stop 2
//   ↓
// Destination
//
// IMPORTANT:
//
// ACO operates on an ABSTRACT graph containing only:
//
// Origin + Intermediate Stops + Destination
//
// The travel cost between two optimisation stops is obtained
// from the REAL road network using Dijkstra shortest path.
//
// The function also exports one animation frame per iteration.
// Each frame contains the actual road-network edge IDs needed
// by Leaflet.
// ============================================================


// ============================================================
// Numeric helper
// ============================================================

function safeNumber(
  value,
  fallback = Infinity
) {

  const numeric =
    Number(
      value
    );


  return Number.isFinite(
    numeric
  )
    ? numeric
    : fallback;

}


// ============================================================
// Normalize a routing edge
// ============================================================

function normalizeEdge(
  edge,
  fallbackFrom,
  index = 0,
  fallbackEdgeId = null
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
      fallbackEdgeId ??
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
// Get outgoing road-network edges
//
// This supports several possible routingGraph structures.
//
// If your graph has one known fixed structure later, this
// function can be simplified.
// ============================================================

function getOutgoingEdges(
  routingGraph,
  nodeId
) {

  const id =
    String(
      nodeId
    );


  // ==========================================================
  // Format 1
  //
  // routingGraph.adjacency[nodeId]
  // ==========================================================

  const adjacency =
    routingGraph
      ?.adjacency
      ?.[id];


  if (
    Array.isArray(
      adjacency
    )
  ) {

    return adjacency
      .map(
        (
          edge,
          index
        ) =>
          normalizeEdge(
            edge,
            id,
            index
          )
      )
      .filter(
        edge =>
          edge.to
      );

  }


  // ==========================================================
  // Format 2
  //
  // routingGraph.nodes[nodeId].edges
  // ==========================================================

  const node =
    routingGraph
      ?.nodes
      ?.[id];


  if (
    Array.isArray(
      node?.edges
    )
  ) {

    return node.edges
      .map(
        (
          edge,
          index
        ) =>
          normalizeEdge(
            edge,
            id,
            index
          )
      )
      .filter(
        edge =>
          edge.to
      );

  }


  // ==========================================================
  // Format 3
  //
  // routingGraph.nodes[nodeId].neighbors
  // ==========================================================

  if (
    Array.isArray(
      node?.neighbors
    )
  ) {

    return node.neighbors
      .map(
        (
          neighbor,
          index
        ) => {

          if (
            typeof neighbor ===
            "string" ||
            typeof neighbor ===
            "number"
          ) {

            return {

              from:
                id,

              to:
                String(
                  neighbor
                ),

              edgeId:
                `${id}-${String(
                  neighbor
                )}-${index}`,

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
      )
      .filter(
        edge =>
          edge.to
      );

  }


  // ==========================================================
  // Format 4
  //
  // routingGraph.edges
  // ==========================================================

  const globalEdges =
    routingGraph?.edges;


  if (
    globalEdges &&
    typeof globalEdges ===
      "object"
  ) {

    const outgoing =
      [];


    for (
      const [
        edgeKey,
        edge
      ]
      of Object.entries(
        globalEdges
      )
    ) {

      const normalized =
        normalizeEdge(
          edge,
          id,
          outgoing.length,
          edgeKey
        );


      if (
        normalized.from !==
        id
      ) {

        continue;

      }


      if (
        !normalized.to
      ) {

        continue;

      }


      outgoing.push(
        normalized
      );

    }


    return outgoing;

  }


  return [];

}


// ============================================================
// Binary minimum heap
//
// Used by Dijkstra.
// ============================================================

class MinHeap {

  constructor() {

    this.items =
      [];

  }


  get size() {

    return this.items.length;

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
        this.items[parent]
          .priority <=
        this.items[current]
          .priority
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
        this.items[left]
          .priority <
        this.items[smallest]
          .priority
      ) {

        smallest =
          left;

      }


      if (
        right <
          this.items.length &&
        this.items[right]
          .priority <
        this.items[smallest]
          .priority
      ) {

        smallest =
          right;

      }


      if (
        smallest ===
        current
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

}


// ============================================================
// Dijkstra shortest path
//
// Returns:
//
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


  const settled =
    new Set();


  const queue =
    new MinHeap();


  distances.set(
    start,
    0
  );


  queue.push({

    nodeId:
      start,

    priority:
      0,

  });


  while (
    queue.size > 0
  ) {

    const current =
      queue.pop();


    if (!current) {
      break;
    }


    const currentNodeId =
      String(
        current.nodeId
      );


    if (
      settled.has(
        currentNodeId
      )
    ) {

      continue;

    }


    settled.add(
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

      const nextNodeId =
        String(
          edge.to
        );


      const weight =
        safeNumber(
          edge.weight,
          Infinity
        );


      if (
        !Number.isFinite(
          weight
        )
      ) {

        continue;

      }


      const candidateDistance =
        currentDistance +
        weight;


      const knownDistance =
        distances.get(
          nextNodeId
        ) ??
        Infinity;


      if (
        candidateDistance <
        knownDistance
      ) {

        distances.set(
          nextNodeId,
          candidateDistance
        );


        previousNode.set(
          nextNodeId,
          currentNodeId
        );


        previousEdge.set(
          nextNodeId,
          String(
            edge.edgeId
          )
        );


        queue.push({

          nodeId:
            nextNodeId,

          priority:
            candidateDistance,

        });

      }

    }

  }


  // ==========================================================
  // No path
  // ==========================================================

  if (
    !distances.has(
      target
    )
  ) {

    return null;

  }


  // ==========================================================
  // Reconstruct route
  // ==========================================================

  const nodeIds =
    [
      target,
    ];


  const edgeIds =
    [];


  let cursor =
    target;


  while (
    cursor !== start
  ) {

    const previous =
      previousNode.get(
        cursor
      );


    const edgeId =
      previousEdge.get(
        cursor
      );


    if (
      previous == null ||
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
      previous;


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
// Construct pairwise road-network paths between optimisation
// stops.
//
// This is important:
//
// ACO should NOT repeatedly run Dijkstra for every ant.
//
// We calculate:
//
// O → S1
// O → S2
// S1 → S2
// S2 → S1
// ...
//
// once before ACO begins.
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


      const result =
        shortestPath(
          routingGraph,
          from,
          to
        );


      if (!result) {

        costMatrix[from][to] =
          Infinity;


        pathMatrix[from][to] =
          null;


        continue;

      }


      costMatrix[from][to] =
        result.cost;


      pathMatrix[from][to] =
        result;

    }

  }


  return {

    costMatrix,
    pathMatrix,

  };

}


// ============================================================
// Calculate cost of an abstract stop sequence
// ============================================================

function calculateTourCost(
  tour,
  costMatrix
) {

  let cost =
    0;


  for (
    let index = 0;
    index < tour.length - 1;
    index += 1
  ) {

    const from =
      String(
        tour[index]
      );


    const to =
      String(
        tour[index + 1]
      );


    const segmentCost =
      costMatrix
        ?.[from]
        ?.[to];


    if (
      !Number.isFinite(
        segmentCost
      )
    ) {

      return Infinity;

    }


    cost +=
      segmentCost;

  }


  return cost;

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


  const choices =
    candidates.map(
      candidate => {

        const next =
          String(
            candidate
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

            desirability:
              0,

          };

        }


        const pheromoneValue =
          pheromone
            ?.[current]
            ?.[next] ??
          1;


        const tau =
          Math.pow(
            pheromoneValue,
            alpha
          );


        const eta =
          Math.pow(
            1 / distance,
            beta
          );


        return {

          nodeId:
            next,

          desirability:
            tau * eta,

        };

      }
    );


  const total =
    choices.reduce(
      (
        sum,
        choice
      ) =>
        sum +
        choice.desirability,
      0
    );


  // ==========================================================
  // No useful preference:
  // choose randomly.
  // ==========================================================

  if (
    !Number.isFinite(
      total
    ) ||
    total <= 0
  ) {

    return String(
      candidates[
        Math.floor(
          Math.random() *
          candidates.length
        )
      ]
    );

  }


  let threshold =
    Math.random() *
    total;


  for (
    const choice
    of choices
  ) {

    threshold -=
      choice.desirability;


    if (
      threshold <= 0
    ) {

      return choice.nodeId;

    }

  }


  return choices[
    choices.length - 1
  ].nodeId;

}


// ============================================================
// Convert abstract tour into actual road-network route
//
// Example:
//
// Abstract:
//
// O → S3 → S1 → D
//
// Becomes:
//
// O → node22 → node27 → ... → S3
// S3 → node72 → ... → S1
// S1 → node91 → ... → D
//
// Returns actual road nodeIds and edgeIds.
// ============================================================

function reconstructRoadRoute(
  tour,
  pathMatrix
) {

  const nodeIds =
    [];


  const edgeIds =
    [];


  for (
    let index = 0;
    index < tour.length - 1;
    index += 1
  ) {

    const from =
      String(
        tour[index]
      );


    const to =
      String(
        tour[index + 1]
      );


    const segment =
      pathMatrix
        ?.[from]
        ?.[to];


    if (!segment) {

      return null;

    }


    // First segment includes its first node.

    if (
      nodeIds.length === 0
    ) {

      nodeIds.push(
        ...segment.nodeIds
      );

    }

    // Later segments omit duplicated boundary node.

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
// Copy pheromone matrix
//
// Necessary because pheromone values are mutated every
// iteration.
// ============================================================

function clonePheromoneMatrix(
  pheromone
) {

  const copy =
    {};


  for (
    const [
      from,
      values
    ]
    of Object.entries(
      pheromone
    )
  ) {

    copy[from] =
      {
        ...values,
      };

  }


  return copy;

}


// ============================================================
// Find best solution generated in one iteration
// ============================================================

function findBestSolution(
  solutions
) {

  if (
    !solutions ||
    solutions.length === 0
  ) {

    return null;

  }


  let best =
    solutions[0];


  for (
    let index = 1;
    index < solutions.length;
    index += 1
  ) {

    if (
      solutions[index].cost <
      best.cost
    ) {

      best =
        solutions[index];

    }

  }


  return best;

}


// ============================================================
// MAIN ACO FUNCTION
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

  // ----------------------------------------------------------
  // If true, store pheromone matrix in each animation frame.
  //
  // Useful later for a D3 pheromone graph.
  //
  // Turning it off saves memory.
  // ----------------------------------------------------------

  exportPheromone =
    true,

  // ----------------------------------------------------------
  // If true, keep all abstract ant tours for each iteration.
  //
  // Good for teaching.
  //
  // Do NOT store full road edge paths for every ant.
  // ----------------------------------------------------------

  exportAntTours =
    true,

}) {

  // ==========================================================
  // Validate graph
  // ==========================================================

  if (!routingGraph) {

    throw new Error(
      "ACO: routingGraph is required."
    );

  }


  // ==========================================================
  // Resolve origin / destination / intermediate stops
  // ==========================================================

  const suppliedStops =
    (
      stopNodeIds ??
      []
    ).map(
      String
    );


  const origin =
    String(
      originNodeId ??
      suppliedStops[0] ??
      ""
    );


  const destination =
    String(
      destinationNodeId ??
      suppliedStops[
        suppliedStops.length - 1
      ] ??
      ""
    );


  const intermediateStops =
    (
      waypointNodeIds ??
      suppliedStops.slice(
        1,
        -1
      )
    ).map(
      String
    );


  if (!origin) {

    throw new Error(
      "ACO: originNodeId is required."
    );

  }


  if (!destination) {

    throw new Error(
      "ACO: destinationNodeId is required."
    );

  }


  if (
    intermediateStops.length <
    1
  ) {

    throw new Error(
      "ACO: at least one intermediate stop is required."
    );

  }


  // ==========================================================
  // Ensure unique optimisation nodes
  // ==========================================================

  const allStops = [

    origin,

    ...intermediateStops,

    destination,

  ];


  const uniqueStops =
    new Set(
      allStops
    );


  if (
    uniqueStops.size !==
    allStops.length
  ) {

    throw new Error(
      "ACO: origin, destination, and intermediate stops must be unique nodes."
    );

  }


  // ==========================================================
  // Parameters
  // ==========================================================

  const safeIterations =
    Math.max(
      1,
      Math.floor(
        Number(
          iterations
        ) || 1
      )
    );


  const safeAntCount =
    Math.max(
      1,
      Math.floor(
        Number(
          numberOfAnts
        ) || 1
      )
    );


  const safeEvaporationRate =
    Math.min(
      0.999,
      Math.max(
        0,
        Number(
          evaporationRate
        ) || 0
      )
    );


  // ==========================================================
  // STEP 1
  //
  // Precompute shortest paths between optimisation stops.
  // ==========================================================

  const {

    costMatrix,
    pathMatrix,

  } =
    buildPairwisePaths(
      routingGraph,
      allStops
    );


  // ==========================================================
  // Verify required connectivity.
  //
  // A directed road network may make some pairs unreachable.
  // ==========================================================

  for (
    const from
    of allStops
  ) {

    for (
      const to
      of allStops
    ) {

      if (
        from === to
      ) {

        continue;

      }


      if (
        !Number.isFinite(
          costMatrix
            ?.[from]
            ?.[to]
        )
      ) {

        console.warn(
          `ACO: no directed road path from ${from} to ${to}.`
        );

      }

    }

  }


  // ==========================================================
  // STEP 2
  //
  // Initialize pheromone graph.
  // ==========================================================

  const pheromone =
    {};


  for (
    const from
    of allStops
  ) {

    pheromone[from] =
      {};


    for (
      const to
      of allStops
    ) {

      pheromone[from][to] =
        from === to
          ? 0
          : 1;

    }

  }


  // ==========================================================
  // Global optimisation state
  // ==========================================================

  let bestTour =
    null;


  let bestCost =
    Infinity;


  let initialBestCost =
    null;


  // ==========================================================
  // Animation output
  // ==========================================================

  const animationFrames =
    [];


  // ==========================================================
  // STEP 3
  //
  // Main ACO iterations
  // ==========================================================

  for (
    let iterationIndex = 0;
    iterationIndex < safeIterations;
    iterationIndex += 1
  ) {

    const antSolutions =
      [];


    // ========================================================
    // Each ant constructs one route.
    // ========================================================

    for (
      let antIndex = 0;
      antIndex < safeAntCount;
      antIndex += 1
    ) {

      const remaining =
        [
          ...intermediateStops,
        ];


      const tour =
        [
          origin,
        ];


      let current =
        origin;


      // ======================================================
      // Visit every intermediate stop exactly once.
      // ======================================================

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


        const removeIndex =
          remaining.indexOf(
            next
          );


        if (
          removeIndex >= 0
        ) {

          remaining.splice(
            removeIndex,
            1
          );

        }


        current =
          next;

      }


      // ======================================================
      // Destination always remains fixed at the end.
      // ======================================================

      tour.push(
        destination
      );


      const cost =
        calculateTourCost(
          tour,
          costMatrix
        );


      if (
        !Number.isFinite(
          cost
        )
      ) {

        continue;

      }


      const solution = {

        antIndex:
          antIndex + 1,

        tour:
          [
            ...tour,
          ],

        cost,

      };


      antSolutions.push(
        solution
      );


      // ======================================================
      // Update global best
      // ======================================================

      if (
        cost <
        bestCost
      ) {

        bestCost =
          cost;


        bestTour =
          [
            ...tour,
          ];

      }

    }


    // ========================================================
    // Best route THIS iteration
    // ========================================================

    const iterationBest =
      findBestSolution(
        antSolutions
      );

      // ========================================================
        // Select a representative ant for animation
        // ========================================================

        const representativeAnt =
        antSolutions.length > 0
            ? antSolutions[
                Math.floor(
                antSolutions.length / 2
                )
            ]
            : null;


        // ========================================================
        // Convert representative ant tour into actual road route
        // ========================================================

        const representativeAntRoadRoute =
        representativeAnt
            ? reconstructRoadRoute(
                representativeAnt.tour,
                pathMatrix
            )
            : null;
                
                
            // ========================================================
            // Initial baseline
            // ========================================================

            if (
            iterationIndex === 0 &&
            Number.isFinite(
                bestCost
            )
            ) {

            initialBestCost =
                bestCost;

            }

      // ========================================================
        // Select one representative ant for visual animation
        //
        // This deliberately shows the search process rather than
        // only the best-so-far route.
        //
        // Using the middle ant gives a more variable candidate
        // route while remaining deterministic for this iteration.
        // ========================================================
/*
        const representativeAnt =
        antSolutions.length > 0
            ? antSolutions[
                Math.floor(
                antSolutions.length / 2
                )
            ]
            : null;


        const representativeAntRoadRoute =
        representativeAnt
            ? reconstructRoadRoute(
                representativeAnt.tour,
                pathMatrix
            )
            : null;
*/

    // ========================================================
    // Establish initial baseline.
    //
    // Used to display percentage improvement.
    // ========================================================

    if (
      iterationIndex === 0 &&
      Number.isFinite(
        bestCost
      )
    ) {

      initialBestCost =
        bestCost;

    }


    // ========================================================
    // STEP 4
    //
    // Pheromone evaporation.
    // ========================================================

    for (
      const from
      of allStops
    ) {

      for (
        const to
        of allStops
      ) {

        if (
          from === to
        ) {

          continue;

        }


        pheromone[from][to] *=
          (
            1 -
            safeEvaporationRate
          );


        pheromone[from][to] =
          Math.max(
            pheromone[from][to],
            1e-12
          );

      }

    }


    // ========================================================
    // STEP 5
    //
    // Deposit pheromone from successful ants.
    // ========================================================

    for (
      const solution
      of antSolutions
    ) {

      if (
        !Number.isFinite(
          solution.cost
        ) ||
        solution.cost <= 0
      ) {

        continue;

      }


      const deposit =
        pheromoneDeposit /
        solution.cost;


      for (
        let index = 0;
        index <
          solution.tour.length - 1;
        index += 1
      ) {

        const from =
          solution.tour[index];


        const to =
          solution.tour[
            index + 1
          ];


        pheromone[from][to] +=
          deposit;

      }

    }


    // ========================================================
    // STEP 6
    //
    // Convert global best tour into actual road edges.
    //
    // This is what allows Leaflet to animate the route.
    // ========================================================

    const bestRoadRoute =
      bestTour
        ? reconstructRoadRoute(
            bestTour,
            pathMatrix
          )
        : null;


    const iterationBestRoadRoute =
      iterationBest
        ? reconstructRoadRoute(
            iterationBest.tour,
            pathMatrix
          )
        : null;


    // ========================================================
    // Improvement percentage
    // ========================================================

    let improvement =
      null;


    if (
      Number.isFinite(
        initialBestCost
      ) &&
      initialBestCost > 0 &&
      Number.isFinite(
        bestCost
      )
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


    // ========================================================
    // ANIMATION FRAME
    //
    // One snapshot = one ACO iteration.
    //
    // IMPORTANT:
    //
    // bestRouteEdgeIds are actual GeoJSON/routing edge IDs,
    // so RoutingMap can highlight them directly.
    // ========================================================

    const animationFrame = {

      // ------------------------------------------------------
      // Frame identity
      // ------------------------------------------------------

      frameIndex:
        iterationIndex,

      iteration:
        iterationIndex + 1,

      totalIterations:
        safeIterations,


      // ------------------------------------------------------
      // Global best found SO FAR
      // ------------------------------------------------------

      bestCost:
        Number.isFinite(
          bestCost
        )
          ? bestCost
          : null,

      bestTour:
        bestTour
          ? [
              ...bestTour,
            ]
          : [],

      bestRouteNodeIds:
        bestRoadRoute
          ?.nodeIds ??
        [],

      bestRouteEdgeIds:
        bestRoadRoute
          ?.edgeIds ??
        [],


      // ------------------------------------------------------
      // Best solution created THIS iteration
      // ------------------------------------------------------

      iterationBestCost:
        iterationBest
          ?.cost ??
        null,

      iterationBestTour:
        iterationBest
          ?.tour
          ? [
              ...iterationBest.tour,
            ]
          : [],

      iterationBestRouteNodeIds:
        iterationBestRoadRoute
          ?.nodeIds ??
        [],

      iterationBestRouteEdgeIds:
        iterationBestRoadRoute
          ?.edgeIds ??
        [],

        // ------------------------------------------------------
                // Representative candidate ant
                //
                // This is intended specifically for search animation.
                // ------------------------------------------------------

                candidateAntIndex:
                    representativeAnt
                    ?.antIndex ??
                    null,

                candidateCost:
                    representativeAnt
                    ?.cost ??
                    null,

                candidateTour:
                    representativeAnt
                    ?.tour
                    ? [
                        ...representativeAnt.tour,
                        ]
                    : [],

                candidateRouteNodeIds:
                    representativeAntRoadRoute
                    ?.nodeIds ??
                    [],

                candidateRouteEdgeIds:
                    representativeAntRoadRoute
                    ?.edgeIds ??
                    [],


                // ------------------------------------------------------
                // Current improvement
                // ------------------------------------------------------

                improvement,


      // ------------------------------------------------------
      // Current improvement
      // ------------------------------------------------------

      improvement,


      // ------------------------------------------------------
      // Number of valid ants
      // ------------------------------------------------------

      antCount:
        antSolutions.length,


      // ------------------------------------------------------
      // Optional lightweight ant output.
      //
      // Only stop order and cost.
      //
      // We intentionally DO NOT save all road edges for every
      // ant because that would become very large.
      // ------------------------------------------------------

      antTours:
        exportAntTours
          ? antSolutions.map(
              solution => ({

                antIndex:
                  solution.antIndex,

                cost:
                  solution.cost,

                tour:
                  [
                    ...solution.tour,
                  ],

              })
            )
          : [],


      // ------------------------------------------------------
      // Pheromone matrix
      //
      // Useful for future D3 linked visualization.
      // ------------------------------------------------------

      pheromone:
        exportPheromone
          ? clonePheromoneMatrix(
              pheromone
            )
          : null,

    };


    animationFrames.push(
      animationFrame
    );


    // ========================================================
    // Occasionally yield to browser.
    //
    // This does NOT control playback speed.
    //
    // Playback happens later in React.
    // ========================================================

    if (
      iterationIndex % 20 === 0
    ) {

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            0
          )
      );

    }

  }


  // ==========================================================
  // Validate final result
  // ==========================================================

  if (
    !bestTour ||
    !Number.isFinite(
      bestCost
    )
  ) {

    throw new Error(
      "ACO could not find a valid route. Check whether the generated stops are connected in the directed road network."
    );

  }


  // ==========================================================
  // Reconstruct final road route
  // ==========================================================

  const finalRoadRoute =
    reconstructRoadRoute(
      bestTour,
      pathMatrix
    );


  if (!finalRoadRoute) {

    throw new Error(
      "ACO found an abstract tour but could not reconstruct the road-network route."
    );

  }


  // ==========================================================
  // Final improvement
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
  // FINAL OUTPUT
  // ==========================================================

  return {

    algorithm:
      "aco",


    // --------------------------------------------------------
    // Final best abstract optimisation tour
    // --------------------------------------------------------

    bestTour,

    tourNodeIds:
      bestTour,


    // --------------------------------------------------------
    // Final actual road-network route
    // --------------------------------------------------------

    nodeIds:
      finalRoadRoute.nodeIds,

    edgeIds:
      finalRoadRoute.edgeIds,


    // --------------------------------------------------------
    // Metrics
    // --------------------------------------------------------

    bestCost,

    cost:
      bestCost,

    initialBestCost,

    improvement,

    iterationsCompleted:
      safeIterations,

    numberOfAnts:
      safeAntCount,


    // --------------------------------------------------------
    // COMPLETE ITERATION ANIMATION
    // --------------------------------------------------------

    animationFrames,


    // Keep history alias if existing UI expects it.

    history:
      animationFrames,


    // --------------------------------------------------------
    // Useful if you later want to display the abstract
    // stop-to-stop network.
    // --------------------------------------------------------

    costMatrix,

    pathMatrix,


    // --------------------------------------------------------
    // Algorithm parameters
    // --------------------------------------------------------

    parameters: {

      alpha,

      beta,

      evaporationRate:
        safeEvaporationRate,

      pheromoneDeposit,

      numberOfAnts:
        safeAntCount,

      iterations:
        safeIterations,

    },

  };

}


export default antColonyOptimization;