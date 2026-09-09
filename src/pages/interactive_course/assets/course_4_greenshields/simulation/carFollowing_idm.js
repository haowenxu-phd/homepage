// =========================================================
// carFollowing.js
// Intelligent Driver Model (IDM)
// =========================================================

export function updateVehicleSpeed(
  vehicle,
  leaderInfo,
  dt
) {

  // =======================================================
  // IDM parameters
  // =======================================================

  // Minimum bumper-to-bumper gap
  // m
  const minimumGapM =
    3.0;


  // Desired time headway
  // s
  const timeHeadwayS =
    1.8;


  // Maximum acceleration
  // m/s^2
  const maxAccelerationMps2 =
    1.2;


  // Comfortable deceleration
  // m/s^2
  const comfortableDecelerationMps2 =
    2.0;


  // Emergency deceleration clamp
  // m/s^2
  const maxDecelerationMps2 =
    5.0;


  // Acceleration exponent
  const delta =
    4;


  // =======================================================
  // Vehicle states
  // =======================================================

  const speedMps =
    Math.max(
      0,
      Number(
        vehicle.speedMps
      ) || 0
    );


  const desiredSpeedMps =
    Math.max(
      0.1,
      Number(
        vehicle.desiredSpeedMps
      ) || 0.1
    );


  // =======================================================
  // No leader
  //
  // Free-road IDM term:
  //
  // a = a_max * [1 - (v / v0)^delta]
  // =======================================================

  if (!leaderInfo) {

    let accelerationMps2 =
      maxAccelerationMps2 *
      (
        1 -
        Math.pow(
          speedMps /
          desiredSpeedMps,
          delta
        )
      );


    accelerationMps2 =
      Math.max(
        -maxDecelerationMps2,
        Math.min(
          maxAccelerationMps2,
          accelerationMps2
        )
      );


    vehicle.speedMps =
      Math.max(
        0,
        Math.min(
          desiredSpeedMps,
          speedMps +
          accelerationMps2 *
          dt
        )
      );


    return;
  }


  // =======================================================
  // Leader information
  // =======================================================

  const leader =
    leaderInfo.vehicle;


  const gapM =
    Math.max(
      0.1,
      Number(
        leaderInfo.gapM
      ) || 0.1
    );


  const leaderSpeedMps =
    Math.max(
      0,
      Number(
        leader?.speedMps
      ) || 0
    );


  // =======================================================
  // Relative speed
  //
  // deltaV = follower speed - leader speed
  //
  // deltaV > 0:
  // follower is approaching leader
  // =======================================================

  const relativeSpeedMps =
    speedMps -
    leaderSpeedMps;


  // =======================================================
  // Desired dynamic gap
  //
  // s* =
  // s0
  // +
  // max(
  //   0,
  //   vT +
  //   v * deltaV /
  //   (2 * sqrt(a*b))
  // )
  // =======================================================

  const dynamicTerm =
    speedMps *
    timeHeadwayS
    +
    (
      speedMps *
      relativeSpeedMps
    )
    /
    (
      2 *
      Math.sqrt(
        maxAccelerationMps2 *
        comfortableDecelerationMps2
      )
    );


  const desiredGapM =
    minimumGapM +
    Math.max(
      0,
      dynamicTerm
    );


  // =======================================================
  // IDM acceleration
  //
  // a_IDM =
  //
  // a_max *
  // [
  //   1
  //   - (v / v0)^delta
  //   - (s* / s)^2
  // ]
  // =======================================================

  const freeRoadTerm =
    Math.pow(
      speedMps /
      desiredSpeedMps,
      delta
    );


  const interactionTerm =
    Math.pow(
      desiredGapM /
      gapM,
      2
    );


  let accelerationMps2 =
    maxAccelerationMps2 *
    (
      1 -
      freeRoadTerm -
      interactionTerm
    );


  // =======================================================
  // Clamp acceleration
  //
  // Prevent numerical instability / unrealistic braking
  // =======================================================

  accelerationMps2 =
    Math.max(
      -maxDecelerationMps2,
      Math.min(
        maxAccelerationMps2,
        accelerationMps2
      )
    );


  // =======================================================
  // Integrate speed
  // =======================================================

  let newSpeedMps =
    speedMps +
    accelerationMps2 *
    dt;


  // =======================================================
  // Emergency collision protection
  //
  // IDM normally handles this itself, but this extra
  // protection is useful for a classroom simulator.
  // =======================================================

  if (
    gapM <
    minimumGapM
  ) {

    newSpeedMps =
      Math.min(
        newSpeedMps,
        leaderSpeedMps
      );

  }


  // =======================================================
  // Final speed clamp
  // =======================================================

  vehicle.speedMps =
    Math.max(
      0,
      Math.min(
        newSpeedMps,
        desiredSpeedMps
      )
    );

}