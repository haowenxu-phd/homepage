// =========================================================
// laneIndex.js
// =========================================================

export function buildLaneIndex(
  vehicles
) {

  const laneIndex =
    new Map();


  for (
    const vehicle
    of vehicles
  ) {

    if (
      vehicle.finished
    ) {
      continue;
    }


    const laneId =
      vehicle.currentLaneId;


    if (
      !laneIndex.has(
        laneId
      )
    ) {

      laneIndex.set(
        laneId,
        []
      );

    }


    laneIndex
      .get(laneId)
      .push(vehicle);

  }


  // Sort vehicles from beginning of lane
  // toward end of lane

  for (
    const laneVehicles
    of laneIndex.values()
  ) {

    laneVehicles.sort(
      (a, b) =>
        a.distanceAlongLaneM -
        b.distanceAlongLaneM
    );

  }


  return laneIndex;

}