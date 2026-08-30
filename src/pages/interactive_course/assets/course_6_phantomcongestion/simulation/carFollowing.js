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

    case "ghr":

      updateVehicleSpeedGHR(
        vehicle,
        leaderInfo,
        dt
      );

      break;

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


  // =======================================================
  //  exising - 0
  // =======================================================
// GM / GHR Car-Following Model
//
// General Motors / Gazis-Herman-Rothery
// stimulus-response car-following model.
//
// Core model:
//
//               v_n^m
// a_n = alpha * ----- * (v_leader - v_n)
//                s^l
//
// This implementation:
//
// 1. Uses continuous acceleration integration.
// 2. Does NOT instantly force follower speed to leader speed.
// 3. Adds bounded emergency braking when spacing becomes small.
// 4. Adds free-flow recovery toward desired speed.
// 5. Stores accelerationMps2 for visualization.
//
// =======================================================

function updateVehicleSpeedGHR(
  vehicle,
  leaderInfo,
  dt
) {

  // =====================================================
  // Numerical safety
  // =====================================================

  const safeDt =
    Math.max(
      Number(dt) || 0,
      0.000001
    );


  // =====================================================
  // GHR parameters
  // =====================================================

  // Sensitivity coefficient.
  //
  // Larger value:
  // stronger reaction to relative speed differences.
  //
  const sensitivityAlpha =
    1.2;


  // Speed sensitivity exponent.
  //
  // m = 0 gives a simpler spacing-based model.
  //
  const speedExponentM =
    0.0;


  // Spacing sensitivity exponent.
  //
  // l = 1 means sensitivity increases approximately
  // inversely with spacing.
  //
  const gapExponentL =
    1.0;


  // =====================================================
  // Physical / numerical limits
  // =====================================================

  const maximumAccelerationMps2 =
    1.5;


  // Normal strong braking limit.
  const maximumDecelerationMps2 =
    4.0;


  // Emergency braking limit.
  //
  // This can be stronger than normal braking,
  // but speed still changes continuously.
  //
  const emergencyDecelerationMps2 =
    7.0;


  // Absolute physical spacing buffer.
  const minimumGapM =
    2.0;


  // Desired time headway used for deciding
  // whether free-flow acceleration is appropriate.
  const desiredTimeHeadwayS =
    1.5;


  // Free-flow acceleration when traffic ahead
  // is sufficiently far away.
  const freeFlowAccelerationMps2 =
    0.8;


  // =====================================================
  // Current vehicle state
  // =====================================================

  const currentSpeedMps =
    Math.max(
      0,
      Number(
        vehicle.speedMps
      ) || 0
    );


  const desiredSpeedMps =
    Math.max(
      0,
      Number(
        vehicle.desiredSpeedMps
      ) || 0
    );


  // =====================================================
  // No leader
  //
  // Accelerate toward desired speed.
  // =====================================================

  if (
    !leaderInfo ||
    !leaderInfo.vehicle
  ) {

    const accelerationMps2 =
      currentSpeedMps <
      desiredSpeedMps
        ? freeFlowAccelerationMps2
        : 0;


    let newSpeedMps =
      currentSpeedMps +
      accelerationMps2 *
        safeDt;


    newSpeedMps =
      Math.min(
        desiredSpeedMps,
        Math.max(
          0,
          newSpeedMps
        )
      );


    vehicle.speedMps =
      newSpeedMps;


    vehicle.accelerationMps2 =
      (
        newSpeedMps -
        currentSpeedMps
      ) /
      safeDt;


    return;

  }


  // =====================================================
  // Leader state
  // =====================================================

  const leader =
    leaderInfo.vehicle;


  const leaderSpeedMps =
    Math.max(
      0,
      Number(
        leader.speedMps
      ) || 0
    );


  const gapM =
    Math.max(
      0.01,
      Number(
        leaderInfo.gapM
      ) || 0.01
    );


  // =====================================================
  // Relative speed
  //
  // Positive closingSpeed:
  // follower is faster than leader and is closing in.
  //
  // =====================================================

  const closingSpeedMps =
    currentSpeedMps -
    leaderSpeedMps;


  const relativeSpeedMps =
    leaderSpeedMps -
    currentSpeedMps;


  // =====================================================
  // Classical GHR sensitivity
  //
  //               v^m
  // sensitivity = α -----
  //               gap^l
  //
  // =====================================================

  const speedTerm =
    Math.pow(
      Math.max(
        currentSpeedMps,
        0.1
      ),
      speedExponentM
    );


  const gapTerm =
    Math.pow(
      Math.max(
        gapM,
        0.1
      ),
      gapExponentL
    );


  const sensitivity =
    sensitivityAlpha *
    (
      speedTerm /
      gapTerm
    );


  // =====================================================
  // Core GHR acceleration
  //
  // If follower is faster:
  //
  // relativeSpeed < 0
  // -> negative acceleration
  //
  // If leader is faster:
  //
  // relativeSpeed > 0
  // -> positive acceleration
  //
  // =====================================================

  let accelerationMps2 =
    sensitivity *
    relativeSpeedMps;


  // =====================================================
  // Desired following spacing
  // =====================================================

  const desiredGapM =
    minimumGapM +
    currentSpeedMps *
      desiredTimeHeadwayS;


  // =====================================================
  // Free-flow recovery
  //
  // Pure GHR responds mainly to relative speed.
  //
  // If both vehicles travel at equal speed,
  // GHR acceleration tends toward zero.
  //
  // Therefore when spacing is comfortably large,
  // allow the vehicle to recover toward desired speed.
  // =====================================================

  if (
    gapM >
      desiredGapM &&
    currentSpeedMps <
      desiredSpeedMps
  ) {

    accelerationMps2 +=
      freeFlowAccelerationMps2;

  }


  // =====================================================
  // Close-gap braking enhancement
  //
  // As spacing falls below desired spacing,
  // increase braking smoothly.
  //
  // This is NOT an instantaneous speed clamp.
  // =====================================================

  if (
    gapM <
      desiredGapM
  ) {

    const gapRatio =
      Math.max(
        0,
        Math.min(
          1,
          gapM /
            desiredGapM
        )
      );


    // 0 when gap is adequate.
    // Approaches 1 as spacing collapses.
    const spacingDeficit =
      1 -
      gapRatio;


    const additionalBrakingMps2 =
      spacingDeficit *
      maximumDecelerationMps2;


    accelerationMps2 -=
      additionalBrakingMps2;

  }


  // =====================================================
  // Emergency braking calculation
  //
  // IMPORTANT:
  //
  // We DO NOT do:
  //
  // follower.speed = leader.speed
  //
  // Instead estimate the deceleration required to remove
  // the relative speed before consuming the remaining gap.
  //
  //
  //                delta_v²
  // a_required = - --------
  //                 2 s
  //
  // =====================================================

  if (
    closingSpeedMps >
      0
  ) {

    const availableGapM =
      Math.max(
        gapM -
          minimumGapM,
        0.25
      );


    const requiredBrakingMps2 =
      -(
        closingSpeedMps *
        closingSpeedMps
      ) /
      (
        2 *
        availableGapM
      );


    // If the physically required braking is stronger
    // than the current GHR response, use it.
    //
    // Because these are negative values, Math.min()
    // selects the stronger braking response.
    accelerationMps2 =
      Math.min(
        accelerationMps2,
        requiredBrakingMps2
      );

  }


  // =====================================================
  // Very small gap
  //
  // Apply emergency braking,
  // but STILL through acceleration integration.
  //
  // No instantaneous speed matching.
  // =====================================================

  if (
    gapM <=
      minimumGapM
  ) {

    accelerationMps2 =
      Math.min(
        accelerationMps2,
        -maximumDecelerationMps2
      );

  }


  // =====================================================
  // Acceleration limits
  // =====================================================

  accelerationMps2 =
    Math.max(
      -emergencyDecelerationMps2,
      Math.min(
        maximumAccelerationMps2,
        accelerationMps2
      )
    );


  // =====================================================
  // Prevent acceleration beyond desired speed
  // =====================================================

  if (
    currentSpeedMps >=
      desiredSpeedMps &&
    accelerationMps2 >
      0
  ) {

    accelerationMps2 =
      0;

  }


  // =====================================================
  // Integrate speed continuously
  //
  // v(t + dt) =
  // v(t) + a(t) dt
  //
  // =====================================================

  let newSpeedMps =
    currentSpeedMps +
    accelerationMps2 *
      safeDt;


  // =====================================================
  // Physical speed bounds
  // =====================================================

  newSpeedMps =
    Math.max(
      0,
      newSpeedMps
    );


  newSpeedMps =
    Math.min(
      desiredSpeedMps,
      newSpeedMps
    );


  // =====================================================
  // Update vehicle
  // =====================================================

  vehicle.speedMps =
    newSpeedMps;


  // Store ACTUAL acceleration produced by
  // the numerical speed update.
  vehicle.accelerationMps2 =
    (
      newSpeedMps -
      currentSpeedMps
    ) /
    safeDt;

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