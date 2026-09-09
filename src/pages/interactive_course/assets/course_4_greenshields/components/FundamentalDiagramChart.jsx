import React, {
  useMemo,
} from "react";


// =========================================================
// FundamentalDiagramChart
//
// Displays:
//
// 1. Theoretical Greenshields flow-density relationship
//
//      q = k * vf * (1 - k / kj)
//
// 2. Current microscopic simulation state
//
//      x = observed density
//      y = density * average speed
//
// 3. Capacity point
//
//      kc = kj / 2
//      qmax = vf * kj / 4
//
// =========================================================

export default function FundamentalDiagramChart({

  // Current density measured from simulation
  // veh/km
  density = 0,

  // Current average vehicle speed
  // km/h
  averageSpeed = 0,

  // Student-selected free-flow speed
  // km/h
  freeFlowSpeed = 50,

  // Greenshields jam density
  // veh/km
  jamDensity = 150,

  // Translation object
  t = {},

}) {


  // =======================================================
  // SVG dimensions
  // =======================================================

  const width =
    320;

  const height =
    210;


  const margin = {
    top: 24,
    right: 15,
    bottom: 42,
    left: 52,
  };


  const plotWidth =
    width -
    margin.left -
    margin.right;


  const plotHeight =
    height -
    margin.top -
    margin.bottom;


  // =======================================================
  // Greenshields capacity
  //
  // kc = kj / 2
  //
  // qmax = vf * kj / 4
  // =======================================================

  const criticalDensity =
    jamDensity / 2;


  const capacity =
    (
      freeFlowSpeed *
      jamDensity
    ) / 4;


  // =======================================================
  // Generate theoretical fundamental diagram
  //
  // q(k) = k * vf * (1 - k / kj)
  // =======================================================

  const theoreticalData =
    useMemo(() => {

      const points =
        [];

      const numberOfPoints =
        80;


      for (
        let i = 0;
        i <= numberOfPoints;
        i += 1
      ) {

        const k =
          (
            i /
            numberOfPoints
          ) *
          jamDensity;


        const speed =
          freeFlowSpeed *
          (
            1 -
            k /
            jamDensity
          );


        const q =
          k *
          Math.max(
            0,
            speed
          );


        points.push({
          density: k,
          flow: q,
        });

      }


      return points;

    }, [
      freeFlowSpeed,
      jamDensity,
    ]);


  // =======================================================
  // Coordinate conversion
  // =======================================================

  const densityToX = (
    densityValue
  ) => {

    return (
      margin.left +
      (
        densityValue /
        jamDensity
      ) *
      plotWidth
    );

  };


  const flowToY = (
    flowValue
  ) => {

    const maxFlow =
      Math.max(
        capacity,
        1
      );


    return (
      margin.top +
      plotHeight -
      (
        flowValue /
        maxFlow
      ) *
      plotHeight
    );

  };


  // =======================================================
  // Build SVG path
  // =======================================================

  const theoreticalPath =
    theoreticalData
      .map(
        (
          point,
          index
        ) => {

          const x =
            densityToX(
              point.density
            );


          const y =
            flowToY(
              point.flow
            );


          return (
            index === 0
              ? `M ${x} ${y}`
              : `L ${x} ${y}`
          );

        }
      )
      .join(" ");


  // =======================================================
  // Current simulation state
  //
  // q = k * v
  // =======================================================

  const simulationDensity =
    Math.max(
      0,
      Math.min(
        density,
        jamDensity
      )
    );


  const simulationFlow =
    Math.max(
      0,
      simulationDensity *
      averageSpeed
    );


  // Prevent point from leaving plot
  const displaySimulationFlow =
    Math.min(
      simulationFlow,
      capacity
    );


  const simulationX =
    densityToX(
      simulationDensity
    );


  const simulationY =
    flowToY(
      displaySimulationFlow
    );


  // =======================================================
  // Capacity point
  // =======================================================

  const capacityX =
    densityToX(
      criticalDensity
    );


  const capacityY =
    flowToY(
      capacity
    );


  // =======================================================
  // Axis ticks
  // =======================================================

  const densityTicks = [
    0,
    jamDensity * 0.25,
    jamDensity * 0.5,
    jamDensity * 0.75,
    jamDensity,
  ];


  const flowTicks = [
    0,
    capacity * 0.25,
    capacity * 0.5,
    capacity * 0.75,
    capacity,
  ];


  // =======================================================
  // Render
  // =======================================================

  return (

    <div
      className="
        w-full
        min-w-0
      "
    >

      {/* =================================================
          Chart title
      ================================================== */}

      <div
        className="
          mb-2
          text-xs
          font-semibold
          text-slate-700
        "
      >

        {
          t.fundamentalDiagram ??
          "The Fundamental Diagram"
        }

      </div>


      {/* =================================================
          SVG
      ================================================== */}

      <svg
        viewBox={
          `0 0 ${width} ${height}`
        }
        className="
          h-auto
          w-full
          overflow-visible
        "
        role="img"
        aria-label={
          t.fundamentalDiagram ??
          "Traffic flow fundamental diagram"
        }
      >

        {/* ===============================================
            Horizontal grid lines
        ================================================ */}

        {
          flowTicks.map(
            (
              tick,
              index
            ) => {

              const y =
                flowToY(
                  tick
                );


              return (

                <g
                  key={
                    `flow-${index}`
                  }
                >

                  <line
                    x1={
                      margin.left
                    }
                    x2={
                      margin.left +
                      plotWidth
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
                      margin.left - 7
                    }
                    y={
                      y + 3
                    }
                    textAnchor="end"
                    fontSize="9"
                    fill="#64748b"
                  >
                    {
                      tick.toFixed(
                        0
                      )
                    }
                  </text>

                </g>

              );

            }
          )
        }


        {/* ===============================================
            Vertical grid lines
        ================================================ */}

        {
          densityTicks.map(
            (
              tick,
              index
            ) => {

              const x =
                densityToX(
                  tick
                );


              return (

                <g
                  key={
                    `density-${index}`
                  }
                >

                  <line
                    x1={
                      x
                    }
                    x2={
                      x
                    }
                    y1={
                      margin.top
                    }
                    y2={
                      margin.top +
                      plotHeight
                    }
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />


                  <text
                    x={
                      x
                    }
                    y={
                      margin.top +
                      plotHeight +
                      16
                    }
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748b"
                  >
                    {
                      tick.toFixed(
                        0
                      )
                    }
                  </text>

                </g>

              );

            }
          )
        }


        {/* ===============================================
            X axis
        ================================================ */}

        <line
          x1={
            margin.left
          }
          x2={
            margin.left +
            plotWidth
          }
          y1={
            margin.top +
            plotHeight
          }
          y2={
            margin.top +
            plotHeight
          }
          stroke="#475569"
          strokeWidth="1.5"
        />


        {/* ===============================================
            Y axis
        ================================================ */}

        <line
          x1={
            margin.left
          }
          x2={
            margin.left
          }
          y1={
            margin.top
          }
          y2={
            margin.top +
            plotHeight
          }
          stroke="#475569"
          strokeWidth="1.5"
        />


        {/* ===============================================
            Theoretical Greenshields curve
        ================================================ */}

        <path
          d={
            theoreticalPath
          }
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />


        {/* ===============================================
            Critical density / capacity guide
        ================================================ */}

        <line
          x1={
            capacityX
          }
          x2={
            capacityX
          }
          y1={
            capacityY
          }
          y2={
            margin.top +
            plotHeight
          }
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="4 3"
        />


        {/* ===============================================
            Capacity point
        ================================================ */}

        <circle
          cx={
            capacityX
          }
          cy={
            capacityY
          }
          r="4.5"
          fill="#eab308"
          stroke="white"
          strokeWidth="2"
        />


        <text
          x={
            capacityX
          }
          y={
            capacityY - 9
          }
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="600"
          fill="#854d0e"
        >
          Capacity
        </text>


        {/* ===============================================
            Free-flow label
        ================================================ */}

        <text
          x={
            densityToX(
              jamDensity * 0.22
            )
          }
          y={
            flowToY(
              capacity * 0.48
            ) - 8
          }
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#15803d"
        >
          Free flow
        </text>


        {/* ===============================================
            Congestion label
        ================================================ */}

        <text
          x={
            densityToX(
              jamDensity * 0.80
            )
          }
          y={
            flowToY(
              capacity * 0.48
            ) - 8
          }
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#dc2626"
        >
          Congestion
        </text>


        {/* ===============================================
            Current simulation point
        ================================================ */}

        {
          density > 0 && (

            <g>

              {/* horizontal guide */}

              <line
                x1={
                  margin.left
                }
                x2={
                  simulationX
                }
                y1={
                  simulationY
                }
                y2={
                  simulationY
                }
                stroke="#f97316"
                strokeWidth="1"
                strokeDasharray="4 3"
              />


              {/* vertical guide */}

              <line
                x1={
                  simulationX
                }
                x2={
                  simulationX
                }
                y1={
                  simulationY
                }
                y2={
                  margin.top +
                  plotHeight
                }
                stroke="#f97316"
                strokeWidth="1"
                strokeDasharray="4 3"
              />


              {/* simulation point */}

              <circle
                cx={
                  simulationX
                }
                cy={
                  simulationY
                }
                r="5"
                fill="#f97316"
                stroke="white"
                strokeWidth="2"
              />


              {/* simulation value */}

              <text
                x={
                  simulationX
                }
                y={
                  simulationY - 10
                }
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="#c2410c"
              >

                {
                  `${density.toFixed(
                    0
                  )}, ${simulationFlow.toFixed(
                    0
                  )}`
                }

              </text>

            </g>

          )
        }


        {/* ===============================================
            X-axis label
        ================================================ */}

        <text
          x={
            margin.left +
            plotWidth / 2
          }
          y={
            height - 5
          }
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="#475569"
        >

          {
            t.density ??
            "Density"
          }
          {" "}
          (veh/km)

        </text>


        {/* ===============================================
            Y-axis label
        ================================================ */}

        <text
          transform={`
            translate(
              12
              ${
                margin.top +
                plotHeight / 2
              }
            )
            rotate(-90)
          `}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="#475569"
        >

          {
            t.trafficFlow ??
            "Flow"
          }
          {" "}
          (veh/h)

        </text>

      </svg>


      {/* =================================================
          Legend
      ================================================== */}

      <div
        className="
          mt-1
          flex
          flex-wrap
          items-center
          gap-x-4
          gap-y-1
          text-[10px]
          text-slate-500
        "
      >

        <div
          className="
            flex
            items-center
            gap-1.5
          "
        >

          <span
            className="
              h-[2px]
              w-5
              bg-blue-600
            "
          />

          <span>
            {
              t.greenshieldsModel ??
              "Greenshields model"
            }
          </span>

        </div>


        <div
          className="
            flex
            items-center
            gap-1.5
          "
        >

          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-orange-500
            "
          />

          <span>
            {
              t.currentSimulation ??
              "Current simulation"
            }
          </span>

        </div>

      </div>

    </div>

  );

}