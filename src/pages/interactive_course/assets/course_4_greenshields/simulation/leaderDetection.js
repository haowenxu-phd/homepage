// =========================================================
// leaderDetection.js
// =========================================================

export function findLeaderOnCurrentLane(
  vehicle,
  laneIndex
) {

  const laneVehicles =
    laneIndex.get(
      vehicle.currentLaneId
    );


  if (
    !laneVehicles
  ) {
    return null;
  }


  let nearestLeader =
    null;

  let smallestGap =
    Infinity;


  for (
    const candidate
    of laneVehicles
  ) {

    if (
      candidate.id ===
      vehicle.id
    ) {
      continue;
    }


    const gap =
      candidate.distanceAlongLaneM
      -
      vehicle.distanceAlongLaneM
      -
      candidate.lengthM;


    if (
      gap >= 0 &&
      gap < smallestGap
    ) {

      smallestGap =
        gap;

      nearestLeader =
        candidate;

    }

  }


  if (
    !nearestLeader
  ) {
    return null;
  }


  return {

    vehicle:
      nearestLeader,

    gapM:
      smallestGap

  };

}