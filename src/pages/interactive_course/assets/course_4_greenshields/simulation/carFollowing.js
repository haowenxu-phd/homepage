// =========================================================
// carFollowing.js
// =========================================================

export function updateVehicleSpeed(
  vehicle,
  leaderInfo,
  dt
) {

  // -------------------------------------------------------
  // Parameters
  // -------------------------------------------------------

  const minimumGapM =
    3.0;

  const followingGapM =
    15.0;

  const accelerationMps2 =
    2.0;

  const decelerationMps2 =
    4.0;


  // =======================================================
  // No leader
  //
  // Accelerate toward desired speed
  // =======================================================

  if (!leaderInfo) {

    vehicle.speedMps =
      Math.min(

        vehicle.desiredSpeedMps,

        vehicle.speedMps +
          accelerationMps2 * dt

      );


    return;
  }


  const leader =
    leaderInfo.vehicle;

  const gapM =
    leaderInfo.gapM;


  // =======================================================
  // Very close
  //
  // Match leader speed immediately.
  // =======================================================

  if (
    gapM <= minimumGapM
  ) {

    vehicle.speedMps =
      Math.min(
        vehicle.speedMps,
        leader.speedMps
      );


    return;
  }


  // =======================================================
  // Following zone
  //
  // Gradually reduce speed toward leader speed
  // =======================================================

  if (
    gapM < followingGapM &&
    vehicle.speedMps >
      leader.speedMps
  ) {

    vehicle.speedMps =
      Math.max(

        leader.speedMps,

        vehicle.speedMps -
          decelerationMps2 * dt

      );


    return;
  }


  // =======================================================
  // Enough space
  //
  // Accelerate toward desired speed.
  // =======================================================

  vehicle.speedMps =
    Math.min(

      vehicle.desiredSpeedMps,

      vehicle.speedMps +
        accelerationMps2 * dt

    );

}