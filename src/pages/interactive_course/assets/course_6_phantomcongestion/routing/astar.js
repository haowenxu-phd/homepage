// =========================================================
// A* Lane-based Routing
// =========================================================

function euclideanDistance(
  pointA,
  pointB
) {

  if (
    !pointA ||
    !pointB
  ) {
    return 0;
  }

  const dx =
    pointA[0] - pointB[0];

  const dy =
    pointA[1] - pointB[1];

  return Math.sqrt(
    dx * dx +
    dy * dy
  );

}


// =========================================================
// Heuristic
// =========================================================

function heuristic(
  graph,
  currentLaneId,
  destinationLaneId
) {

  const currentLane =
    graph.lanes[
      currentLaneId
    ];

  const destinationLane =
    graph.lanes[
      destinationLaneId
    ];

  if (
    !currentLane ||
    !destinationLane
  ) {
    return 0;
  }

  return euclideanDistance(
    currentLane.end_xy,
    destinationLane.end_xy
  );

}


// =========================================================
// Reconstruct route
// =========================================================

function reconstructPath(
  cameFrom,
  currentLaneId
) {

  const route = [
    currentLaneId
  ];

  let current =
    currentLaneId;

  while (
    cameFrom.has(current)
  ) {

    current =
      cameFrom.get(current);

    route.unshift(
      current
    );
  }

  return route;

}


// =========================================================
// A*
// =========================================================

export function astar(
  graph,
  originLaneId,
  destinationLaneId
) {

  if (
    !graph?.lanes ||
    !graph?.adjacency
  ) {

    console.error(
      "Invalid routing graph."
    );

    return [];
  }


  if (
    !graph.lanes[
      originLaneId
    ]
  ) {

    console.error(
      "Origin lane not found:",
      originLaneId
    );

    return [];
  }


  if (
    !graph.lanes[
      destinationLaneId
    ]
  ) {

    console.error(
      "Destination lane not found:",
      destinationLaneId
    );

    return [];
  }


  if (
    originLaneId ===
    destinationLaneId
  ) {

    return [
      originLaneId
    ];
  }


  const openSet =
    new Set([
      originLaneId
    ]);

  const cameFrom =
    new Map();

  const gScore =
    new Map();

  const fScore =
    new Map();


  for (
    const laneId
    of Object.keys(
      graph.lanes
    )
  ) {

    gScore.set(
      laneId,
      Infinity
    );

    fScore.set(
      laneId,
      Infinity
    );
  }


  gScore.set(
    originLaneId,
    0
  );


  fScore.set(
    originLaneId,
    heuristic(
      graph,
      originLaneId,
      destinationLaneId
    )
  );


  while (
    openSet.size > 0
  ) {

    let currentLaneId =
      null;

    let lowestF =
      Infinity;


    for (
      const laneId
      of openSet
    ) {

      const score =
        fScore.get(
          laneId
        );

      if (
        score < lowestF
      ) {

        lowestF =
          score;

        currentLaneId =
          laneId;
      }
    }


    if (
      currentLaneId ===
      destinationLaneId
    ) {

      return reconstructPath(
        cameFrom,
        currentLaneId
      );
    }


    openSet.delete(
      currentLaneId
    );


    const neighbors =
      graph.adjacency[
        currentLaneId
      ] ?? [];


    for (
      const edge
      of neighbors
    ) {

      const nextLaneId =
        edge.to;

      const edgeCost =
        Number(
          edge.length_m
        ) || 0;


      const tentativeG =
        gScore.get(
          currentLaneId
        ) +
        edgeCost;


      if (
        tentativeG
        <
        (
          gScore.get(
            nextLaneId
          ) ?? Infinity
        )
      ) {

        cameFrom.set(
          nextLaneId,
          currentLaneId
        );

        gScore.set(
          nextLaneId,
          tentativeG
        );


        const h =
          heuristic(
            graph,
            nextLaneId,
            destinationLaneId
          );


        fScore.set(
          nextLaneId,
          tentativeG + h
        );


        openSet.add(
          nextLaneId
        );
      }
    }
  }


  console.warn(
    "No route found:",
    originLaneId,
    "->",
    destinationLaneId
  );

  return [];
}