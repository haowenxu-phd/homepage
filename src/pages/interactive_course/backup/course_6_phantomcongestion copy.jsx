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


// =========================================================
// Distance between two lon/lat coordinates
//
// Input:
// [longitude, latitude]
//
// Output:
// metres
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
      Math.sqrt(a),
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
// Convert lon/lat coordinates to a local XY coordinate
// system in metres.
//
// The first road coordinate becomes:
// x = 0
// y = 0
//
// This is sufficient for the small Centennial Park loop.
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
// Get Centennial Park loop coordinates
//
// Keep the closing coordinate because laneMovement.js
// needs the last road segment to return to the first point.
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


  if (!feature) {

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
  // Make sure the geometry is actually closed
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


  // If the last coordinate is not sufficiently close
  // to the first one, explicitly close the loop.
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
// Build cumulative physical distance along road
//
// Example:
//
// P0 ---- P1 ------- P2
//
// cumulative:
//
// P0 = 0 m
// P1 = 20 m
// P2 = 55 m
// =========================================================

function buildCumulativeDistances(
  coordinates
) {

  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length <
      2
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
// Find an exact position along the loop.
//
// Example:
//
// targetDistance = 350 m
//
// Returns:
//
// segmentIndex
// distanceAlongSegmentM
// distanceAlongLaneM
// lon
// lat
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
    coordinates.length <
      2
  ) {

    return null;

  }


  for (
    let i = 0;
    i <
      cumulativeDistances.length -
      1;
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


  // Numerical fallback
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
// Calculate XY position at a distributed location
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
// Create vehicles evenly distributed around loop
//
// IMPORTANT:
//
// Vehicles are spaced by PHYSICAL DISTANCE,
// not by GeoJSON coordinate index.
//
// N vehicles:
//
// d_i = i / N * L
//
// where:
//
// L = loop length
// N = number of vehicles
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
    numberOfVehicles <=
      0
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
    totalDistanceM <=
    0
  ) {

    console.error(
      "Centennial Park loop has zero length."
    );


    return [];

  }


  // =======================================================
  // Vehicle initial speed
  //
  // Start slightly below desired speed.
  // This avoids an artificial instantaneous acceleration.
  // =======================================================

  const desiredSpeedMps =
    speedLimitKmh /
    3.6;


  const initialSpeedMps =
    desiredSpeedMps *
    0.9;


  const vehicles =
    [];


  // =======================================================
  // Create all vehicles simultaneously
  // =======================================================

  for (
    let i = 0;
    i < numberOfVehicles;
    i++
  ) {

    // -----------------------------------------------------
    // Equal physical spacing around loop
    // -----------------------------------------------------

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


    if (!position) {
      continue;
    }


    // -----------------------------------------------------
    // Create normal microscopic vehicle
    // -----------------------------------------------------

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

        desiredSpeedMps:
          desiredSpeedMps,

      });


    // -----------------------------------------------------
    // Override normal "start of road" position.
    //
    // Put vehicle at its distributed location.
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // Calculate XY + heading
    // -----------------------------------------------------

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
      20
    );


  const [
    speedLimit,
    setSpeedLimit
  ] =
    useState(
      50
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


  // =======================================================
  // Loop cumulative distance
  // =======================================================

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

          // ===============================================
          // Time step
          // ===============================================

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


          // ===============================================
          // Update all vehicles
          // ===============================================

          setVehicles(
            currentVehicles => {

              // -------------------------------------------
              // Lane occupancy
              // -------------------------------------------

              const laneIndex =
                buildLaneIndex(
                  currentVehicles
                );


              // -------------------------------------------
              // Vehicle dynamics
              // -------------------------------------------

              const updatedVehicles =
                currentVehicles.map(
                  vehicle => {

                    const updatedVehicle = {
                      ...vehicle
                    };


                    // =====================================
                    // Find leading vehicle
                    // =====================================

                    const leaderInfo =
                      findLeader(
                        vehicle,
                        laneIndex
                      );


                    // =====================================
                    // Car-following model
                    // =====================================

                    updateVehicleSpeed(
                      updatedVehicle,
                      leaderInfo,
                      dt
                    );


                    // =====================================
                    // Move vehicle along closed loop
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
      isRunning
    ]
  );


  // =======================================================
  // Live traffic metrics
  // =======================================================

  useEffect(
    () => {

      if (
        loopLengthKm <=
        0
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
      //
      // k = N / L
      //
      // veh/km
      // ===================================================

      const currentDensity =
        activeVehicles.length /
        loopLengthKm;


      setDensity(
        currentDensity
      );


      // ===================================================
      // Average speed
      // ===================================================

      if (
        activeVehicles.length ===
        0
      ) {

        setAverageSpeed(
          0
        );


        setFlow(
          0
        );


        return;

      }


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
      //
      // Fundamental relationship:
      //
      // q = k * v
      //
      // veh/h
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
  // Start experiment
  // =======================================================

  const handleStartSimulation =
    () => {

      // ===================================================
      // Reset clock
      // ===================================================

      simulationTimeRef.current =
        0;


      // ===================================================
      // Define closed-loop stream
      //
      // Used mainly for TrafficMap highlighting.
      // ===================================================

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


      // ===================================================
      // Create initial traffic state
      // ===================================================

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

      setIsRunning(
        false
      );

    };


  // =======================================================
  // Reset
  // =======================================================

  const handleResetSimulation =
    () => {

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
  // Lane style
  // =======================================================

  const laneStyle =
    () => ({

      color:
        "#2563eb",

      weight:
        3,

      opacity:
        0.85,

    });


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
          Top bar
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
          Main layout
      =================================================== */}

      <section
          className="
            grid
            w-full
            grid-cols-1
            gap-3

            lg:min-h-0
            lg:flex-1
            lg:grid-cols-[340px_minmax(0,1fr)_300px]
            lg:grid-rows-[auto_minmax(0,1fr)]
            lg:gap-3

            xl:grid-cols-[360px_minmax(0,1fr)_320px]

            2xl:grid-cols-[390px_minmax(0,1fr)_360px]
          "
        >

        {/* =================================================
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
            Experiment controls
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
              Number of vehicles
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
              min="5"
              max="60"
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
              Speed limit
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
              Loop information
          ================================================ */}

          <div
            className="
              mt-3
              rounded-md
              bg-slate-50
              px-3
              py-2
              text-[11px]
              leading-5
              text-slate-500
            "
          >

            Loop length:
            {" "}
            {
              loopLengthM.toFixed(
                0
              )
            }
            {" "}
            m

          </div>

        </section>


        {/* =================================================
            Map
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
            lg:row-span-3
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

            t={
              t
            }

          />


          {/* ===============================================
              Vehicle count
          ================================================ */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-3
              right-3
              z-[1000]
              rounded-md
              bg-white/95
              px-3
              py-2
              text-xs
              text-slate-600
              shadow
            "
          >

            {vehicles.length}
            {" "}
            {t.vehicleUnit}

          </div>

        </section>


        {/* =================================================
            Results
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
            lg:row-start-3
            lg:min-h-0
            lg:overflow-y-auto
          "
        >

          <h4
            className="
              mb-3
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {t.resultSummary}
          </h4>


          <div
            className="
              grid
              gap-2

              sm:grid-cols-3

              lg:grid-cols-1
            "
          >

            <Metric

              label={
                t.density
              }

              value={
                `${
                  density.toFixed(
                    1
                  )
                } ${t.densityUnit}`
              }

            />


            <Metric

              label={
                t.averageSpeed
              }

              value={
                `${
                  averageSpeed.toFixed(
                    1
                  )
                } ${t.speedUnit}`
              }

            />


            <Metric

              label={
                t.trafficFlow
              }

              value={
                `${
                  flow.toFixed(
                    0
                  )
                } ${t.flowUnit}`
              }

            />

          </div>


          {/* ===============================================
              Speed-density chart
          ================================================ */}

          <div
            className="
              mt-4
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

        </section>

      </section>

    </main>

  );

}


// =========================================================
// Metric component
// =========================================================

function Metric({
  label,
  value,
}) {

  return (

    <div
      className="
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
        {label}
      </span>


      <span
        className="
          whitespace-nowrap
          text-sm
          font-semibold
          text-slate-800
        "
      >
        {value}
      </span>

    </div>

  );

}