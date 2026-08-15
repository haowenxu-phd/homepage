// =========================================================
// carFollowing.js
// =========================================================
export function updateVehicleSpeed(
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

  // =============================================
  // No leader
  // =============================================

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


  // =============================================
  // Dynamic desired following gap
  //
  // s = s0 + vT
  // =============================================

  const desiredGapM =
    minimumGapM +
    vehicle.speedMps *
      timeHeadwayS;


  // =============================================
  // Extremely close
  // =============================================

  if (
    gapM <=
    minimumGapM
  ) {

    vehicle.speedMps =
      Math.min(
        vehicle.speedMps,
        leader.speedMps
      );

    return;
  }


  // =============================================
  // Too close -> slow down
  // =============================================

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


    // The smaller the gap,
    // the closer the target speed is to leader speed.
    const targetSpeedMps =
      leader.speedMps +
      gapRatio *
      (
        vehicle.desiredSpeedMps -
        leader.speedMps
      );


    vehicle.speedMps =
      Math.max(
        targetSpeedMps,

        vehicle.speedMps -
        decelerationMps2 *
        dt
      );


    // Strong constraint when very close
    if (
      gapM <
      desiredGapM * 0.6
    ) {

      vehicle.speedMps =
        Math.min(
          vehicle.speedMps,
          leader.speedMps
        );

    }


    return;
  }


  // =============================================
  // Enough space -> accelerate back to desired speed
  // =============================================

  vehicle.speedMps =
    Math.min(
      vehicle.desiredSpeedMps,

      vehicle.speedMps +
        accelerationMps2 *
        dt
    );

}