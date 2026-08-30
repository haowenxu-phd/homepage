// =======================================================
// TrafficWavePanel.jsx
//
// Compact visual analytics panel for demonstrating
// phantom traffic jam propagation.
//
// Expected vehicle fields:
//
// vehicle.id
// vehicle.distanceAlongLaneM
// vehicle.speedMps
// vehicle.desiredSpeedMps
// vehicle.accelerationMps2
// vehicle.finished
//
// The component DOES NOT modify vehicle data.
// Braking is controlled by the parent component through:
//
// onBrakeStart()
// onBrakeEnd()
//
// =======================================================

import React from "react";


// =======================================================
// Utility Functions
// =======================================================

function clamp(
  value,
  minValue,
  maxValue
) {

  return Math.min(
    maxValue,
    Math.max(
      minValue,
      value
    )
  );
}


// -------------------------------------------------------
// Convert m/s to km/h
// -------------------------------------------------------

function mpsToKmh(
  speedMps
) {

  return (
    Number(
      speedMps
    ) || 0
  ) * 3.6;
}


// -------------------------------------------------------
// Calculate periodic distance BEHIND Ego
// -------------------------------------------------------

function getDistanceBehindEgo(
  egoDistance,
  vehicleDistance,
  loopLengthM
) {

  if (
    !Number.isFinite(
      egoDistance
    ) ||
    !Number.isFinite(
      vehicleDistance
    ) ||
    !Number.isFinite(
      loopLengthM
    ) ||
    loopLengthM <= 0
  ) {

    return Infinity;
  }


  return (
    egoDistance -
    vehicleDistance +
    loopLengthM
  ) % loopLengthM;
}


// =======================================================
// Vehicle Speed Row
// =======================================================

function VehicleSpeedRow({

  vehicle,

  label,

  distanceBehindM,

  isEgo = false,

  isEgoBraking = false,

  onBrakePointerDown,

  onBrakePointerUp,

  onBrakePointerCancel,

  onBrakePointerLeave

}) {

  // =====================================================
  // Current speed
  // =====================================================

  const speedKmh =
    mpsToKmh(
      vehicle?.speedMps
    );


  // =====================================================
  // Desired speed
  //
  // Each vehicle uses its own desired speed as the
  // maximum value of the speed bar.
  //
  // 100% bar = desired speed.
  // =====================================================

  const desiredSpeedKmh =
    mpsToKmh(
      vehicle?.desiredSpeedMps
    );


  const safeDesiredSpeedKmh =
    Math.max(
      desiredSpeedKmh,
      0.1
    );


  // =====================================================
  // Acceleration
  // =====================================================

  const acceleration =
    Number(
      vehicle?.accelerationMps2
    ) || 0;


  // =====================================================
  // Speed bar percentage
  //
  // Current speed
  // ---------------- × 100
  // Desired speed
  //
  // =====================================================

  const speedPercent =
    clamp(
      (
        speedKmh /
        safeDesiredSpeedKmh
      ) *
      100,
      0,
      100
    );


  // =====================================================
  // Driving state
  // =====================================================

  let stateText =
    "CRUISING";


  if (
    isEgo &&
    isEgoBraking
  ) {

    stateText =
      "BRAKING";

  } else if (
    acceleration <
      -1.0
  ) {

    stateText =
      "BRAKING";

  } else if (
    acceleration <
      -0.15
  ) {

    stateText =
      "DECEL";

  } else if (
    acceleration >
      0.15
  ) {

    stateText =
      "ACCEL";

  }


  // =====================================================
  // Acceleration text
  // =====================================================

  const accelerationText =
    acceleration >= 0
      ? `+${acceleration.toFixed(
          1
        )}`
      : acceleration.toFixed(
          1
        );


  // =====================================================
  // Render
  // =====================================================

  return (

    <div
      className={`
        rounded-md
        border
        px-2
        py-1.5
        transition-all
        duration-150

        ${
          isEgo
            ? `
              border-blue-300
              bg-blue-50
            `
            : `
              border-slate-200
              bg-white
            `
        }
      `}
    >

      {/* =================================================
          Main compact row
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        {/* ===============================================
            Vehicle identity
        ================================================ */}

        <div
          className="
            flex
            w-[66px]
            shrink-0
            items-center
            gap-1.5
          "
        >

          <div
            className={`
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded-full
              text-[9px]
              font-bold

              ${
                isEgo
                  ? `
                    bg-blue-600
                    text-white
                  `
                  : `
                    bg-slate-100
                    text-slate-500
                  `
              }
            `}
          >

            {
              isEgo
                ? "★"
                : label.replace(
                    "Car ",
                    ""
                  )
            }

          </div>


          <div
            className="
              min-w-0
            "
          >

            <div
              className={`
                truncate
                text-[11px]
                font-semibold
                leading-3

                ${
                  isEgo
                    ? "text-blue-800"
                    : "text-slate-700"
                }
              `}
            >
              {label}
            </div>


            <div
              className="
                mt-0.5
                whitespace-nowrap
                text-[8px]
                leading-none
                text-slate-400
              "
            >

              {
                isEgo
                  ? "controlled"
                  : Number.isFinite(
                      distanceBehindM
                    )
                  ? `${distanceBehindM.toFixed(
                      0
                    )} m`
                  : "follower"
              }

            </div>

          </div>

        </div>


        {/* ===============================================
            Speed visualization
        ================================================ */}

        <div
          className="
            min-w-0
            flex-1
          "
        >

          {/* ---------------------------------------------
              Speed + state
          ---------------------------------------------- */}

          <div
            className="
              mb-1
              flex
              items-center
              justify-between
              gap-2
            "
          >

            {/* Current / desired speed */}

            <div
              className="
                flex
                min-w-0
                items-baseline
                gap-1
              "
            >

              <span
                className={`
                  text-xs
                  font-bold

                  ${
                    isEgo
                      ? "text-blue-700"
                      : "text-slate-800"
                  }
                `}
              >
                {
                  speedKmh.toFixed(
                    1
                  )
                }
              </span>


              <span
                className="
                  text-[8px]
                  text-slate-400
                "
              >
                km/h
              </span>


              <span
                className="
                  ml-0.5
                  whitespace-nowrap
                  text-[8px]
                  text-slate-400
                "
              >
                /
                {" "}
                {
                  desiredSpeedKmh.toFixed(
                    0
                  )
                }
              </span>

            </div>


            {/* State + acceleration */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-1.5
              "
            >

              <span
                className={`
                  rounded
                  px-1
                  py-0.5
                  text-[8px]
                  font-semibold
                  tracking-wide

                  ${
                    stateText ===
                    "BRAKING"
                      ? `
                        bg-red-100
                        text-red-700
                      `
                      : stateText ===
                        "DECEL"
                      ? `
                        bg-amber-100
                        text-amber-700
                      `
                      : stateText ===
                        "ACCEL"
                      ? `
                        bg-emerald-100
                        text-emerald-700
                      `
                      : `
                        bg-slate-100
                        text-slate-500
                      `
                  }
                `}
              >
                {stateText}
              </span>


              <span
                className={`
                  whitespace-nowrap
                  text-[9px]
                  font-semibold

                  ${
                    acceleration <
                    -0.15
                      ? "text-red-600"
                      : acceleration >
                        0.15
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }
                `}
              >
                a={accelerationText}
              </span>

            </div>

          </div>


          {/* ---------------------------------------------
              Speed bar
              
              Full width = desired speed
          ---------------------------------------------- */}

          <div
            className="
              relative
              h-1.5
              w-full
              overflow-hidden
              rounded-full
              bg-slate-100
            "
          >

            <div
              className={`
                h-full
                rounded-full
                transition-[width]
                duration-150

                ${
                  isEgo
                    ? (
                        isEgoBraking
                          ? "bg-red-600"
                          : "bg-blue-600"
                      )
                    : acceleration <
                      -0.15
                    ? "bg-amber-500"
                    : "bg-slate-500"
                }
              `}
              style={{
                width:
                  `${speedPercent}%`
              }}
            />

          </div>


          {/* ---------------------------------------------
              Desired speed scale
          ---------------------------------------------- */}

          <div
            className="
              mt-0.5
              flex
              items-center
              justify-between
              text-[7px]
              leading-none
              text-slate-300
            "
          >

            <span>
              0
            </span>


            <span>
              desired
              {" "}
              {
                desiredSpeedKmh.toFixed(
                  0
                )
              }
            </span>

          </div>

        </div>


        {/* ===============================================
            Ego brake control
        ================================================ */}

        {
          isEgo && (

            <button

              type="button"

              onPointerDown={
                onBrakePointerDown
              }

              onPointerUp={
                onBrakePointerUp
              }

              onPointerCancel={
                onBrakePointerCancel
              }

              onPointerLeave={
                onBrakePointerLeave
              }

              className={`
                flex
                h-9
                w-[72px]
                shrink-0
                touch-none
                select-none
                flex-col
                items-center
                justify-center
                rounded-md
                text-[9px]
                font-bold
                leading-3
                transition-all
                duration-100

                ${
                  isEgoBraking
                    ? `
                      scale-[0.97]
                      bg-red-700
                      text-white
                      shadow-inner
                    `
                    : `
                      bg-red-600
                      text-white
                      shadow-sm

                      hover:bg-red-700
                      active:scale-[0.97]
                    `
                }
              `}
            >

              <span
                className="
                  text-[9px]
                "
              >

                {
                  isEgoBraking
                    ? "BRAKING"
                    : "HOLD"
                }

              </span>


              <span
                className="
                  text-[8px]
                  font-semibold
                "
              >
                TO BRAKE
              </span>

            </button>

          )
        }

      </div>

    </div>

  );

}


// =======================================================
// Traffic Wave Panel
// =======================================================

export default function TrafficWavePanel({

  vehicles = [],

  loopLengthM = 0,

  speedLimit = 50,

  egoVehicleId =
    null,

  followerCount = 5,

  isEgoBraking = false,

  onBrakeStart = () => {},

  onBrakeEnd = () => {}

}) {

  // =====================================================
  // Find active vehicles
  // =====================================================

  const activeVehicles =
    Array.isArray(
      vehicles
    )
      ? vehicles.filter(
          vehicle =>
            vehicle &&
            !vehicle.finished &&
            Number.isFinite(
              Number(
                vehicle.distanceAlongLaneM
              )
            )
        )
      : [];


  // =====================================================
  // Find Ego
  // =====================================================

  let egoVehicle =
    activeVehicles.find(
      vehicle =>
        vehicle.id ===
        egoVehicleId
    );


  if (
    !egoVehicle &&
    activeVehicles.length >
      0
  ) {

    egoVehicle =
      activeVehicles[0];

  }


  // =====================================================
  // Find follower vehicles behind Ego
  // =====================================================

  let followerVehicles =
    [];


  if (
    egoVehicle &&
    Number.isFinite(
      Number(
        egoVehicle.distanceAlongLaneM
      )
    )
  ) {

    const egoDistance =
      Number(
        egoVehicle.distanceAlongLaneM
      );


    followerVehicles =
      activeVehicles
        .filter(
          vehicle =>
            vehicle.id !==
            egoVehicle.id
        )
        .map(
          vehicle => {

            const distanceBehindM =
              getDistanceBehindEgo(
                egoDistance,
                Number(
                  vehicle
                    .distanceAlongLaneM
                ),
                Number(
                  loopLengthM
                )
              );


            return {

              vehicle,

              distanceBehindM

            };

          }
        )
        .filter(
          item =>
            Number.isFinite(
              item.distanceBehindM
            ) &&
            item.distanceBehindM >
              0
        )
        .sort(
          (
            a,
            b
          ) =>
            a.distanceBehindM -
            b.distanceBehindM
        )
        .slice(
          0,
          followerCount
        );

  }


  // =====================================================
  // Disturbance propagation
  // =====================================================

  const brakingFollowerCount =
    followerVehicles.filter(
      item => {

        const acceleration =
          Number(
            item
              .vehicle
              ?.accelerationMps2
          ) || 0;


        return (
          acceleration <
          -0.15
        );

      }
    ).length;


  const disturbanceActive =
    isEgoBraking ||
    brakingFollowerCount >
      0;


  // =====================================================
  // Brake pointer events
  // =====================================================

  const handleBrakePointerDown =
    event => {

      event.preventDefault();


      if (
        event.currentTarget
          ?.setPointerCapture
      ) {

        try {

          event.currentTarget
            .setPointerCapture(
              event.pointerId
            );

        } catch {

          // Ignore pointer capture errors.

        }

      }


      onBrakeStart();

    };


  const handleBrakePointerUp =
    event => {

      event.preventDefault();

      onBrakeEnd();

    };


  const handleBrakePointerCancel =
    event => {

      event.preventDefault();

      onBrakeEnd();

    };


  const handleBrakePointerLeave =
    event => {

      if (
        event.buttons ===
        1
      ) {

        onBrakeEnd();

      }

    };


  // =====================================================
  // Empty simulation state
  // =====================================================

  if (
    !egoVehicle
  ) {

    return (

      <section
        className="
          rounded-lg
          border
          border-slate-200
          bg-white
          p-3
          shadow-sm
        "
      >

        <div
          className="
            text-sm
            font-semibold
            text-slate-800
          "
        >
          Traffic Wave Laboratory
        </div>


        <p
          className="
            mt-1
            text-[10px]
            leading-4
            text-slate-400
          "
        >
          Start the simulation to observe
          vehicle-to-vehicle disturbance
          propagation.
        </p>


        <div
          className="
            mt-3
            rounded-md
            border
            border-dashed
            border-slate-200
            bg-slate-50
            px-3
            py-5
            text-center
          "
        >

          <div
            className="
              text-xs
              font-medium
              text-slate-500
            "
          >
            Waiting for vehicles
          </div>


          <div
            className="
              mt-1
              text-[9px]
              text-slate-400
            "
          >
            Ego and follower speeds
            will appear here.
          </div>

        </div>

      </section>

    );

  }


  // =====================================================
  // Render
  // =====================================================

  return (

    <section
      className="
        min-w-0
        rounded-lg
        border
        border-slate-200
        bg-white
        p-3
        shadow-sm
      "
    >

      {/* =================================================
          Header
      ================================================== */}

      <div
        className="
          mb-2
          flex
          items-start
          justify-between
          gap-2
        "
      >

        <div
          className="
            min-w-0
          "
        >

          <h4
            className="
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Traffic Wave Laboratory
          </h4>


          <p
            className="
              mt-0.5
              text-[9px]
              leading-3
              text-slate-400
            "
          >
            Brake Ego and observe the
            disturbance moving through
            following vehicles.
          </p>

        </div>


        <div
          className={`
            shrink-0
            rounded-full
            px-2
            py-0.5
            text-[8px]
            font-semibold
            tracking-wide

            ${
              disturbanceActive
                ? `
                  bg-amber-100
                  text-amber-700
                `
                : `
                  bg-emerald-100
                  text-emerald-700
                `
            }
          `}
        >

          {
            disturbanceActive
              ? "WAVE ACTIVE"
              : "STABLE"
          }

        </div>

      </div>


      {/* =================================================
          Column labels
      ================================================== */}

      <div
        className="
          mb-1
          flex
          items-center
          justify-between
          rounded
          bg-slate-50
          px-2
          py-1
        "
      >

        <span
          className="
            text-[8px]
            font-medium
            uppercase
            tracking-wide
            text-slate-400
          "
        >
          Vehicle chain
        </span>


        <span
          className="
            text-[8px]
            text-slate-400
          "
        >
          Current speed / desired speed
        </span>

      </div>


      {/* =================================================
          Vehicle chain
      ================================================== */}

      <div
        className="
          space-y-1
        "
      >

        {/* Ego */}

        <VehicleSpeedRow

          vehicle={
            egoVehicle
          }

          label="EGO"

          distanceBehindM={
            0
          }

          isEgo={
            true
          }

          isEgoBraking={
            isEgoBraking
          }

          onBrakePointerDown={
            handleBrakePointerDown
          }

          onBrakePointerUp={
            handleBrakePointerUp
          }

          onBrakePointerCancel={
            handleBrakePointerCancel
          }

          onBrakePointerLeave={
            handleBrakePointerLeave
          }

        />


        {/* Followers */}

        {
          followerVehicles.map(
            (
              item,
              index
            ) => (

              <VehicleSpeedRow

                key={
                  item.vehicle.id
                }

                vehicle={
                  item.vehicle
                }

                label={
                  `Car ${index + 1}`
                }

                distanceBehindM={
                  item.distanceBehindM
                }

              />

            )
          )
        }

      </div>


      {/* =================================================
          Compact propagation summary
      ================================================== */}

      <div
        className="
          mt-2
          rounded-md
          border
          border-slate-200
          bg-slate-50
          p-2
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >

          <span
            className="
              text-[8px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Disturbance Propagation
          </span>


          <span
            className={`
              text-[9px]
              font-semibold

              ${
                disturbanceActive
                  ? "text-amber-600"
                  : "text-emerald-600"
              }
            `}
          >

            {
              disturbanceActive
                ? `${brakingFollowerCount} reacting`
                : "Stable flow"
            }

          </span>

        </div>


        {/* ===============================================
            Compact chain
        ================================================ */}

        <div
          className="
            mt-2
            flex
            flex-wrap
            items-center
            gap-1
          "
        >

          <span
            className={`
              rounded
              px-1.5
              py-0.5
              text-[8px]
              font-bold

              ${
                isEgoBraking
                  ? `
                    bg-red-600
                    text-white
                  `
                  : `
                    bg-blue-600
                    text-white
                  `
              }
            `}
          >
            EGO
          </span>


          {
            followerVehicles.map(
              (
                item,
                index
              ) => {

                const acceleration =
                  Number(
                    item
                      .vehicle
                      ?.accelerationMps2
                  ) || 0;


                const reacting =
                  acceleration <
                  -0.15;


                return (

                  <React.Fragment
                    key={
                      `chain-${item.vehicle.id}`
                    }
                  >

                    <span
                      className="
                        text-[9px]
                        text-slate-300
                      "
                    >
                      →
                    </span>


                    <span
                      className={`
                        rounded
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-semibold

                        ${
                          reacting
                            ? `
                              bg-amber-500
                              text-white
                            `
                            : `
                              bg-white
                              text-slate-500
                              ring-1
                              ring-inset
                              ring-slate-200
                            `
                        }
                      `}
                    >
                      F{index + 1}
                    </span>

                  </React.Fragment>

                );

              }
            )
          }

        </div>


        {/* ===============================================
            Direction
        ================================================ */}

        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            gap-2
            border-t
            border-slate-200
            pt-1.5
          "
        >

          <span
            className="
              text-[8px]
              text-slate-400
            "
          >
            Vehicles
            {" "}
            <strong
              className="
                text-slate-600
              "
            >
              Forward →
            </strong>
          </span>


          <span
            className="
              text-[8px]
              text-slate-400
            "
          >
            Disturbance
            {" "}
            <strong
              className={
                disturbanceActive
                  ? "text-amber-600"
                  : "text-slate-500"
              }
            >
              ← Backward
            </strong>
          </span>

        </div>

      </div>

    </section>

  );

}