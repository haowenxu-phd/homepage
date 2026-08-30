import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


import text
  from "./assets/course_6_phantomcongestion/trans/course.json";


import SpeedDensityChart
  from "./assets/course_6_phantomcongestion/components/SpeedDensityChart";


import laneCenterlines
  from "./assets/course_6_phantomcongestion/data/cpark_lane_centerlines.json";


import routingGraph
  from "./assets/course_6_phantomcongestion/data/cpark_lane_centerlines_graph.json";


import TrafficMap
  from "./assets/course_6_phantomcongestion/components/TrafficMap";


import TrafficWavePanel
  from "./assets/course_6_phantomcongestion/components/TrafficWavePanel";


import {
  Vehicle
} from "./assets/course_6_phantomcongestion/simulation/vehicle";


import {
  moveVehicle
} from "./assets/course_6_phantomcongestion/simulation/laneMovement";


import {
  buildLaneIndex
} from "./assets/course_6_phantomcongestion/simulation/laneIndex";


import {
  findLeader
} from "./assets/course_6_phantomcongestion/simulation/leaderDetection";


import {
  updateVehicleSpeed
} from "./assets/course_6_phantomcongestion/simulation/carFollowing";


// =========================================================
// Constants
// =========================================================

const LOOP_LANE_ID =
  "lane_0042";


const EGO_VEHICLE_ID =
  "loop_vehicle_030";


const EGO_BRAKE_DECELERATION_MPS2 =
  3.0;


// =========================================================
// Distance between two lon/lat coordinates
// =========================================================

function haversineDistanceM(
  coordinateA,
  coordinateB
) {

  if (
    !coordinateA ||
    !coordinateB
  ) {

    return 0;

  }


  const [
    lon1,
    lat1
  ] =
    coordinateA;


  const [
    lon2,
    lat2
  ] =
    coordinateB;


  const earthRadiusM =
    6371000;


  const toRadians =
    degrees =>
      degrees *
      Math.PI /
      180;


  const phi1 =
    toRadians(
      lat1
    );


  const phi2 =
    toRadians(
      lat2
    );


  const deltaPhi =
    toRadians(
      lat2 -
      lat1
    );


  const deltaLambda =
    toRadians(
      lon2 -
      lon1
    );


  const a =
    Math.sin(
      deltaPhi / 2
    ) ** 2 +
    Math.cos(
      phi1
    ) *
    Math.cos(
      phi2
    ) *
    Math.sin(
      deltaLambda / 2
    ) ** 2;


  const c =
    2 *
    Math.atan2(
      Math.sqrt(
        a
      ),
      Math.sqrt(
        1 - a
      )
    );


  return (
    earthRadiusM *
    c
  );

}


// =========================================================
// Convert lon/lat coordinates to local XY coordinates
// in metres.
// =========================================================

function lonLatToLocalXY(
  coordinates
) {

  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length === 0
  ) {

    return [];

  }


  const [
    originLon,
    originLat
  ] =
    coordinates[0];


  const metersPerDegreeLatitude =
    111320;


  const metersPerDegreeLongitude =
    111320 *
    Math.cos(
      originLat *
      Math.PI /
      180
    );


  return coordinates.map(
    coordinate => {

      const [
        lon,
        lat
      ] =
        coordinate;


      const x =
        (
          lon -
          originLon
        ) *
        metersPerDegreeLongitude;


      const y =
        (
          lat -
          originLat
        ) *
        metersPerDegreeLatitude;


      return [
        x,
        y
      ];

    }
  );

}


// =========================================================
// Get closed-loop coordinates
// =========================================================

function getLoopCoordinates(
  laneGeoJSON,
  laneId
) {

  const feature =
    laneGeoJSON?.features?.find(
      item => {

        const featureLaneId =
          item?.properties?.lane_id ??
          item?.id;


        return (
          featureLaneId ===
          laneId
        );

      }
    );


  if (
    !feature
  ) {

    throw new Error(
      `Lane "${laneId}" not found in GeoJSON.`
    );

  }


  if (
    feature?.geometry?.type !==
    "LineString"
  ) {

    throw new Error(
      `Lane "${laneId}" is not a LineString.`
    );

  }


  let coordinates =
    feature?.geometry?.coordinates;


  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length < 3
  ) {

    throw new Error(
      `Lane "${laneId}" has invalid geometry.`
    );

  }


  coordinates =
    coordinates.map(
      coordinate => [
        Number(
          coordinate[0]
        ),
        Number(
          coordinate[1]
        ),
      ]
    );


  // =======================================================
  // Ensure that the LineString is physically closed
  // =======================================================

  const first =
    coordinates[0];


  const last =
    coordinates[
      coordinates.length - 1
    ];


  const closingGapM =
    haversineDistanceM(
      first,
      last
    );


  if (
    closingGapM >
    0.5
  ) {

    coordinates.push(
      [
        first[0],
        first[1]
      ]
    );

  }


  return coordinates;

}


// =========================================================
// Build cumulative distances along the loop
// =========================================================

function buildCumulativeDistances(
  coordinates
) {

  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length < 2
  ) {

    return {

      cumulativeDistances:
        [0],

      totalDistanceM:
        0,

    };

  }


  const cumulativeDistances =
    [0];


  let totalDistanceM =
    0;


  for (
    let i = 1;
    i < coordinates.length;
    i++
  ) {

    const segmentLengthM =
      haversineDistanceM(
        coordinates[
          i - 1
        ],
        coordinates[
          i
        ]
      );


    totalDistanceM +=
      segmentLengthM;


    cumulativeDistances.push(
      totalDistanceM
    );

  }


  return {

    cumulativeDistances,

    totalDistanceM,

  };

}


// =========================================================
// Find a position at a physical distance along the loop
// =========================================================

function getPositionAtDistance({
  coordinates,
  cumulativeDistances,
  targetDistanceM,
}) {

  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length < 2
  ) {

    return null;

  }


  for (
    let i = 0;
    i <
      cumulativeDistances.length - 1;
    i++
  ) {

    const segmentStartDistanceM =
      cumulativeDistances[i];


    const segmentEndDistanceM =
      cumulativeDistances[
        i + 1
      ];


    if (
      targetDistanceM >=
        segmentStartDistanceM &&
      targetDistanceM <=
        segmentEndDistanceM
    ) {

      const segmentLengthM =
        segmentEndDistanceM -
        segmentStartDistanceM;


      const fraction =
        segmentLengthM > 0
          ? (
              (
                targetDistanceM -
                segmentStartDistanceM
              ) /
              segmentLengthM
            )
          : 0;


      const [
        startLon,
        startLat
      ] =
        coordinates[i];


      const [
        endLon,
        endLat
      ] =
        coordinates[
          i + 1
        ];


      const lon =
        startLon +
        fraction *
        (
          endLon -
          startLon
        );


      const lat =
        startLat +
        fraction *
        (
          endLat -
          startLat
        );


      return {

        segmentIndex:
          i,

        distanceAlongSegmentM:
          fraction *
          segmentLengthM,

        distanceAlongLaneM:
          targetDistanceM,

        lon,

        lat,

      };

    }

  }


  return {

    segmentIndex:
      0,

    distanceAlongSegmentM:
      0,

    distanceAlongLaneM:
      0,

    lon:
      coordinates[0][0],

    lat:
      coordinates[0][1],

  };

}


// =========================================================
// Get XY position and heading
// =========================================================

function getXYAtPosition({
  geometryXY,
  segmentIndex,
  distanceAlongSegmentM,
}) {

  const startXY =
    geometryXY[
      segmentIndex
    ];


  const endXY =
    geometryXY[
      segmentIndex + 1
    ];


  if (
    !startXY ||
    !endXY
  ) {

    return {

      x:
        geometryXY?.[0]?.[0] ??
        0,

      y:
        geometryXY?.[0]?.[1] ??
        0,

      headingRad:
        0,

      headingDeg:
        0,

    };

  }


  const dx =
    endXY[0] -
    startXY[0];


  const dy =
    endXY[1] -
    startXY[1];


  const segmentLengthM =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  const fraction =
    segmentLengthM > 0
      ? Math.min(
          Math.max(
            distanceAlongSegmentM /
              segmentLengthM,
            0
          ),
          1
        )
      : 0;


  const x =
    startXY[0] +
    fraction *
    dx;


  const y =
    startXY[1] +
    fraction *
    dy;


  const headingRad =
    Math.atan2(
      dy,
      dx
    );


  const headingDeg =
    headingRad *
    180 /
    Math.PI;


  return {

    x,

    y,

    headingRad,

    headingDeg,

  };

}


// =========================================================
// Create vehicles evenly distributed around the loop
// =========================================================

function createEvenlyDistributedLoopVehicles({
  numberOfVehicles,
  laneId,
  routingGraph,
  laneGeoJSON,
  speedLimitKmh,
}) {

  if (
    !Number.isFinite(
      numberOfVehicles
    ) ||
    numberOfVehicles <= 0
  ) {

    return [];

  }


  const coordinates =
    getLoopCoordinates(
      laneGeoJSON,
      laneId
    );


  const geometryXY =
    lonLatToLocalXY(
      coordinates
    );


  const {
    cumulativeDistances,
    totalDistanceM,
  } =
    buildCumulativeDistances(
      coordinates
    );


  if (
    totalDistanceM <= 0
  ) {

    console.error(
      "Centennial Park loop has zero length."
    );


    return [];

  }


  const desiredSpeedMps =
    speedLimitKmh /
    3.6;


  const initialSpeedMps =
    desiredSpeedMps *
    0.9;


  const vehicles =
    [];


  for (
    let i = 0;
    i < numberOfVehicles;
    i++
  ) {

    const targetDistanceM =
      (
        i /
        numberOfVehicles
      ) *
      totalDistanceM;


    const position =
      getPositionAtDistance({

        coordinates,

        cumulativeDistances,

        targetDistanceM,

      });


    if (
      !position
    ) {

      continue;

    }


    const vehicle =
      new Vehicle({

        id:
          `loop_vehicle_${String(
            i + 1
          ).padStart(
            3,
            "0"
          )}`,

        route: [
          laneId
        ],

        routingGraph,

        laneGeoJSON,

        speedMps:
          initialSpeedMps,

        desiredSpeedMps,

      });


    vehicle.routeIndex =
      0;


    vehicle.currentLaneId =
      laneId;


    vehicle.segmentIndex =
      position.segmentIndex;


    vehicle.distanceAlongSegmentM =
      position.distanceAlongSegmentM;


    vehicle.distanceAlongLaneM =
      position.distanceAlongLaneM;


    vehicle.lon =
      position.lon;


    vehicle.lat =
      position.lat;


    vehicle.finished =
      false;


    vehicle.streamId =
      "closed_loop";


    const xyPosition =
      getXYAtPosition({

        geometryXY,

        segmentIndex:
          position.segmentIndex,

        distanceAlongSegmentM:
          position.distanceAlongSegmentM,

      });


    vehicle.x =
      xyPosition.x;


    vehicle.y =
      xyPosition.y;


    vehicle.headingRad =
      xyPosition.headingRad;


    vehicle.headingDeg =
      xyPosition.headingDeg;


    vehicles.push(
      vehicle
    );

  }


  console.log(
    "======================================"
  );


  console.log(
    "Centennial Park loop initialized"
  );


  console.log(
    "Number of vehicles:",
    vehicles.length
  );


  console.log(
    "Loop length:",
    `${totalDistanceM.toFixed(
      1
    )} m`
  );


  console.log(
    "Initial spacing:",
    `${
      (
        totalDistanceM /
        numberOfVehicles
      ).toFixed(
        1
      )
    } m`
  );


  console.log(
    "Ego vehicle:",
    EGO_VEHICLE_ID
  );


  console.log(
    "======================================"
  );


  return vehicles;

}


// =========================================================
// Main component
// =========================================================

export default function InteractiveLearning_c6_Phantom() {

  // =======================================================
  // Language
  // =======================================================

  const [
    language,
    setLanguage
  ] =
    useState(
      "en"
    );


  const t =
    text[language] ??
    text.en;


  const isRTL =
    language ===
    "fa";


  // =======================================================
  // Experiment controls
  // =======================================================

  const [
    numberOfVehicles,
    setNumberOfVehicles
  ] =
    useState(
      50
    );


  const [
    speedLimit,
    setSpeedLimit
  ] =
    useState(
      50
    );


  const [
    carFollowingModel,
    setCarFollowingModel
  ] =
    useState(
      "idm"
    );


  // =======================================================
  // Ego vehicle disturbance control
  // =======================================================

  const [
    isEgoBraking,
    setIsEgoBraking
  ] =
    useState(
      false
    );


  const [
    isRunning,
    setIsRunning
  ] =
    useState(
      false
    );


  // =======================================================
  // Vehicle simulation state
  // =======================================================

  const [
    vehicles,
    setVehicles
  ] =
    useState(
      []
    );


  const [
    trafficStreams,
    setTrafficStreams
  ] =
    useState(
      []
    );


  const simulationTimeRef =
    useRef(
      0
    );


  // =======================================================
  // Results
  // =======================================================

  const [
    density,
    setDensity
  ] =
    useState(
      0
    );


  const [
    averageSpeed,
    setAverageSpeed
  ] =
    useState(
      0
    );


  const [
    flow,
    setFlow
  ] =
    useState(
      0
    );


  // =======================================================
  // Loop geometry
  // =======================================================

  const loopCoordinates =
    useMemo(
      () => {

        return getLoopCoordinates(
          laneCenterlines,
          LOOP_LANE_ID
        );

      },
      []
    );


  const loopDistanceData =
    useMemo(
      () => {

        return buildCumulativeDistances(
          loopCoordinates
        );

      },
      [
        loopCoordinates
      ]
    );


  const loopLengthM =
    loopDistanceData
      .totalDistanceM;


  const loopLengthKm =
    loopLengthM /
    1000;


  // =======================================================
  // Debug source data
  // =======================================================

  useEffect(
    () => {

      console.log(
        "Lane centerline GeoJSON:",
        laneCenterlines
      );


      console.log(
        "Routing graph:",
        routingGraph
      );


      console.log(
        "Centennial Park loop length:",
        `${loopLengthM.toFixed(
          1
        )} m`
      );

    },
    [
      loopLengthM
    ]
  );


  // =======================================================
  // Animation
  // =======================================================

  useEffect(
    () => {

      if (
        !isRunning
      ) {

        return;

      }


      let animationFrameId;


      let previousTime =
        performance.now();


      const animate =
        currentTime => {

          const dt =
            Math.min(
              (
                currentTime -
                previousTime
              ) /
              1000,
              0.1
            );


          previousTime =
            currentTime;


          simulationTimeRef.current +=
            dt;


          setVehicles(
            currentVehicles => {

              const laneIndex =
                buildLaneIndex(
                  currentVehicles
                );


              const updatedVehicles =
                currentVehicles.map(
                  vehicle => {

                    const updatedVehicle = {
                      ...vehicle
                    };


                    // =====================================
                    // Find leader
                    // =====================================

                    const leaderInfo =
                      findLeader(
                        vehicle,
                        laneIndex
                      );


                    // =====================================
                    // Normal car-following dynamics
                    // =====================================

                    updateVehicleSpeed(
                      updatedVehicle,
                      leaderInfo,
                      dt,
                      carFollowingModel
                    );


                    // =====================================
                    // Ego vehicle external disturbance
                    //
                    // Only the Ego vehicle receives an
                    // externally imposed braking event.
                    //
                    // Followers continue to respond only
                    // through the normal car-following
                    // dynamics.
                    // =====================================

                    if (
                      updatedVehicle.id ===
                        EGO_VEHICLE_ID &&
                      isEgoBraking
                    ) {

                      const previousSpeedMps =
                        Math.max(
                          Number(
                            vehicle.speedMps
                          ) || 0,
                          0
                        );


                      updatedVehicle.accelerationMps2 =
                        -EGO_BRAKE_DECELERATION_MPS2;


                      updatedVehicle.speedMps =
                        Math.max(
                          0,
                          previousSpeedMps -
                            EGO_BRAKE_DECELERATION_MPS2 *
                            dt
                        );

                    }


                    // =====================================
                    // Move vehicle
                    // =====================================

                    moveVehicle(
                      updatedVehicle,
                      routingGraph,
                      laneCenterlines,
                      dt
                    );


                    return updatedVehicle;

                  }
                );


              return updatedVehicles;

            }
          );


          animationFrameId =
            requestAnimationFrame(
              animate
            );

        };


      animationFrameId =
        requestAnimationFrame(
          animate
        );


      return () => {

        cancelAnimationFrame(
          animationFrameId
        );

      };

    },
    [
      isRunning,
      carFollowingModel,
      isEgoBraking
    ]
  );


  // =======================================================
  // Live traffic metrics
  // =======================================================

  useEffect(
    () => {

      if (
        loopLengthKm <= 0
      ) {

        setDensity(
          0
        );


        setAverageSpeed(
          0
        );


        setFlow(
          0
        );


        return;

      }


      const activeVehicles =
        vehicles.filter(
          vehicle =>
            !vehicle.finished
        );


      // ===================================================
      // Density
      // k = N / L
      // ===================================================

      const currentDensity =
        activeVehicles.length /
        loopLengthKm;


      setDensity(
        currentDensity
      );


      if (
        activeVehicles.length === 0
      ) {

        setAverageSpeed(
          0
        );


        setFlow(
          0
        );


        return;

      }


      // ===================================================
      // Average speed
      // ===================================================

      const totalSpeedMps =
        activeVehicles.reduce(
          (
            total,
            vehicle
          ) => {

            return (
              total +
              (
                Number(
                  vehicle.speedMps
                ) ||
                0
              )
            );

          },
          0
        );


      const meanSpeedMps =
        totalSpeedMps /
        activeVehicles.length;


      const meanSpeedKmh =
        meanSpeedMps *
        3.6;


      setAverageSpeed(
        meanSpeedKmh
      );


      // ===================================================
      // Traffic flow
      // q = k * v
      // ===================================================

      const currentFlow =
        currentDensity *
        meanSpeedKmh;


      setFlow(
        currentFlow
      );

    },
    [
      vehicles,
      loopLengthKm
    ]
  );


  // =======================================================
  // Ego braking control
  // =======================================================

  const handleEgoBrakeStart =
    () => {

      if (
        !isRunning
      ) {

        return;

      }


      setIsEgoBraking(
        true
      );

    };


  const handleEgoBrakeEnd =
    () => {

      setIsEgoBraking(
        false
      );

    };


  // =======================================================
  // Start experiment
  // =======================================================

  const handleStartSimulation =
    () => {

      simulationTimeRef.current =
        0;


      setIsEgoBraking(
        false
      );


      const loopStream = {

        streamId:
          "closed_loop",

        route: [
          LOOP_LANE_ID
        ],

        speedLimit:
          speedLimit,

      };


      setTrafficStreams(
        [
          loopStream
        ]
      );


      const initialVehicles =
        createEvenlyDistributedLoopVehicles({

          numberOfVehicles,

          laneId:
            LOOP_LANE_ID,

          routingGraph,

          laneGeoJSON:
            laneCenterlines,

          speedLimitKmh:
            speedLimit,

        });


      setVehicles(
        initialVehicles
      );


      setIsRunning(
        true
      );

    };


  // =======================================================
  // Pause
  // =======================================================

  const handlePauseSimulation =
    () => {

      setIsEgoBraking(
        false
      );


      setIsRunning(
        false
      );

    };


  // =======================================================
  // Reset
  // =======================================================

  const handleResetSimulation =
    () => {

      setIsEgoBraking(
        false
      );


      setIsRunning(
        false
      );


      setVehicles(
        []
      );


      setTrafficStreams(
        []
      );


      simulationTimeRef.current =
        0;


      setDensity(
        0
      );


      setAverageSpeed(
        0
      );


      setFlow(
        0
      );

    };


  // =======================================================
  // Render
  // =======================================================

  return (

    <main
      dir={
        isRTL
          ? "rtl"
          : "ltr"
      }
      className="
        relative
        left-1/2
        flex
        min-h-screen

        w-[calc(100vw-16px)]
        max-w-[2000px]
        -translate-x-1/2

        flex-col
        overflow-x-hidden
        bg-slate-50
        p-2

        sm:w-[calc(100vw-24px)]
        sm:p-2

        lg:h-screen
        lg:min-h-0
        lg:w-[calc(100vw-32px)]
        lg:overflow-hidden
        lg:p-2
      "
    >

      {/* ==================================================
          Top Bar
      =================================================== */}

      <header
        className="
          mb-3
          flex
          shrink-0
          flex-col
          gap-2
          rounded-lg
          border
          border-slate-200
          bg-white
          px-3
          py-3
          shadow-sm

          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-4
        "
      >

        <div
          className="
            min-w-0
            flex-1
          "
        >

          <h3
            className="
              text-lg
              font-semibold
              leading-tight
              text-slate-800

              sm:text-center
              sm:text-xl
            "
          >
            {t.courseTitle}
          </h3>

        </div>


        <select
          value={
            language
          }
          onChange={
            event =>
              setLanguage(
                event.target.value
              )
          }
          className="
            w-full
            shrink-0
            rounded-md
            border
            border-slate-300
            bg-white
            px-3
            py-2
            text-sm
            text-slate-700

            sm:w-auto
          "
        >

          <option value="en">
            English
          </option>

          <option value="zh">
            中文
          </option>

          <option value="fa">
            فارسی
          </option>

        </select>

      </header>


      {/* ==================================================
          THREE-COLUMN MAIN LAYOUT

          LEFT:
          Introduction + Controls

          CENTER:
          Traffic Map

          RIGHT:
          Traffic Wave Laboratory + Analytics
      =================================================== */}

      <section
        className="
          grid
          w-full
          grid-cols-1
          gap-3

          lg:min-h-0
          lg:flex-1
          lg:grid-cols-[340px_minmax(0,1fr)_320px]
          lg:grid-rows-[auto_minmax(0,1fr)]
          lg:gap-3

          xl:grid-cols-[370px_minmax(0,1fr)_350px]

          2xl:grid-cols-[400px_minmax(0,1fr)_390px]
        "
      >

        {/* =================================================
            LEFT COLUMN
            Introduction
        ================================================== */}

        <section
          className="
            min-w-0
            rounded-lg
            border
            border-slate-200
            bg-white
            p-3
            shadow-sm

            sm:p-4

            lg:col-start-1
            lg:row-start-1
          "
        >

          <h4
            className="
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {t.introductionTitle}
          </h4>


          <p
            className="
              mt-2
              text-sm
              leading-5
              text-slate-600
            "
          >
            {t.introductionText}
          </p>


          <div
            className="
              mt-3
              rounded-md
              bg-slate-50
              p-3
            "
          >

            <div
              className="
                text-xs
                font-semibold
                text-slate-700
              "
            >
              {t.learningGoal}
            </div>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-600
              "
            >
              {t.learningGoalText}
            </p>

          </div>

        </section>


        {/* =================================================
            LEFT COLUMN
            Experiment Controls
        ================================================== */}

        <section
          className="
            min-w-0
            rounded-lg
            border
            border-slate-200
            bg-white
            p-3
            shadow-sm

            sm:p-4

            lg:col-start-1
            lg:row-start-2
            lg:min-h-0
            lg:overflow-y-auto
          "
        >

          <h4
            className="
              mb-4
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {t.simulationControls}
          </h4>


          {/* ===============================================
              Number of Vehicles
          ================================================ */}

          <div
            className="
              mb-4
            "
          >

            <div
              className="
                mb-1
                flex
                items-center
                justify-between
                gap-2
              "
            >

              <label
                htmlFor="number-of-vehicles"
                className="
                  text-xs
                  font-medium
                  text-slate-700
                "
              >
                {t.numberOfVehicles}
              </label>


              <span
                className="
                  shrink-0
                  text-xs
                  text-slate-500
                "
              >
                {numberOfVehicles}
                {" "}
                {t.vehicleUnit}
              </span>

            </div>


            <input
              id="number-of-vehicles"
              type="range"
              min="31"
              max="100"
              step="1"
              value={
                numberOfVehicles
              }
              disabled={
                isRunning
              }
              onChange={
                event =>
                  setNumberOfVehicles(
                    Number(
                      event.target.value
                    )
                  )
              }
              className="
                w-full
              "
            />


            <div
              className="
                mt-1
                text-[11px]
                text-slate-400
              "
            >

              Initial spacing:
              {" "}

              {
                numberOfVehicles > 0
                  ? (
                      loopLengthM /
                      numberOfVehicles
                    ).toFixed(
                      1
                    )
                  : "0"
              }

              {" "}
              m

            </div>

          </div>


          {/* ===============================================
              Car-Following Model
          ================================================ */}

          <div
            className="
              mb-4
            "
          >

            <label
              htmlFor="car-following-model"
              className="
                mb-1
                block
                text-xs
                font-medium
                text-slate-700
              "
            >
              Car-following Model
            </label>


            <select
              id="car-following-model"
              value={
                carFollowingModel
              }
              disabled={
                isRunning
              }
              onChange={
                event =>
                  setCarFollowingModel(
                    event.target.value
                  )
              }
              className="
                w-full
                rounded-md
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-700
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                disabled:cursor-not-allowed
                disabled:bg-slate-100
                disabled:text-slate-400
              "
            >

              <option value="rule">
                Rule-based Human Driver
              </option>

              <option value="idm">
                IDM — Intelligent Driver Model
              </option>

              <option value="ovm">
                OVM — Optimal Velocity Model
              </option>

              <option value="acc">
                ACC — Adaptive Cruise Control
              </option>

              <option value="cacc">
                CACC — Cooperative Adaptive Cruise Control
              </option>

            </select>


            <div
              className="
                mt-2
                rounded-md
                bg-slate-50
                px-3
                py-2
                text-[11px]
                leading-4
                text-slate-500
              "
            >

              {
                carFollowingModel === "rule"
                  ? (
                      <>
                        Simple human-driver model using
                        minimum spacing and time headway.
                      </>
                    )

                  : carFollowingModel === "idm"
                  ? (
                      <>
                        Human-driver model using desired
                        speed, spacing and relative speed.
                      </>
                    )

                  : carFollowingModel === "ovm"
                  ? (
                      <>
                        Drivers adjust speed according to
                        the available spacing ahead.
                      </>
                    )

                  : carFollowingModel === "acc"
                  ? (
                      <>
                        Automated following using spacing
                        and relative-speed feedback.
                      </>
                    )

                  : (
                      <>
                        Cooperative automated driving uses
                        connected-vehicle information to
                        damp traffic waves.
                      </>
                    )
              }

            </div>

          </div>


          {/* ===============================================
              Speed Limit
          ================================================ */}

          <div
            className="
              mb-4
            "
          >

            <div
              className="
                mb-1
                flex
                items-center
                justify-between
                gap-2
              "
            >

              <label
                htmlFor="speed-limit"
                className="
                  text-xs
                  font-medium
                  text-slate-700
                "
              >
                {t.speedLimit}
              </label>


              <span
                className="
                  shrink-0
                  text-xs
                  text-slate-500
                "
              >
                {speedLimit}
                {" "}
                {t.speedUnit}
              </span>

            </div>


            <input
              id="speed-limit"
              type="range"
              min="20"
              max="80"
              step="5"
              value={
                speedLimit
              }
              disabled={
                isRunning
              }
              onChange={
                event =>
                  setSpeedLimit(
                    Number(
                      event.target.value
                    )
                  )
              }
              className="
                w-full
              "
            />

          </div>


          {/* ===============================================
              Start / Pause / Reset
          ================================================ */}

          <div
            className="
              grid
              grid-cols-2
              gap-2
            "
          >

            {!isRunning ? (

              <button
                type="button"
                onClick={
                  handleStartSimulation
                }
                className="
                  rounded-md
                  bg-blue-600
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition

                  hover:bg-blue-700
                "
              >
                {t.start}
              </button>

            ) : (

              <button
                type="button"
                onClick={
                  handlePauseSimulation
                }
                className="
                  rounded-md
                  bg-amber-500
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition

                  hover:bg-amber-600
                "
              >
                {t.pause}
              </button>

            )}


            <button
              type="button"
              onClick={
                handleResetSimulation
              }
              className="
                rounded-md
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition

                hover:bg-slate-50
              "
            >
              {t.reset}
            </button>

          </div>


          {/* ===============================================
              Loop Information
          ================================================ */}

          <div
            className="
              mt-3
              grid
              grid-cols-2
              gap-3
              rounded-md
              bg-slate-50
              px-3
              py-2
              text-[11px]
            "
          >

            <div>

              <div
                className="
                  text-slate-400
                "
              >
                Loop length
              </div>

              <div
                className="
                  mt-0.5
                  font-medium
                  text-slate-700
                "
              >
                {
                  loopLengthM.toFixed(
                    0
                  )
                }
                {" "}
                m
              </div>

            </div>


            <div>

              <div
                className="
                  text-slate-400
                "
              >
                Driving model
              </div>

              <div
                className="
                  mt-0.5
                  font-medium
                  text-slate-700
                "
              >
                {
                  carFollowingModel
                    .toUpperCase()
                }
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CENTER COLUMN
            Traffic Map
        ================================================== */}

        <section
          className="
            relative
            min-w-0
            overflow-hidden
            rounded-lg
            border
            border-slate-200
            bg-white
            shadow-sm

            h-[55vh]
            min-h-[360px]

            sm:h-[60vh]
            sm:min-h-[440px]

            lg:col-start-2
            lg:row-start-1
            lg:row-span-2
            lg:h-auto
            lg:min-h-0
          "
        >

          <TrafficMap

              laneGeoJSON={
                laneCenterlines
              }

              selectedRoute={
                [
                  LOOP_LANE_ID
                ]
              }

              trafficStreams={
                trafficStreams
              }

              vehicles={
                vehicles
              }

              egoVehicleId={
                EGO_VEHICLE_ID
              }

              isEgoBraking={
                isEgoBraking
              }

              t={
                t
              }

            />


          {/* ===============================================
              Map Status
          ================================================ */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-3
              right-3
              z-[1000]

              flex
              items-center
              gap-2

              rounded-md
              bg-white/95
              px-3
              py-2
              text-xs
              text-slate-600
              shadow
            "
          >

            <span
              className="
                font-medium
                text-slate-700
              "
            >
              {vehicles.length}
              {" "}
              {t.vehicleUnit}
            </span>


            <span
              className="
                text-slate-300
              "
            >
              •
            </span>


            <span>
              {
                carFollowingModel
                  .toUpperCase()
              }
            </span>


            {isEgoBraking && (

              <>
                <span
                  className="
                    text-slate-300
                  "
                >
                  •
                </span>

                <span
                  className="
                    font-semibold
                    text-red-600
                  "
                >
                  EGO BRAKING
                </span>
              </>

            )}

          </div>

        </section>


        {/* =================================================
            RIGHT COLUMN
            Traffic Wave + Analytics
        ================================================== */}

        <aside
          className="
            min-w-0

            lg:col-start-3
            lg:row-start-1
            lg:row-span-2
            lg:min-h-0
            lg:overflow-y-auto
          "
        >

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-3
            "
          >

            {/* =============================================
                Traffic Wave Laboratory
            ============================================== */}

            <TrafficWavePanel

              vehicles={
                vehicles
              }

              loopLengthM={
                loopLengthM
              }

              speedLimit={
                speedLimit
              }

              egoVehicleId={
                EGO_VEHICLE_ID
              }

              followerCount={
                5
              }

              isEgoBraking={
                isEgoBraking
              }

              onBrakeStart={
                handleEgoBrakeStart
              }

              onBrakeEnd={
                handleEgoBrakeEnd
              }

            />


            {/* =============================================
                Traffic State + Analytics
            ============================================== */}

            <section
              className="
                min-w-0
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
                shadow-sm

                sm:p-4
              "
            >

              {/* ===========================================
                  Traffic State
              ============================================ */}

              <div
                className="
                  mb-4
                "
              >

                <h4
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  {t.resultSummary}
                </h4>


                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-4
                    text-slate-400
                  "
                >
                  Real-time traffic conditions from the
                  microscopic simulation.
                </p>

              </div>


              {/* ===========================================
                  Density
              ============================================ */}

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-md
                  bg-slate-50
                  px-3
                  py-2
                "
              >

                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  {t.density}
                </span>


                <span
                  className="
                    whitespace-nowrap
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  {
                    density.toFixed(
                      1
                    )
                  }
                  {" "}
                  {t.densityUnit}
                </span>

              </div>


              {/* ===========================================
                  Average Speed
              ============================================ */}

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-md
                  bg-slate-50
                  px-3
                  py-2
                "
              >

                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  {t.averageSpeed}
                </span>


                <span
                  className="
                    whitespace-nowrap
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  {
                    averageSpeed.toFixed(
                      1
                    )
                  }
                  {" "}
                  {t.speedUnit}
                </span>

              </div>


              {/* ===========================================
                  Traffic Flow
              ============================================ */}

              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-md
                  bg-slate-50
                  px-3
                  py-2
                "
              >

                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  {t.trafficFlow}
                </span>


                <span
                  className="
                    whitespace-nowrap
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  {
                    flow.toFixed(
                      0
                    )
                  }
                  {" "}
                  {t.flowUnit}
                </span>

              </div>


              {/* ===========================================
                  Experiment Configuration
              ============================================ */}

              <div
                className="
                  mb-4
                  rounded-md
                  border
                  border-slate-200
                  bg-slate-50
                  p-3
                "
              >

                <div
                  className="
                    mb-3
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  Experiment Configuration
                </div>


                <div
                  className="
                    space-y-2
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      text-xs
                    "
                  >

                    <span
                      className="
                        text-slate-500
                      "
                    >
                      Vehicles
                    </span>


                    <span
                      className="
                        font-medium
                        text-slate-700
                      "
                    >
                      {numberOfVehicles}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      text-xs
                    "
                  >

                    <span
                      className="
                        text-slate-500
                      "
                    >
                      Model
                    </span>


                    <span
                      className="
                        font-medium
                        text-slate-700
                      "
                    >
                      {
                        carFollowingModel
                          .toUpperCase()
                      }
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      text-xs
                    "
                  >

                    <span
                      className="
                        text-slate-500
                      "
                    >
                      Speed Limit
                    </span>


                    <span
                      className="
                        font-medium
                        text-slate-700
                      "
                    >
                      {speedLimit}
                      {" "}
                      {t.speedUnit}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      text-xs
                    "
                  >

                    <span
                      className="
                        text-slate-500
                      "
                    >
                      Initial Spacing
                    </span>


                    <span
                      className="
                        font-medium
                        text-slate-700
                      "
                    >

                      {
                        numberOfVehicles > 0
                          ? (
                              loopLengthM /
                              numberOfVehicles
                            ).toFixed(
                              1
                            )
                          : "0"
                      }

                      {" "}
                      m

                    </span>

                  </div>

                </div>

              </div>


              {/* ===========================================
                  Speed-Density Chart
              ============================================ */}

              <div
                className="
                  mb-4
                "
              >

                <div
                  className="
                    mb-2
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  {t.speedDensityRelationship}
                </div>


                <div
                  className="
                    min-w-0
                    rounded-md
                    border
                    border-slate-200
                    bg-white
                    p-2
                  "
                >

                  <SpeedDensityChart

                    density={
                      density
                    }

                    averageSpeed={
                      averageSpeed
                    }

                    freeFlowSpeed={
                      speedLimit
                    }

                    jamDensity={
                      150
                    }

                    t={
                      t
                    }

                  />

                </div>

              </div>


              {/* ===========================================
                  Traffic Stability
              ============================================ */}

              <div
                className="
                  rounded-md
                  border
                  border-slate-200
                  bg-slate-50
                  p-3
                "
              >

                <div
                  className="
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  Traffic Stability
                </div>


                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-4
                    text-slate-400
                  "
                >
                  Observe whether small speed disturbances
                  amplify into stop-and-go traffic waves.
                </p>

              </div>

            </section>

          </div>

        </aside>

      </section>

    </main>

  );

}