// =========================================================
// carFollowing.js
// Optimal Velocity Model (OVM)
// =========================================================

export function updateVehicleSpeed(
  vehicle,
  leaderInfo,
  dt
) {

  // =======================================================
  // OVM parameters
  // =======================================================

  // Driver sensitivity / reaction strength
  // Larger alpha = faster response
  const alpha =
    0.7;


  // Minimum effective gap
  const minimumGapM =
    3.0;


  // Characteristic transition gap
  // Around this gap, desired speed changes rapidly
  const transitionGapM =
    12.0;


  // Maximum comfortable acceleration
  const maxAccelerationMps2 =
    1.5;


  // Maximum comfortable deceleration
  const maxDecelerationMps2 =
    4.0;


  // =======================================================
  // No leader
  //
  // Accelerate toward desired free-flow speed
  // =======================================================

  if (!leaderInfo) {

    vehicle.speedMps =
      Math.min(
        vehicle.desiredSpeedMps,

        vehicle.speedMps +
          maxAccelerationMps2 *
          dt
      );


    vehicle.speedMps =
      Math.max(
        0,
        vehicle.speedMps
      );


    return;
  }


  // =======================================================
  // Leader information
  // =======================================================

  const gapM =
    Math.max(
      0,
      leaderInfo.gapM
    );


  const leader =
    leaderInfo.vehicle;


  // =======================================================
  // Optimal Velocity Function
  //
  // V(s) =
  // vmax *
  // [
  //   tanh((s - s0) / L)
  //   +
  //   tanh(s0 / L)
  // ]
  // /
  // [
  //   1 +
  //   tanh(s0 / L)
  // ]
  //
  // This gives:
  //
  // small gap  -> low target speed
  // large gap  -> desired free-flow speed
  // =======================================================

  const normalizedOptimalSpeed =
    (
      Math.tanh(
        (
          gapM -
          minimumGapM
        ) /
        transitionGapM
      )
      +
      Math.tanh(
        minimumGapM /
        transitionGapM
      )
    )
    /
    (
      1 +
      Math.tanh(
        minimumGapM /
        transitionGapM
      )
    );


  const optimalSpeedMps =
    Math.max(
      0,

      Math.min(
        vehicle.desiredSpeedMps,

        vehicle.desiredSpeedMps *
          normalizedOptimalSpeed
      )
    );


  // =======================================================
  // OVM acceleration
  //
  // dv/dt = alpha [ V(s) - v ]
  // =======================================================

  let acceleration =
    alpha *
    (
      optimalSpeedMps -
      vehicle.speedMps
    );


  // =======================================================
  // Clamp acceleration
  // =======================================================

  acceleration =
    Math.max(
      -maxDecelerationMps2,

      Math.min(
        maxAccelerationMps2,
        acceleration
      )
    );


  // =======================================================
  // Integrate speed
  // =======================================================

  vehicle.speedMps +=
    acceleration *
    dt;


  // =======================================================
  // Emergency safety constraint
  //
  // OVM itself is not collision-safe.
  // Keep a small protection layer for the teaching demo.
  // =======================================================

  if (
    gapM <
    minimumGapM
  ) {

    vehicle.speedMps =
      Math.min(
        vehicle.speedMps,
        leader.speedMps
      );

  }


  // =======================================================
  // Prevent invalid speed
  // =======================================================

  vehicle.speedMps =
    Math.max(
      0,

      Math.min(
        vehicle.speedMps,
        vehicle.desiredSpeedMps
      )
    );

}