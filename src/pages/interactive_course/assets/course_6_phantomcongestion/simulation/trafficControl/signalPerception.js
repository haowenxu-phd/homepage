// =========================================================
// signalPerception.js
// =========================================================
//
// Converts active traffic-control signals into
// virtual stationary leaders that can be consumed by
// the existing car-following model.
//
// Architecture:
//
// TrafficSignal
//      ↓
// signal state
//      ↓
// RED / YELLOW?
//      ↓
// distance to stop bar
//      ↓
// virtual stationary leader
//      ↓
// carFollowing.js
//
// IMPORTANT:
//
// This module does NOT:
//
// - move vehicles
// - modify vehicle speed directly
// - render traffic signals
// - update signal timing
//
// It only performs traffic-control perception.
//
// =========================================================


// =========================================================
// Find nearest active traffic-signal constraint
// =========================================================

export function findSignalConstraint({

  vehicle,

  signals = [],

  simulationTimeS = 0,

  getSignalState,

  // Maximum distance at which a vehicle
  // considers a traffic signal.
  perceptionDistanceM = 100,

  // Small buffer before the actual stop bar.
  //
  // This makes the virtual obstacle appear slightly
  // before the exact lane endpoint so the vehicle
  // does not visually enter the intersection.
  stopBufferM = 2,

}) {

  // -------------------------------------------------------
  // Basic validation
  // -------------------------------------------------------

  if (
    !vehicle ||
    vehicle.finished ||
    !Array.isArray(signals) ||
    signals.length === 0 ||
    typeof getSignalState !== "function"
  ) {

    return null;

  }


  // -------------------------------------------------------
  // Candidate signal constraints
  // -------------------------------------------------------

  const candidates =
    [];


  // =======================================================
  // Search signals
  // =======================================================

  for (
    const signal
    of signals
  ) {

    if (!signal) {
      continue;
    }


    // -----------------------------------------------------
    // For the first implementation:
    //
    // A vehicle only reacts to a signal controlling
    // its CURRENT lane.
    //
    // Example:
    //
    // lane_0003
    //
    // vehicle -------------------------- 🚦
    //
    // -----------------------------------------------------

    if (
      signal.laneId !==
      vehicle.currentLaneId
    ) {

      continue;

    }


    // -----------------------------------------------------
    // Determine current signal state
    // -----------------------------------------------------

    const signalState =
      getSignalState(
        signal,
        simulationTimeS
      );


    // -----------------------------------------------------
    // GREEN does not constrain movement
    // -----------------------------------------------------

    if (
      signalState === "green"
    ) {

      return null;

    }


    // -----------------------------------------------------
    // For version 1:
    //
    // RED    -> stop
    // YELLOW -> stop
    //
    // Later you can add a yellow-light decision model
    // based on stopping distance.
    // -----------------------------------------------------

    if (
      signalState !== "red" &&
      signalState !== "yellow"
    ) {

      continue;

    }


    // -----------------------------------------------------
    // Stop-bar location along lane
    // -----------------------------------------------------

    const signalDistanceAlongLaneM =
      Number(
        signal.distanceAlongLaneM
      );


    const vehicleDistanceAlongLaneM =
      Number(
        vehicle.distanceAlongLaneM
      ) || 0;


    if (
      !Number.isFinite(
        signalDistanceAlongLaneM
      )
    ) {

      continue;

    }


    // -----------------------------------------------------
    // Distance from vehicle to desired stopping point
    //
    // stopBufferM moves the effective stop position
    // slightly upstream of the traffic signal.
    // -----------------------------------------------------

    const effectiveStopPositionM =
      Math.max(
        0,

        signalDistanceAlongLaneM -
        stopBufferM
      );


    const distanceToStopBarM =
      effectiveStopPositionM -
      vehicleDistanceAlongLaneM;


    // -----------------------------------------------------
    // Vehicle has already crossed the stop bar.
    //
    // Do NOT suddenly stop it after it enters
    // the intersection.
    // -----------------------------------------------------

    if (
      distanceToStopBarM <= 0
    ) {

      continue;

    }


    // -----------------------------------------------------
    // Signal too far away
    // -----------------------------------------------------

    if (
      distanceToStopBarM >
      perceptionDistanceM
    ) {

      continue;

    }


    // =====================================================
    // Convert traffic signal into virtual stationary leader
    // =====================================================

    const virtualSignalLeader = {

      id:
        signal.id,

      // Existing car-following model expects
      // leader.speedMps.
      speedMps:
        0,

      desiredSpeedMps:
        0,

      // There is no physical vehicle body.
      lengthM:
        0,

      currentLaneId:
        signal.laneId,

      distanceAlongLaneM:
        effectiveStopPositionM,

      // Useful metadata
      isTrafficSignal:
        true,

      trafficSignalId:
        signal.id,

      trafficSignalState:
        signalState,

    };


    candidates.push({

      // Keep the same interface used by
      // your existing car-following model.
      vehicle:
        virtualSignalLeader,

      gapM:
        distanceToStopBarM,

      type:
        "traffic_signal",

      signalId:
        signal.id,

      state:
        signalState,

    });

  }


  // =======================================================
  // No active traffic-control constraint
  // =======================================================

  if (
    candidates.length === 0
  ) {

    return null;

  }


  // =======================================================
  // Return nearest signal constraint
  // =======================================================

  candidates.sort(
    (
      a,
      b
    ) =>
      a.gapM -
      b.gapM
  );


  return candidates[0];

}