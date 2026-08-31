import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


// =========================================================
// Configuration
// =========================================================

// How often analytics history is sampled.
//
// We do NOT need one history point per animation frame.
// 0.5 s is visually smooth enough for teaching.
//
const HISTORY_SAMPLE_INTERVAL_S =
  0.5;


// Maximum number of history samples retained.
//
// 120 × 0.5 s = approximately 60 seconds.
//
const MAX_HISTORY_SAMPLES =
  120;


// Number of spatial cells used in the
// space-time speed diagram.
//
const SPACE_BIN_COUNT =
  48;


// =========================================================
// Utility
// =========================================================

function clamp(
  value,
  minimum,
  maximum
) {

  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );

}


// =========================================================
// Vehicle normalized speed
//
// r_i = v_i / v_desired_i
//
// 0 = stopped
// 1 = desired speed
// =========================================================

function getNormalizedSpeed(
  vehicle
) {

  const speedMps =
    Math.max(
      0,
      Number(
        vehicle?.speedMps
      ) || 0
    );


  const desiredSpeedMps =
    Math.max(
      0,
      Number(
        vehicle?.desiredSpeedMps
      ) || 0
    );


  if (
    desiredSpeedMps <=
      0.0001
  ) {

    return 0;

  }


  return clamp(
    speedMps /
      desiredSpeedMps,
    0,
    1
  );

}


// =========================================================
// Percentile
// =========================================================

function percentile(
  values,
  percentileValue
) {

  if (
    !Array.isArray(
      values
    ) ||
    values.length === 0
  ) {

    return 0;

  }


  const sortedValues =
    [
      ...values
    ].sort(
      (
        a,
        b
      ) =>
        a - b
    );


  if (
    sortedValues.length ===
      1
  ) {

    return sortedValues[0];

  }


  const index =
    (
      sortedValues.length -
      1
    ) *
    percentileValue;


  const lowerIndex =
    Math.floor(
      index
    );


  const upperIndex =
    Math.ceil(
      index
    );


  if (
    lowerIndex ===
      upperIndex
  ) {

    return sortedValues[
      lowerIndex
    ];

  }


  const fraction =
    index -
    lowerIndex;


  return (
    sortedValues[
      lowerIndex
    ] *
      (
        1 -
        fraction
      ) +
    sortedValues[
      upperIndex
    ] *
      fraction
  );

}


// =========================================================
// Speed color ramp
//
// Same conceptual ramp as TrafficMap.
//
// 0.00 = red
// 0.25 = orange
// 0.50 = yellow
// 0.75 = lime
// 1.00 = green
// =========================================================

function getSpeedColor(
  normalizedSpeed
) {

  const ratio =
    clamp(
      Number(
        normalizedSpeed
      ) || 0,
      0,
      1
    );


  const stops = [

    {
      value:
        0.00,

      color: [
        220,
        38,
        38
      ]
    },

    {
      value:
        0.25,

      color: [
        249,
        115,
        22
      ]
    },

    {
      value:
        0.50,

      color: [
        234,
        179,
        8
      ]
    },

    {
      value:
        0.75,

      color: [
        132,
        204,
        22
      ]
    },

    {
      value:
        1.00,

      color: [
        22,
        163,
        74
      ]
    }

  ];


  for (
    let i = 0;
    i <
      stops.length - 1;
    i += 1
  ) {

    const lower =
      stops[i];


    const upper =
      stops[
        i + 1
      ];


    if (
      ratio >=
        lower.value &&
      ratio <=
        upper.value
    ) {

      const localRatio =
        (
          ratio -
          lower.value
        ) /
        (
          upper.value -
          lower.value
        );


      const r =
        Math.round(
          lower.color[0] +
          (
            upper.color[0] -
            lower.color[0]
          ) *
          localRatio
        );


      const g =
        Math.round(
          lower.color[1] +
          (
            upper.color[1] -
            lower.color[1]
          ) *
          localRatio
        );


      const b =
        Math.round(
          lower.color[2] +
          (
            upper.color[2] -
            lower.color[2]
          ) *
          localRatio
        );


      return (
        `rgb(${r}, ${g}, ${b})`
      );

    }

  }


  return (
    "rgb(22, 163, 74)"
  );

}


// =========================================================
// Calculate traffic stability statistics
// =========================================================

function calculateTrafficStatistics(
  vehicles
) {

  const activeVehicles =
    Array.isArray(
      vehicles
    )
      ? vehicles.filter(
          vehicle =>
            vehicle &&
            !vehicle.finished
        )
      : [];


  if (
    activeVehicles.length ===
      0
  ) {

    return {

      count:
        0,

      meanRatio:
        0,

      standardDeviation:
        0,

      coefficientOfVariation:
        0,

      slowVehicleFraction:
        0,

      slowVehiclePercent:
        0,

      p10:
        0,

      p50:
        0,

      p90:
        0,

      waveAmplitude:
        0,

      waveAmplitudePercent:
        0,

    };

  }


  const normalizedSpeeds =
    activeVehicles.map(
      vehicle =>
        getNormalizedSpeed(
          vehicle
        )
    );


  // =======================================================
  // Mean normalized speed
  // =======================================================

  const meanRatio =
    normalizedSpeeds.reduce(
      (
        total,
        value
      ) =>
        total +
        value,
      0
    ) /
    normalizedSpeeds.length;


  // =======================================================
  // Standard deviation
  // =======================================================

  const variance =
    normalizedSpeeds.reduce(
      (
        total,
        value
      ) => {

        const difference =
          value -
          meanRatio;


        return (
          total +
          difference *
          difference
        );

      },
      0
    ) /
    normalizedSpeeds.length;


  const standardDeviation =
    Math.sqrt(
      variance
    );


  // =======================================================
  // Coefficient of variation
  //
  // CV = sigma / mean
  // =======================================================

  const coefficientOfVariation =
    meanRatio >
      0.0001
      ? (
          standardDeviation /
          meanRatio
        )
      : 0;


  // =======================================================
  // Slow vehicle fraction
  //
  // Teaching definition:
  //
  // vehicle speed <
  // 60% of its desired speed
  // =======================================================

  const slowVehicleCount =
    normalizedSpeeds.filter(
      value =>
        value <
        0.60
    ).length;


  const slowVehicleFraction =
    slowVehicleCount /
    normalizedSpeeds.length;


  // =======================================================
  // Percentiles
  // =======================================================

  const p10 =
    percentile(
      normalizedSpeeds,
      0.10
    );


  const p50 =
    percentile(
      normalizedSpeeds,
      0.50
    );


  const p90 =
    percentile(
      normalizedSpeeds,
      0.90
    );


  // =======================================================
  // Wave amplitude
  //
  // Difference between fast and slow portions
  // of the traffic stream.
  //
  // P90 - P10 is more robust than max - min.
  // =======================================================

  const waveAmplitude =
    Math.max(
      0,
      p90 -
      p10
    );


  return {

    count:
      activeVehicles.length,

    meanRatio,

    standardDeviation,

    coefficientOfVariation,

    slowVehicleFraction,

    slowVehiclePercent:
      slowVehicleFraction *
      100,

    p10,

    p50,

    p90,

    waveAmplitude,

    waveAmplitudePercent:
      waveAmplitude *
      100,

  };

}


// =========================================================
// Traffic state classification
//
// IMPORTANT:
//
// These thresholds are pedagogical thresholds
// for this interactive experiment.
//
// They are NOT universal traffic engineering constants.
// =========================================================

function classifyTrafficState(
  statistics
) {

  if (
    !statistics ||
    statistics.count ===
      0
  ) {

    return {

      key:
        "inactive",

      label:
        "NO TRAFFIC",

      description:
        "Start the simulation to observe traffic stability.",

      dotClass:
        "bg-slate-400",

      badgeClass:
        "border-slate-200 bg-slate-100 text-slate-600",

    };

  }


  const cv =
    statistics
      .coefficientOfVariation;


  const slowPercent =
    statistics
      .slowVehiclePercent;


  const amplitude =
    statistics
      .waveAmplitude;


  // =======================================================
  // Strong stop-and-go state
  // =======================================================

  if (
    (
      cv >=
        0.18 &&
      slowPercent >=
        10
    ) ||
    (
      amplitude >=
        0.55 &&
      slowPercent >=
        8
    )
  ) {

    return {

      key:
        "phantom",

      label:
        "PHANTOM CONGESTION",

      description:
        "Large speed differences indicate a self-sustaining stop-and-go traffic wave.",

      dotClass:
        "bg-red-500",

      badgeClass:
        "border-red-200 bg-red-50 text-red-700",

    };

  }


  // =======================================================
  // Disturbance developing
  // =======================================================

  if (
    cv >=
      0.07 ||
    slowPercent >=
      5 ||
    amplitude >=
      0.20
  ) {

    return {

      key:
        "developing",

      label:
        "DISTURBANCE DEVELOPING",

      description:
        "Vehicle speeds are diverging and the disturbance may amplify.",

      dotClass:
        "bg-amber-500",

      badgeClass:
        "border-amber-200 bg-amber-50 text-amber-700",

    };

  }


  // =======================================================
  // Stable traffic
  // =======================================================

  return {

    key:
      "stable",

    label:
      "STABLE TRAFFIC",

    description:
      "Vehicles are travelling at similar fractions of their desired speeds.",

    dotClass:
      "bg-emerald-500",

    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

  };

}


// =========================================================
// Convert active vehicle positions into spatial bins
// for the space-time speed diagram.
// =========================================================

function buildSpaceSnapshot(
  vehicles,
  loopLengthM
) {

  const safeLoopLengthM =
    Number(
      loopLengthM
    ) || 0;


  if (
    safeLoopLengthM <=
      0
  ) {

    return (
      new Array(
        SPACE_BIN_COUNT
      ).fill(
        null
      )
    );

  }


  const bins =
    new Array(
      SPACE_BIN_COUNT
    )
      .fill(
        null
      )
      .map(
        () => []
      );


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
                vehicle
                  .distanceAlongLaneM
              )
            )
        )
      : [];


  activeVehicles.forEach(
    vehicle => {

      const distanceM =
        (
          (
            Number(
              vehicle
                .distanceAlongLaneM
            ) %
            safeLoopLengthM
          ) +
          safeLoopLengthM
        ) %
        safeLoopLengthM;


      const normalizedPosition =
        distanceM /
        safeLoopLengthM;


      const binIndex =
        clamp(
          Math.floor(
            normalizedPosition *
            SPACE_BIN_COUNT
          ),
          0,
          SPACE_BIN_COUNT -
            1
        );


      bins[
        binIndex
      ].push(
        getNormalizedSpeed(
          vehicle
        )
      );

    }
  );


  return bins.map(
    values => {

      if (
        values.length ===
          0
      ) {

        return null;

      }


      return (
        values.reduce(
          (
            total,
            value
          ) =>
            total +
            value,
          0
        ) /
        values.length
      );

    }
  );

}


// =========================================================
// Metric bar
// =========================================================

function MetricBar({

  label,

  value,

  displayValue,

  description,

}) {

  const safeValue =
    clamp(
      Number(
        value
      ) || 0,
      0,
      1
    );


  let barClass =
    "bg-emerald-500";


  if (
    safeValue >=
      0.60
  ) {

    barClass =
      "bg-red-500";

  } else if (
    safeValue >=
      0.30
  ) {

    barClass =
      "bg-amber-500";

  }


  return (

    <div>

      <div
        className="
          flex
          items-end
          justify-between
          gap-2
        "
      >

        <div
          className="
            min-w-0
          "
        >

          <div
            className="
              text-[10px]
              font-medium
              text-slate-600
            "
          >
            {label}
          </div>


          <div
            className="
              mt-0.5
              text-[8px]
              leading-3
              text-slate-400
            "
          >
            {description}
          </div>

        </div>


        <div
          className="
            shrink-0
            text-xs
            font-semibold
            tabular-nums
            text-slate-800
          "
        >
          {displayValue}
        </div>

      </div>


      <div
        className="
          mt-1.5
          h-1.5
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
            duration-300

            ${barClass}
          `}
          style={{
            width:
              `${
                safeValue *
                100
              }%`
          }}
        />

      </div>

    </div>

  );

}


// =========================================================
// Traffic Stability History Chart
//
// P90 / P50 / P10
//
// Stable traffic:
// lines remain close.
//
// Unstable traffic:
// lines separate.
// =========================================================

function StabilityHistoryChart({

  history

}) {

  const width =
    320;


  const height =
    122;


  const plotLeft =
    30;


  const plotRight =
    8;


  const plotTop =
    8;


  const plotBottom =
    22;


  const plotWidth =
    width -
    plotLeft -
    plotRight;


  const plotHeight =
    height -
    plotTop -
    plotBottom;


  const safeHistory =
    Array.isArray(
      history
    )
      ? history
      : [];


  const buildPath =
    key => {

      if (
        safeHistory.length ===
          0
      ) {

        return "";

      }


      return safeHistory
        .map(
          (
            sample,
            index
          ) => {

            const fractionX =
              safeHistory.length >
                1
                ? (
                    index /
                    (
                      safeHistory.length -
                      1
                    )
                  )
                : 0;


            const x =
              plotLeft +
              fractionX *
              plotWidth;


            const value =
              clamp(
                Number(
                  sample[
                    key
                  ]
                ) || 0,
                0,
                1
              );


            const y =
              plotTop +
              (
                1 -
                value
              ) *
              plotHeight;


            return (
              `${
                index ===
                  0
                  ? "M"
                  : "L"
              } ${x} ${y}`
            );

          }
        )
        .join(
          " "
        );

    };


  const p90Path =
    buildPath(
      "p90"
    );


  const p50Path =
    buildPath(
      "p50"
    );


  const p10Path =
    buildPath(
      "p10"
    );


  const firstTime =
    safeHistory.length >
      0
      ? safeHistory[0]
          .time
      : 0;


  const lastTime =
    safeHistory.length >
      0
      ? safeHistory[
          safeHistory.length -
            1
        ].time
      : 0;


  return (

    <div
      className="
        rounded-md
        border
        border-slate-200
        bg-white
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

        <div>

          <div
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-600
            "
          >
            Speed Stability History
          </div>


          <div
            className="
              mt-0.5
              text-[8px]
              text-slate-400
            "
          >
            P10 / median / P90 normalized speed
          </div>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
            text-[8px]
          "
        >

          <span
            className="
              font-medium
              text-emerald-600
            "
          >
            P90
          </span>


          <span
            className="
              font-medium
              text-blue-600
            "
          >
            P50
          </span>


          <span
            className="
              font-medium
              text-red-600
            "
          >
            P10
          </span>

        </div>

      </div>


      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="
          mt-1
          block
          h-auto
          w-full
        "
        role="img"
        aria-label="Traffic speed stability history"
      >

        {/* -----------------------------------------------
            Grid lines
        ------------------------------------------------ */}

        {
          [
            0,
            0.5,
            1
          ].map(
            value => {

              const y =
                plotTop +
                (
                  1 -
                  value
                ) *
                plotHeight;


              return (

                <g
                  key={
                    value
                  }
                >

                  <line
                    x1={
                      plotLeft
                    }

                    x2={
                      width -
                      plotRight
                    }

                    y1={
                      y
                    }

                    y2={
                      y
                    }

                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />


                  <text
                    x={
                      plotLeft -
                      5
                    }

                    y={
                      y +
                      3
                    }

                    textAnchor="end"
                    fontSize="7"
                    fill="#94a3b8"
                  >
                    {
                      Math.round(
                        value *
                        100
                      )
                    }%
                  </text>

                </g>

              );

            }
          )
        }


        {/* -----------------------------------------------
            P90
        ------------------------------------------------ */}

        {
          p90Path && (

            <path
              d={
                p90Path
              }

              fill="none"

              stroke="#16a34a"

              strokeWidth="1.8"

              strokeLinecap="round"

              strokeLinejoin="round"
            />

          )
        }


        {/* -----------------------------------------------
            Median
        ------------------------------------------------ */}

        {
          p50Path && (

            <path
              d={
                p50Path
              }

              fill="none"

              stroke="#2563eb"

              strokeWidth="2"

              strokeLinecap="round"

              strokeLinejoin="round"
            />

          )
        }


        {/* -----------------------------------------------
            P10
        ------------------------------------------------ */}

        {
          p10Path && (

            <path
              d={
                p10Path
              }

              fill="none"

              stroke="#dc2626"

              strokeWidth="1.8"

              strokeLinecap="round"

              strokeLinejoin="round"
            />

          )
        }


        {/* -----------------------------------------------
            Time axis
        ------------------------------------------------ */}

        <text
          x={
            plotLeft
          }

          y={
            height -
            5
          }

          fontSize="7"

          fill="#94a3b8"
        >
          {
            firstTime.toFixed(
              0
            )
          } s
        </text>


        <text
          x={
            width -
            plotRight
          }

          y={
            height -
            5
          }

          textAnchor="end"

          fontSize="7"

          fill="#94a3b8"
        >
          {
            lastTime.toFixed(
              0
            )
          } s
        </text>

      </svg>

    </div>

  );

}


// =========================================================
// Space-Time Speed Diagram
//
// Horizontal = location around loop
// Vertical   = time
// Color      = normalized vehicle speed
//
// Newest time is at the bottom.
//
// A diagonal red/orange band indicates propagation
// of congestion through space and time.
// =========================================================

function SpaceTimeSpeedDiagram({

  history,

  loopLengthM

}) {

  const visibleHistory =
    Array.isArray(
      history
    )
      ? history.slice(
          -60
        )
      : [];


  const rowCount =
    Math.max(
      visibleHistory.length,
      1
    );


  const width =
    320;


  const height =
    130;


  const plotLeft =
    30;


  const plotRight =
    8;


  const plotTop =
    8;


  const plotBottom =
    20;


  const plotWidth =
    width -
    plotLeft -
    plotRight;


  const plotHeight =
    height -
    plotTop -
    plotBottom;


  const cellWidth =
    plotWidth /
    SPACE_BIN_COUNT;


  const cellHeight =
    plotHeight /
    rowCount;


  const loopLengthKm =
    (
      Number(
        loopLengthM
      ) || 0
    ) /
    1000;


  return (

    <div
      className="
        rounded-md
        border
        border-slate-200
        bg-white
        p-2
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-2
        "
      >

        <div>

          <div
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-600
            "
          >
            Space–Time Speed Diagram
          </div>


          <div
            className="
              mt-0.5
              text-[8px]
              text-slate-400
            "
          >
            Watch for diagonal low-speed bands
          </div>

        </div>


        <div
          className="
            text-right
            text-[8px]
            leading-3
            text-slate-400
          "
        >
          <div>
            time ↓
          </div>

          <div>
            position →
          </div>
        </div>

      </div>


      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="
          mt-1
          block
          h-auto
          w-full
        "
        role="img"
        aria-label="Space-time speed diagram"
      >

        {/* -----------------------------------------------
            Empty plot background
        ------------------------------------------------ */}

        <rect
          x={
            plotLeft
          }

          y={
            plotTop
          }

          width={
            plotWidth
          }

          height={
            plotHeight
          }

          fill="#f8fafc"

          stroke="#e2e8f0"

          strokeWidth="1"
        />


        {/* -----------------------------------------------
            Heat map cells
        ------------------------------------------------ */}

        {
          visibleHistory.map(
            (
              sample,
              rowIndex
            ) => {

              const values =
                Array.isArray(
                  sample.spaceBins
                )
                  ? sample.spaceBins
                  : [];


              return values.map(
                (
                  value,
                  columnIndex
                ) => {

                  if (
                    value == null
                  ) {

                    return null;

                  }


                  return (

                    <rect
                      key={
                        `${
                          sample.time
                        }-${
                          columnIndex
                        }`
                      }

                      x={
                        plotLeft +
                        columnIndex *
                        cellWidth
                      }

                      y={
                        plotTop +
                        rowIndex *
                        cellHeight
                      }

                      width={
                        cellWidth +
                        0.4
                      }

                      height={
                        cellHeight +
                        0.4
                      }

                      fill={
                        getSpeedColor(
                          value
                        )
                      }
                    />

                  );

                }
              );

            }
          )
        }


        {/* -----------------------------------------------
            Axis labels
        ------------------------------------------------ */}

        <text
          x={
            plotLeft
          }

          y={
            height -
            5
          }

          fontSize="7"

          fill="#94a3b8"
        >
          0 km
        </text>


        <text
          x={
            width -
            plotRight
          }

          y={
            height -
            5
          }

          textAnchor="end"

          fontSize="7"

          fill="#94a3b8"
        >
          {
            loopLengthKm.toFixed(
              1
            )
          } km
        </text>

      </svg>


      {/* -----------------------------------------------
          Color legend
      ------------------------------------------------ */}

      <div
        className="
          mt-1
          flex
          items-center
          gap-2
        "
      >

        <span
          className="
            shrink-0
            text-[7px]
            text-slate-400
          "
        >
          stopped
        </span>


        <div
          className="
            h-1.5
            flex-1
            rounded-full
          "
          style={{
            background:
              "linear-gradient(to right, rgb(220,38,38), rgb(249,115,22), rgb(234,179,8), rgb(132,204,22), rgb(22,163,74))"
          }}
        />


        <span
          className="
            shrink-0
            text-[7px]
            text-slate-400
          "
        >
          desired speed
        </span>

      </div>

    </div>

  );

}


// =========================================================
// Main Component
// =========================================================

export default function MetricsStability({

  vehicles = [],

  loopLengthM = 0,

  simulationTimeS = 0,

  isRunning = false,

  t = null,

}) {

  // =======================================================
  // Current statistics
  // =======================================================

  const statistics =
    useMemo(
      () => {

        return (
          calculateTrafficStatistics(
            vehicles
          )
        );

      },
      [
        vehicles
      ]
    );


  const trafficState =
    useMemo(
      () => {

        return (
          classifyTrafficState(
            statistics
          )
        );

      },
      [
        statistics
      ]
    );


  // =======================================================
  // Analytics history
  // =======================================================

  const [
    history,
    setHistory
  ] =
    useState(
      []
    );


  const lastSampleTimeRef =
    useRef(
      -Infinity
    );


  const previousSimulationTimeRef =
    useRef(
      0
    );


  // =======================================================
  // Detect reset / new experiment
  // =======================================================

  useEffect(
    () => {

      const currentTime =
        Math.max(
          0,
          Number(
            simulationTimeS
          ) || 0
        );


      const previousTime =
        previousSimulationTimeRef
          .current;


      const simulationRestarted =
        currentTime <
        previousTime;


      const noVehicles =
        !Array.isArray(
          vehicles
        ) ||
        vehicles.length ===
          0;


      if (
        simulationRestarted ||
        noVehicles
      ) {

        setHistory(
          []
        );


        lastSampleTimeRef.current =
          -Infinity;

      }


      previousSimulationTimeRef.current =
        currentTime;

    },
    [
      simulationTimeS,
      vehicles
    ]
  );


  // =======================================================
  // Sample history
  // =======================================================

  useEffect(
    () => {

      if (
        !isRunning
      ) {

        return;

      }


      if (
        statistics.count ===
          0
      ) {

        return;

      }


      const currentTime =
        Math.max(
          0,
          Number(
            simulationTimeS
          ) || 0
        );


      const elapsedSinceLastSample =
        currentTime -
        lastSampleTimeRef
          .current;


      if (
        elapsedSinceLastSample <
        HISTORY_SAMPLE_INTERVAL_S
      ) {

        return;

      }


      lastSampleTimeRef.current =
        currentTime;


      const newSample = {

        time:
          currentTime,

        p10:
          statistics.p10,

        p50:
          statistics.p50,

        p90:
          statistics.p90,

        meanRatio:
          statistics.meanRatio,

        coefficientOfVariation:
          statistics
            .coefficientOfVariation,

        slowVehiclePercent:
          statistics
            .slowVehiclePercent,

        waveAmplitude:
          statistics
            .waveAmplitude,

        spaceBins:
          buildSpaceSnapshot(
            vehicles,
            loopLengthM
          ),

      };


      setHistory(
        currentHistory => {

          const nextHistory = [
            ...currentHistory,
            newSample
          ];


          if (
            nextHistory.length >
              MAX_HISTORY_SAMPLES
          ) {

            return nextHistory.slice(
              -MAX_HISTORY_SAMPLES
            );

          }


          return nextHistory;

        }
      );

    },
    [
      isRunning,
      loopLengthM,
      simulationTimeS,
      statistics,
      vehicles
    ]
  );


  // =======================================================
  // Dashboard metrics normalized for display bars
  // =======================================================

  const cvDisplayScale =
    clamp(
      statistics
        .coefficientOfVariation /
        0.30,
      0,
      1
    );


  const slowDisplayScale =
    clamp(
      statistics
        .slowVehicleFraction /
        0.40,
      0,
      1
    );


  const amplitudeDisplayScale =
    clamp(
      statistics
        .waveAmplitude,
      0,
      1
    );


  // =======================================================
  // Render
  // =======================================================

  return (

    <section
      className="
        min-w-0
        rounded-md
        border
        border-slate-200
        bg-slate-50
        p-3
      "
    >

      {/* =================================================
          Header
      ================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div
          className="
            min-w-0
          "
        >

          <div
            className="
              text-xs
              font-semibold
              text-slate-700
            "
          >
            {
              t?.trafficStability ??
              "Traffic Stability"
            }
          </div>


          <p
            className="
              mt-1
              text-[9px]
              leading-3
              text-slate-400
            "
          >
            Speed differences reveal whether a disturbance
            is dissipating or growing into a traffic wave.
          </p>

        </div>


        <div
          className={`
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            px-2
            py-1
            text-[8px]
            font-bold
            tracking-wide

            ${
              trafficState
                .badgeClass
            }
          `}
        >

          <span
            className={`
              h-2
              w-2
              rounded-full

              ${
                trafficState
                  .dotClass
              }
            `}
          />


          {
            trafficState
              .label
          }

        </div>

      </div>


      {/* =================================================
          State explanation
      ================================================== */}

      <div
        className="
          mt-2
          rounded-md
          border
          border-slate-200
          bg-white
          px-2.5
          py-2
          text-[9px]
          leading-3
          text-slate-500
        "
      >
        {
          trafficState
            .description
        }
      </div>


      {/* =================================================
          Three Stability Metrics
      ================================================== */}

      <div
        className="
          mt-3
          grid
          gap-3
        "
      >

        <MetricBar

          label="Speed Variability"

          value={
            cvDisplayScale
          }

          displayValue={
            statistics.count >
              0
              ? statistics
                  .coefficientOfVariation
                  .toFixed(
                    2
                  )
              : "0.00"
          }

          description="CV of normalized vehicle speeds"

        />


        <MetricBar

          label="Slow Vehicles"

          value={
            slowDisplayScale
          }

          displayValue={
            `${
              statistics
                .slowVehiclePercent
                .toFixed(
                  0
                )
            }%`
          }

          description="< 60% of each vehicle's desired speed"

        />


        <MetricBar

          label="Traffic Wave Amplitude"

          value={
            amplitudeDisplayScale
          }

          displayValue={
            `${
              statistics
                .waveAmplitudePercent
                .toFixed(
                  0
                )
            }%`
          }

          description="P90 − P10 normalized speed"

        />

      </div>


      {/* =================================================
          Key teaching relationship
      ================================================== */}

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          gap-2
          rounded-md
          bg-slate-100
          px-2.5
          py-1.5
          text-[8px]
          text-slate-500
        "
      >

        <span>
          Similar speeds
        </span>


        <span
          className="
            font-semibold
            text-emerald-600
          "
        >
          STABLE
        </span>


        <span>
          →
        </span>


        <span
          className="
            font-semibold
            text-red-600
          "
        >
          UNSTABLE
        </span>


        <span>
          Large speed differences
        </span>

      </div>


      {/* =================================================
          Stability History
      ================================================== */}

      <div
        className="
          mt-3
        "
      >

        <StabilityHistoryChart

          history={
            history
          }

        />

      </div>


      {/* =================================================
          Space-Time Speed Diagram
      ================================================== */}

      <div
        className="
          mt-3
        "
      >

        <SpaceTimeSpeedDiagram

          history={
            history
          }

          loopLengthM={
            loopLengthM
          }

        />

      </div>


      {/* =================================================
          Small teaching footer
      ================================================== */}

      <div
        className="
          mt-2
          text-[8px]
          leading-3
          text-slate-400
        "
      >

        Demo thresholds classify traffic stability for this
        experiment; they are not universal traffic-flow
        constants.

      </div>

    </section>

  );

}