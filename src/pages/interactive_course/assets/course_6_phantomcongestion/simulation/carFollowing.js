// =========================================================
// carFollowing.js
// =========================================================
//
// Supported car-following models:
//
// 1. "rule"
//    Existing rule-based time-headway model
//
// 2. "idm"
//    Intelligent Driver Model
//
// 3. "ovm"
//    Optimal Velocity Model
//
// 4. "acc"
//    Adaptive Cruise Control
//
// 5. "cacc"
//    Cooperative Adaptive Cruise Control
//
// =========================================================


// =========================================================
// Utility
// =========================================================

function clamp(
  value,
  minimum,
  maximum
) {

  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );

}


// =========================================================
// Get leader speed safely
// =========================================================

function getLeaderSpeedMps(
  leaderInfo
) {

  if (!leaderInfo) {
    return null;
  }


  const leader =
    leaderInfo.vehicle;


  if (!leader) {
    return null;
  }


  return Math.max(
    0,
    Number(
      leader.speedMps
    ) || 0
  );

}


// =========================================================
// Main dispatcher
// =========================================================

export function updateVehicleSpeed(
  vehicle,
  leaderInfo,
  dt,
  model = "idm"
) {

  switch (
    model
  ) {

    // =====================================================
    // Existing custom rule-based model
    // =====================================================

    case "rule":

      updateVehicleSpeedRuleBased(
        vehicle,
        leaderInfo,
        dt
      );

      break;


    // =====================================================
    // Optimal Velocity Model
    // =====================================================

    case "ovm":

      updateVehicleSpeedOVM(
        vehicle,
        leaderInfo,
        dt
      );

      break;


    // =====================================================
    // Adaptive Cruise Control
    // =====================================================

    case "acc":

      updateVehicleSpeedACC(
        vehicle,
        leaderInfo,
        dt
      );

      break;


    // =====================================================
    // Cooperative ACC
    // =====================================================

    case "cacc":

      updateVehicleSpeedCACC(
        vehicle,
        leaderInfo,
        dt
      );

      break;


    // =====================================================
    // Intelligent Driver Model
    // =====================================================

    case "idm":

    default:

      updateVehicleSpeedIDM(
        vehicle,
        leaderInfo,
        dt
      );

      break;

  }

}


// =========================================================
// 1. Existing rule-based car-following model
// =========================================================
//
// Your original model.
//
// Desired gap:
//
// s_desired = s0 + vT
//
// =========================================================

function updateVehicleSpeedRuleBased(
  vehicle,
  leaderInfo,
  dt
) {

  const minimumGapM =
    3.0;


  const timeHeadwayS =
    2.2;


  const accelerationMps2 =
    1.0;


  const decelerationMps2 =
    4.0;


  // =======================================================
  // No leader
  // =======================================================

  if (!leaderInfo) {

    vehicle.speedMps =
      Math.min(
        vehicle.desiredSpeedMps,
        vehicle.speedMps +
          accelerationMps2 *
          dt
      );


    vehicle.accelerationMps2 =
      accelerationMps2;


    return;

  }


  const leader =
    leaderInfo.vehicle;


  const gapM =
    Math.max(
      0,
      leaderInfo.gapM
    );


  // =======================================================
  // Dynamic desired following gap
  // =======================================================

  const desiredGapM =
    minimumGapM +
    vehicle.speedMps *
      timeHeadwayS;


  // =======================================================
  // Extremely close
  // =======================================================

  if (
    gapM <=
    minimumGapM
  ) {

    const previousSpeed =
      vehicle.speedMps;


    vehicle.speedMps =
      Math.min(
        vehicle.speedMps,
        leader.speedMps
      );


    vehicle.accelerationMps2 =
      (
        vehicle.speedMps -
        previousSpeed
      ) /
      Math.max(
        dt,
        0.000001
      );


    return;

  }


  // =======================================================
  // Too close
  // =======================================================

  if (
    gapM <
    desiredGapM
  ) {

    const gapRatio =
      clamp(
        gapM /
          desiredGapM,
        0,
        1
      );


    const targetSpeedMps =
      leader.speedMps +
      gapRatio *
      (
        vehicle.desiredSpeedMps -
        leader.speedMps
      );


    const previousSpeed =
      vehicle.speedMps;


    vehicle.speedMps =
      Math.max(
        targetSpeedMps,

        vehicle.speedMps -
          decelerationMps2 *
          dt
      );


    if (
      gapM <
      desiredGapM *
        0.6
    ) {

      vehicle.speedMps =
        Math.min(
          vehicle.speedMps,
          leader.speedMps
        );

    }


    vehicle.speedMps =
      Math.max(
        0,
        vehicle.speedMps
      );


    vehicle.accelerationMps2 =
      (
        vehicle.speedMps -
        previousSpeed
      ) /
      Math.max(
        dt,
        0.000001
      );


    return;

  }


  // =======================================================
  // Enough space
  // =======================================================

  const previousSpeed =
    vehicle.speedMps;


  vehicle.speedMps =
    Math.min(
      vehicle.desiredSpeedMps,

      vehicle.speedMps +
        accelerationMps2 *
        dt
    );


  vehicle.accelerationMps2 =
    (
      vehicle.speedMps -
      previousSpeed
    ) /
    Math.max(
      dt,
      0.000001
    );

}


// =========================================================
// 2. Intelligent Driver Model
// =========================================================
//
// a = a_max [
//   1
//   - (v / v0)^delta
//   - (s_star / s)^2
// ]
//
// s_star =
//   s0
//   + vT
//   + v * deltaV /
//     (2 * sqrt(a_max * b))
//
// =========================================================

function updateVehicleSpeedIDM(
  vehicle,
  leaderInfo,
  dt
) {

  const v =
    Math.max(
      0,
      vehicle.speedMps
    );


  const desiredSpeedMps =
    Math.max(
      0.1,
      vehicle.desiredSpeedMps
    );


  // =======================================================
  // IDM parameters
  // =======================================================

  const maximumAccelerationMps2 =
    1.2;


  const comfortableDecelerationMps2 =
    2.0;


  const minimumGapM =
    2.0;


  const desiredTimeHeadwayS =
    1.5;


  const accelerationExponent =
    4;


  let accelerationMps2;


  // =======================================================
  // No leader
  // =======================================================

  if (!leaderInfo) {

    accelerationMps2 =
      maximumAccelerationMps2 *
      (
        1 -
        Math.pow(
          v /
            desiredSpeedMps,
          accelerationExponent
        )
      );

  }

  // =======================================================
  // Leader exists
  // =======================================================

  else {

    const gapM =
      Math.max(
        0.5,
        Number(
          leaderInfo.gapM
        ) || 0.5
      );


    const leaderSpeedMps =
      getLeaderSpeedMps(
        leaderInfo
      ) ?? 0;


    // Positive deltaV means follower is
    // approaching the leader.
    const deltaVMps =
      v -
      leaderSpeedMps;


    const dynamicGapM =
      minimumGapM +
      Math.max(
        0,

        v *
          desiredTimeHeadwayS +

        (
          v *
          deltaVMps
        ) /
        (
          2 *
          Math.sqrt(
            maximumAccelerationMps2 *
            comfortableDecelerationMps2
          )
        )

      );


    accelerationMps2 =
      maximumAccelerationMps2 *
      (
        1 -

        Math.pow(
          v /
            desiredSpeedMps,
          accelerationExponent
        ) -

        Math.pow(
          dynamicGapM /
            gapM,
          2
        )
      );

  }


  accelerationMps2 =
    clamp(
      accelerationMps2,
      -5.0,
      2.0
    );


  vehicle.accelerationMps2 =
    accelerationMps2;


  vehicle.speedMps =
    Math.max(
      0,

      v +
        accelerationMps2 *
        dt
    );

}


// =========================================================
// 3. Optimal Velocity Model
// =========================================================
//
// dv/dt = alpha [V(s) - v]
//
// V(s) is an optimal speed determined by gap.
//
// =========================================================

function updateVehicleSpeedOVM(
  vehicle,
  leaderInfo,
  dt
) {

  const v =
    Math.max(
      0,
      vehicle.speedMps
    );


  const desiredSpeedMps =
    Math.max(
      0.1,
      vehicle.desiredSpeedMps
    );


  // =======================================================
  // OVM parameters
  // =======================================================

  const sensitivity =
    0.7;


  const criticalGapM =
    25.0;


  const transitionWidthM =
    8.0;


  let targetSpeedMps =
    desiredSpeedMps;


  // =======================================================
  // Leader exists
  // =======================================================

  if (leaderInfo) {

    const gapM =
      Math.max(
        0,
        Number(
          leaderInfo.gapM
        ) || 0
      );


    // Smooth optimal velocity function:
    //
    // gap small  -> target speed near 0
    // gap large  -> target speed near desired speed

    const normalizedGap =
      (
        gapM -
        criticalGapM
      ) /
      transitionWidthM;


    const optimalVelocityFactor =
      0.5 *
      (
        Math.tanh(
          normalizedGap
        ) +
        1
      );


    targetSpeedMps =
      desiredSpeedMps *
      optimalVelocityFactor;

  }


  let accelerationMps2 =
    sensitivity *
    (
      targetSpeedMps -
      v
    );


  accelerationMps2 =
    clamp(
      accelerationMps2,
      -4.5,
      2.0
    );


  vehicle.accelerationMps2 =
    accelerationMps2;


  vehicle.speedMps =
    Math.max(
      0,

      v +
        accelerationMps2 *
        dt
    );

}


// =========================================================
// 4. Adaptive Cruise Control
// =========================================================
//
// a =
//   K_s * spacingError
//   +
//   K_v * relativeSpeed
//
// Desired gap:
//
// s_desired = s0 + T * v
//
// =========================================================

function updateVehicleSpeedACC(
  vehicle,
  leaderInfo,
  dt
) {

  const v =
    Math.max(
      0,
      vehicle.speedMps
    );


  const desiredSpeedMps =
    Math.max(
      0.1,
      vehicle.desiredSpeedMps
    );


  // =======================================================
  // ACC parameters
  // =======================================================

  const minimumGapM =
    2.0;


  const timeHeadwayS =
    1.2;


  const spacingGain =
    0.20;


  const relativeSpeedGain =
    0.85;


  const freeSpeedGain =
    0.55;


  let accelerationMps2;


  // =======================================================
  // No leader
  // =======================================================

  if (!leaderInfo) {

    accelerationMps2 =
      freeSpeedGain *
      (
        desiredSpeedMps -
        v
      );

  }

  // =======================================================
  // Leader exists
  // =======================================================

  else {

    const gapM =
      Math.max(
        0,
        Number(
          leaderInfo.gapM
        ) || 0
      );


    const leaderSpeedMps =
      getLeaderSpeedMps(
        leaderInfo
      ) ?? 0;


    const desiredGapM =
      minimumGapM +
      timeHeadwayS *
      v;


    const spacingErrorM =
      gapM -
      desiredGapM;


    const relativeSpeedMps =
      leaderSpeedMps -
      v;


    accelerationMps2 =
      spacingGain *
        spacingErrorM +

      relativeSpeedGain *
        relativeSpeedMps;


    // Prevent aggressive acceleration above
    // the desired free-flow speed.

    if (
      v >
      desiredSpeedMps
    ) {

      accelerationMps2 -=
        freeSpeedGain *
        (
          v -
          desiredSpeedMps
        );

    }

  }


  accelerationMps2 =
    clamp(
      accelerationMps2,
      -3.5,
      1.8
    );


  vehicle.accelerationMps2 =
    accelerationMps2;


  vehicle.speedMps =
    Math.max(
      0,

      Math.min(
        desiredSpeedMps *
          1.05,

        v +
          accelerationMps2 *
          dt
      )
    );

}


// =========================================================
// 5. Cooperative Adaptive Cruise Control
// =========================================================
//
// Current implementation:
//
// Uses the directly preceding vehicle's:
//
// - spacing
// - speed
// - acceleration
//
// This gives a simple cooperative feed-forward term:
//
// a =
//   K_s * spacingError
//   +
//   K_v * relativeSpeed
//   +
//   K_a * leaderAcceleration
//
// Later this can be extended to several upstream vehicles.
//
// =========================================================

function updateVehicleSpeedCACC(
  vehicle,
  leaderInfo,
  dt
) {

  const v =
    Math.max(
      0,
      vehicle.speedMps
    );


  const desiredSpeedMps =
    Math.max(
      0.1,
      vehicle.desiredSpeedMps
    );


  // =======================================================
  // CACC parameters
  // =======================================================

  const minimumGapM =
    2.0;


  const timeHeadwayS =
    0.9;


  const spacingGain =
    0.16;


  const relativeSpeedGain =
    0.95;


  const leaderAccelerationGain =
    0.55;


  const freeSpeedGain =
    0.50;


  let accelerationMps2;


  // =======================================================
  // No leader
  // =======================================================

  if (!leaderInfo) {

    accelerationMps2 =
      freeSpeedGain *
      (
        desiredSpeedMps -
        v
      );

  }

  // =======================================================
  // Leader exists
  // =======================================================

  else {

    const leader =
      leaderInfo.vehicle;


    const gapM =
      Math.max(
        0,
        Number(
          leaderInfo.gapM
        ) || 0
      );


    const leaderSpeedMps =
      Math.max(
        0,
        Number(
          leader?.speedMps
        ) || 0
      );


    const leaderAccelerationMps2 =
      Number(
        leader?.accelerationMps2
      ) || 0;


    const desiredGapM =
      minimumGapM +
      timeHeadwayS *
      v;


    const spacingErrorM =
      gapM -
      desiredGapM;


    const relativeSpeedMps =
      leaderSpeedMps -
      v;


    accelerationMps2 =
      spacingGain *
        spacingErrorM +

      relativeSpeedGain *
        relativeSpeedMps +

      leaderAccelerationGain *
        leaderAccelerationMps2;

  }


  accelerationMps2 =
    clamp(
      accelerationMps2,
      -3.0,
      1.6
    );


  vehicle.accelerationMps2 =
    accelerationMps2;


  vehicle.speedMps =
    Math.max(
      0,

      Math.min(
        desiredSpeedMps *
          1.03,

        v +
          accelerationMps2 *
          dt
      )
    );

}