// ============================================================
// Simulated Annealing
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
// Simulated Annealing operates on the ABSTRACT optimisation
// graph:
//
// Origin + Intermediate Stops + Destination
//
// Travel cost between optimisation stops is obtained from
// the REAL road network using Dijkstra shortest paths.
//
// OUTPUT FORMAT is intentionally compatible with the ACO
// implementation so the same React / Leaflet animation system
// can be reused.
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
// Normalize routing edge
//
// Keep this consistent with antColonyOptimization.js.
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
// This mirrors the flexible structure used by the ACO file.
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


  // ----------------------------------------------------------
  // Format 3:
  // routingGraph.nodes[nodeId].neighbors
  // ----------------------------------------------------------

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


  // ----------------------------------------------------------
  // Format 4:
  // routingGraph.edges
  // ----------------------------------------------------------

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
        normalized.from !== id
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
// Minimum binary heap
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


      const edgeWeight =
        safeNumber(
          edge.weight,
          Infinity
        );


      if (
        !Number.isFinite(
          edgeWeight
        )
      ) {

        continue;

      }


      const candidateDistance =
        currentDistance +
        edgeWeight;


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
// Build pairwise road-network paths
//
// Only executed once before SA begins.
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

      }

      else {

        costMatrix[from][to] =
          result.cost;


        pathMatrix[from][to] =
          result;

      }

    }

  }


  return {

    costMatrix,
    pathMatrix,

  };

}


// ============================================================
// Calculate complete tour cost
// ============================================================

function calculateTourCost(
  tour,
  costMatrix
) {

  let total =
    0;


  for (
    let index = 0;
    index <
      tour.length - 1;
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
// Reconstruct complete road-network route
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
    index <
      tour.length - 1;
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
// Shuffle an array
//
// Used to create initial solution.
// ============================================================

function shuffleArray(
  array
) {

  const result =
    [
      ...array,
    ];


  for (
    let index =
      result.length - 1;

    index > 0;

    index -= 1
  ) {

    const randomIndex =
      Math.floor(
        Math.random() *
        (
          index + 1
        )
      );


    [
      result[index],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[index],
    ];

  }


  return result;

}


// ============================================================
// Generate neighbouring solution
//
// Origin and Destination are NOT changed.
//
// Only intermediate stops are modified.
//
// Randomly choose between:
//
// 1. Swap
// 2. Reverse segment
// ============================================================

function generateNeighbour(
  tour
) {

  if (
    tour.length <= 3
  ) {

    return [
      ...tour,
    ];

  }


  const neighbour =
    [
      ...tour,
    ];


  // ----------------------------------------------------------
  // Valid intermediate indices:
  //
  // 1 ... tour.length - 2
  // ----------------------------------------------------------

  const firstIntermediateIndex =
    1;


  const lastIntermediateIndex =
    tour.length - 2;


  const range =
    lastIntermediateIndex -
    firstIntermediateIndex +
    1;


  let indexA =
    firstIntermediateIndex +
    Math.floor(
      Math.random() *
      range
    );


  let indexB =
    firstIntermediateIndex +
    Math.floor(
      Math.random() *
      range
    );


  // ----------------------------------------------------------
  // Ensure different indices
  // ----------------------------------------------------------

  if (
    range > 1
  ) {

    while (
      indexB === indexA
    ) {

      indexB =
        firstIntermediateIndex +
        Math.floor(
          Math.random() *
          range
        );

    }

  }


  if (
    indexA > indexB
  ) {

    [
      indexA,
      indexB,
    ] = [
      indexB,
      indexA,
    ];

  }


  const mutationType =
    Math.random() <
    0.5
      ? "swap"
      : "reverse";


  // ==========================================================
  // Swap mutation
  // ==========================================================

  if (
    mutationType ===
    "swap"
  ) {

    [
      neighbour[indexA],
      neighbour[indexB],
    ] = [
      neighbour[indexB],
      neighbour[indexA],
    ];

  }


  // ==========================================================
  // Reverse segment mutation
  // ==========================================================

  else {

    const reversedSegment =
      neighbour
        .slice(
          indexA,
          indexB + 1
        )
        .reverse();


    neighbour.splice(
      indexA,
      reversedSegment.length,
      ...reversedSegment
    );

  }


  return neighbour;

}


// ============================================================
// Find a valid initial tour for a directed road network
//
// Uses depth-first backtracking.
//
// Origin and destination remain fixed.
// Only intermediate stops are reordered.
//
// This is much more reliable than repeatedly shuffling stops.
// ============================================================

function findFeasibleInitialTour({

  origin,

  destination,

  intermediateStops,

  costMatrix,

}) {

  // ----------------------------------------------------------
  // Recursive search
  // ----------------------------------------------------------

  function search(
    currentNode,
    remainingStops,
    currentTour
  ) {

    // ========================================================
    // All intermediate stops have been visited.
    //
    // Check whether we can reach the fixed destination.
    // ========================================================

    if (
      remainingStops.length === 0
    ) {

      const finalCost =
        costMatrix
          ?.[currentNode]
          ?.[destination];


      if (
        Number.isFinite(
          finalCost
        )
      ) {

        return [

          ...currentTour,

          destination,

        ];

      }


      return null;

    }


    // ========================================================
    // Prefer lower-cost feasible next stops.
    //
    // This gives SA a reasonably good initial solution while
    // still allowing SA to explore alternatives afterward.
    // ========================================================

    const candidates =
      remainingStops
        .filter(
          stop => {

            const cost =
              costMatrix
                ?.[currentNode]
                ?.[stop];


            return Number.isFinite(
              cost
            );

          }
        )
        .sort(
          (
            stopA,
            stopB
          ) => {

            const costA =
              costMatrix
                ?.[currentNode]
                ?.[stopA] ??
              Infinity;


            const costB =
              costMatrix
                ?.[currentNode]
                ?.[stopB] ??
              Infinity;


            return (
              costA -
              costB
            );

          }
        );


    // ========================================================
    // Backtracking
    // ========================================================

    for (
      const nextStop
      of candidates
    ) {

      const nextRemainingStops =
        remainingStops.filter(
          stop =>
            stop !==
            nextStop
        );


      const result =
        search(

          nextStop,

          nextRemainingStops,

          [
            ...currentTour,
            nextStop,
          ]

        );


      if (
        result
      ) {

        return result;

      }

    }


    return null;

  }


  // ----------------------------------------------------------
  // Begin at fixed origin
  // ----------------------------------------------------------

  return search(

    origin,

    [
      ...intermediateStops,
    ],

    [
      origin,
    ]

  );

}

// ============================================================
// Main Simulated Annealing
// ============================================================

export async function simulatedAnnealing({

  // ==========================================================
  // SAME COMMON INPUTS AS ACO
  // ==========================================================

  routingGraph,

  stopNodeIds,

  originNodeId,

  destinationNodeId,

  waypointNodeIds,

  iterations = 100,


  // ==========================================================
  // ACO arguments can still be passed by your common handler.
  //
  // SA does not use these, but accepting them means you can
  // call both algorithms with a nearly identical argument
  // object without errors.
  // ==========================================================

  numberOfAnts = 30,

  alpha = 1,

  beta = 2,

  evaporationRate = 0.5,

  pheromoneDeposit = 1,

  exportPheromone = true,

  exportAntTours = true,


  // ==========================================================
  // SA-specific parameters
  // ==========================================================

  initialTemperature = 100,

  coolingRate = 0.95,

  minimumTemperature = 0.0001,

}) {

  // Silence optional ACO-specific arguments.
  // They are intentionally accepted for API compatibility.

  void numberOfAnts;
  void alpha;
  void beta;
  void evaporationRate;
  void pheromoneDeposit;
  void exportPheromone;
  void exportAntTours;


  // ==========================================================
  // Validate routing graph
  // ==========================================================

  if (!routingGraph) {

    throw new Error(
      "SA: routingGraph is required."
    );

  }


  // ==========================================================
  // Resolve optimisation nodes
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
      "SA: originNodeId is required."
    );

  }


  if (!destination) {

    throw new Error(
      "SA: destinationNodeId is required."
    );

  }


  if (
    intermediateStops.length <
    1
  ) {

    throw new Error(
      "SA: at least one intermediate stop is required."
    );

  }


  // ==========================================================
  // Ensure all optimisation nodes are unique
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
      "SA: origin, destination, and intermediate stops must be unique."
    );

  }


  // ==========================================================
  // Safe parameters
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


  const safeInitialTemperature =
    Math.max(
      0.0001,
      Number(
        initialTemperature
      ) || 100
    );


  const safeCoolingRate =
    Math.min(
      0.999999,
      Math.max(
        0.000001,
        Number(
          coolingRate
        ) || 0.95
      )
    );


  const safeMinimumTemperature =
    Math.max(
      0,
      Number(
        minimumTemperature
      ) || 0
    );


  // ==========================================================
  // STEP 1
  //
  // Build road-network cost/path matrix.
  //
  // Same concept as ACO.
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
  // STEP 2
  //
  // Generate initial solution.
  //
  // Origin and Destination stay fixed.
  // ==========================================================

  // ============================================================
  // STEP 2
  //
  // Find a guaranteed feasible initial tour.
  //
  // This is important for a directed road network because a
  // random permutation may contain unreachable transitions.
  // ============================================================

  const feasibleInitialTour =
    findFeasibleInitialTour({

      origin,

      destination,

      intermediateStops,

      costMatrix,

    });


  if (
    !feasibleInitialTour
  ) {

    throw new Error(
      "SA: no feasible ordering exists between the selected origin, intermediate stops, and destination."
    );

  }


  // ============================================================
  // Initialise SA state
  // ============================================================

  let currentTour =
    [
      ...feasibleInitialTour,
    ];


  let currentCost =
    calculateTourCost(
      currentTour,
      costMatrix
    );


  if (
    !Number.isFinite(
      currentCost
    )
  ) {

    throw new Error(
      "SA: feasible initial tour was found but its cost is invalid."
    );

  }


  // ==========================================================
  // Global best
  // ==========================================================

  let bestTour =
    [
      ...currentTour,
    ];


  let bestCost =
    currentCost;


  const initialBestCost =
    currentCost;


  // ==========================================================
  // Temperature
  // ==========================================================

  let temperature =
    safeInitialTemperature;


  // ==========================================================
  // Animation output
  // ==========================================================

  const animationFrames =
    [];



  // ==========================================================
  // Runtime measurement
  //
  // Cumulative runtime of the iterative SA search.
  // ==========================================================

  const optimisationStartTime =
    performance.now();  

  // ==========================================================
  // MAIN SA LOOP
  // ==========================================================

  for (
    let iterationIndex = 0;
    iterationIndex < safeIterations;
    iterationIndex += 1
  ) {

    // ========================================================
    // Remember solution entering this iteration
    // ========================================================

    const previousTour =
      [
        ...currentTour,
      ];


    const previousCost =
      currentCost;


    // ========================================================
    // STEP 3
    //
    // Generate neighbouring candidate.
    // ========================================================

    const candidateTour =
      generateNeighbour(
        currentTour
      );


    const candidateCost =
      calculateTourCost(
        candidateTour,
        costMatrix
      );


    // ========================================================
    // STEP 4
    //
    // Determine acceptance.
    // ========================================================

    let accepted =
      false;


    let acceptanceProbability =
      0;


    let randomValue =
      null;


    let deltaCost =
      Infinity;


    if (
      Number.isFinite(
        candidateCost
      )
    ) {

      deltaCost =
        candidateCost -
        currentCost;


      // ------------------------------------------------------
      // Better or equal solution:
      // always accept.
      // ------------------------------------------------------

      if (
        deltaCost <= 0
      ) {

        accepted =
          true;


        acceptanceProbability =
          1;

      }


      // ------------------------------------------------------
      // Worse solution:
      // maybe accept according to temperature.
      // ------------------------------------------------------

      else {

        acceptanceProbability =
          Math.exp(
            -deltaCost /
            Math.max(
              temperature,
              1e-12
            )
          );


        randomValue =
          Math.random();


        accepted =
          randomValue <
          acceptanceProbability;

      }

    }


    // ========================================================
    // STEP 5
    //
    // Accept candidate if permitted.
    // ========================================================

    if (
      accepted
    ) {

      currentTour =
        [
          ...candidateTour,
        ];


      currentCost =
        candidateCost;

    }


    // ========================================================
    // STEP 6
    //
    // Update global best.
    // ========================================================

    let improvedGlobalBest =
      false;


    if (
      currentCost <
      bestCost
    ) {

      bestCost =
        currentCost;


      bestTour =
        [
          ...currentTour,
        ];


      improvedGlobalBest =
        true;

    }


    // ========================================================
    // Reconstruct road-network routes for animation.
    // ========================================================

    const candidateRoadRoute =
      Number.isFinite(
        candidateCost
      )
        ? reconstructRoadRoute(
            candidateTour,
            pathMatrix
          )
        : null;


    const currentRoadRoute =
      reconstructRoadRoute(
        currentTour,
        pathMatrix
      );


    const bestRoadRoute =
      reconstructRoadRoute(
        bestTour,
        pathMatrix
      );


    const previousRoadRoute =
      reconstructRoadRoute(
        previousTour,
        pathMatrix
      );


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
    // Generic fields intentionally match ACO where possible.
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
      // Cumulative runtime up to THIS iteration
      // ------------------------------------------------------

      runtimeMs:
        performance.now() -
        optimisationStartTime,


      // ======================================================
      // GENERIC CANDIDATE FIELDS
      //
      // Same names as ACO candidate animation.
      //
      // Your existing Leaflet animation can use these directly.
      // ======================================================

      candidateCost:
        Number.isFinite(
          candidateCost
        )
          ? candidateCost
          : null,

      candidateTour:
        [
          ...candidateTour,
        ],

      candidateRouteNodeIds:
        candidateRoadRoute
          ?.nodeIds ??
        [],

      candidateRouteEdgeIds:
        candidateRoadRoute
          ?.edgeIds ??
        [],


      // ======================================================
      // GLOBAL BEST
      //
      // Same important fields as ACO.
      // ======================================================

      bestCost:
        Number.isFinite(
          bestCost
        )
          ? bestCost
          : null,

      bestTour:
        [
          ...bestTour,
        ],

      bestRouteNodeIds:
        bestRoadRoute
          ?.nodeIds ??
        [],

      bestRouteEdgeIds:
        bestRoadRoute
          ?.edgeIds ??
        [],


      // ======================================================
      // ITERATION BEST COMPATIBILITY
      //
      // ACO has iterationBest.
      //
      // For SA there is only one generated candidate per
      // iteration, so candidate = iteration candidate.
      // ======================================================

      iterationBestCost:
        Number.isFinite(
          candidateCost
        )
          ? candidateCost
          : null,

      iterationBestTour:
        [
          ...candidateTour,
        ],

      iterationBestRouteNodeIds:
        candidateRoadRoute
          ?.nodeIds ??
        [],

      iterationBestRouteEdgeIds:
        candidateRoadRoute
          ?.edgeIds ??
        [],


      // ======================================================
      // ACO compatibility fields
      //
      // SA has no ants.
      // ======================================================

      candidateAntIndex:
        null,

      antCount:
        0,

      antTours:
        [],

      pheromone:
        null,


      // ======================================================
      // SA-SPECIFIC CURRENT STATE
      // ======================================================

      previousCost,

      previousTour,

      previousRouteNodeIds:
        previousRoadRoute
          ?.nodeIds ??
        [],

      previousRouteEdgeIds:
        previousRoadRoute
          ?.edgeIds ??
        [],


      currentCost,

      currentTour:
        [
          ...currentTour,
        ],

      currentRouteNodeIds:
        currentRoadRoute
          ?.nodeIds ??
        [],

      currentRouteEdgeIds:
        currentRoadRoute
          ?.edgeIds ??
        [],


      // ======================================================
      // SA acceptance logic
      // ======================================================

      temperature,

      deltaCost:
        Number.isFinite(
          deltaCost
        )
          ? deltaCost
          : null,

      acceptanceProbability,

      randomValue,

      accepted,

      improvedGlobalBest,


      // ======================================================
      // Generic improvement
      // ======================================================

      improvement,

    };


    animationFrames.push(
      animationFrame
    );


    // ========================================================
    // STEP 7
    //
    // Cool temperature AFTER recording this iteration.
    // ========================================================

    temperature =
      Math.max(
        safeMinimumTemperature,
        temperature *
        safeCoolingRate
      );


    // ========================================================
    // Allow browser to process React/UI work occasionally.
    //
    // This does not control playback animation speed.
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
  // Reconstruct final global-best road route
  // ==========================================================

  const finalRoadRoute =
    reconstructRoadRoute(
      bestTour,
      pathMatrix
    );


  if (!finalRoadRoute) {

    throw new Error(
      "SA: best tour was found but its road-network route could not be reconstructed."
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
  //
  // Intentionally matches ACO interface.
  // ==========================================================

  return {

    algorithm:
      "sa",


    // --------------------------------------------------------
    // Final abstract tour
    // --------------------------------------------------------

    bestTour,

    tourNodeIds:
      bestTour,


    // --------------------------------------------------------
    // Final real road-network route
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


    // --------------------------------------------------------
    // ACO-compatible field
    //
    // SA doesn't use ants.
    // --------------------------------------------------------

    numberOfAnts:
      null,


    // --------------------------------------------------------
    // COMPLETE ANIMATION
    // --------------------------------------------------------

    animationFrames,

    history:
      animationFrames,


    // --------------------------------------------------------
    // Same matrices as ACO
    // --------------------------------------------------------

    costMatrix,

    pathMatrix,


    // --------------------------------------------------------
    // Parameters
    // --------------------------------------------------------

    parameters: {

      initialTemperature:
        safeInitialTemperature,

      coolingRate:
        safeCoolingRate,

      minimumTemperature:
        safeMinimumTemperature,

      iterations:
        safeIterations,

    },

  };

}


// ============================================================
// Default export
// ============================================================

export default simulatedAnnealing;