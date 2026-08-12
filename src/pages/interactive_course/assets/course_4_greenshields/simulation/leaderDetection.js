// =========================================================
// leaderDetection.js
// =========================================================

export function findLeader(
  vehicle,
  laneIndex
) {

  const laneVehicles =
    laneIndex.get(
      vehicle.currentLaneId
    );


  if (
    !laneVehicles ||
    laneVehicles.length <= 1
  ) {

    return null;
  }


  let leader =
    null;

  let smallestGapM =
    Infinity;


  for (
    const candidate
    of laneVehicles
  ) {

    // Ignore self
    if (
      candidate.id ===
      vehicle.id
    ) {
      continue;
    }


    // Candidate must be ahead
    if (
      candidate.distanceAlongLaneM <=
      vehicle.distanceAlongLaneM
    ) {
      continue;
    }


    const gapM =
      candidate.distanceAlongLaneM
      -
      vehicle.distanceAlongLaneM
      -
      candidate.lengthM;


    if (
      gapM <
      smallestGapM
    ) {

      smallestGapM =
        gapM;

      leader =
        candidate;

    }

  }


  if (!leader) {
    return null;
  }


  return {

    vehicle:
      leader,

    gapM:
      smallestGapM,

  };

}