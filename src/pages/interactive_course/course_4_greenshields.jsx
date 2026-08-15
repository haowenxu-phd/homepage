
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

 

import text from "./assets/course_4_greenshields/trans/course.json";

import SpeedDensityChart
  from "./assets/course_4_greenshields/components/SpeedDensityChart";
  
import laneCenterlines from "./assets/course_4_greenshields/data/unsw_lane_centerlines_cleaned.json";
import routingGraph from "./assets/course_4_greenshields/data/unsw_lane_routing_graph.json";

import TrafficMap
  from "./assets/course_4_greenshields/components/TrafficMap";

import {
  astar
} from "./assets/course_4_greenshields/routing/astar";

import {
  Vehicle
} from "./assets/course_4_greenshields/simulation/vehicle";

import {
  moveVehicle
} from "./assets/course_4_greenshields/simulation/laneMovement";

import {
  buildLaneIndex
} from "./assets/course_4_greenshields/simulation/laneIndex";


import {
  findLeader
} from "./assets/course_4_greenshields/simulation/leaderDetection";


import {
  updateVehicleSpeed
} from "./assets/course_4_greenshields/simulation/carFollowing";

// =========================================================
// Course 4
// Microscopic Traffic Simulation + Greenshields
// =========================================================

export default function InteractiveLearning_c4_Greenshields() {
  
  const [
  selectedRoute,
  setSelectedRoute
  ] = useState([]);

const [
  trafficStreams,
  setTrafficStreams
] = useState([]);


  // =========================================================
  // Check whether a new vehicle can enter its first lane
  // =========================================================

  function canSpawnVehicle({
    route,
    vehicles,
    minimumSpawnGapM = 8,
  }) {

    if (
      !Array.isArray(route) ||
      route.length === 0
    ) {
      return false;
    }


    const entryLaneId =
      route[0];


    // Find active vehicles currently on
    // the same entry lane.
    const vehiclesOnEntryLane =
      vehicles.filter(
        vehicle =>
          !vehicle.finished &&
          vehicle.currentLaneId ===
            entryLaneId
      );


    // No vehicle currently on entry lane.
    if (
      vehiclesOnEntryLane.length === 0
    ) {
      return true;
    }


    // Find the vehicle closest to the
    // beginning of the lane.
    const nearestVehicle =
      vehiclesOnEntryLane.reduce(
        (nearest, vehicle) => {

          if (!nearest) {
            return vehicle;
          }

          return (
            vehicle.distanceAlongLaneM <
            nearest.distanceAlongLaneM
              ? vehicle
              : nearest
          );

        },
        null
      );


    if (!nearestVehicle) {
      return true;
    }


    // Distance from lane start to the rear
    // of the nearest existing vehicle.
    const availableGapM =
      nearestVehicle.distanceAlongLaneM -
      (
        nearestVehicle.lengthM ?? 4.5
      );


    return (
      availableGapM >=
      minimumSpawnGapM
    );

  }
// =========================================================
// Active simulation lanes
//
// Union of all lanes used by all traffic streams.
// A lane shared by multiple streams is counted only once.
// =========================================================

const simulationLaneIds =
  useMemo(() => {

    const laneIds =
      trafficStreams.flatMap(
        stream =>
          stream.route ?? []
      );


    return [
      ...new Set(
        laneIds
      )
    ];

  }, [
    trafficStreams
  ]);


    // =========================================================
    // Total length of active simulation network
    // =========================================================

    const simulationNetworkLengthM =
      useMemo(() => {

        return simulationLaneIds.reduce(
          (
            totalLength,
            laneId
          ) => {

            const lane =
              routingGraph?.lanes?.[
                laneId
              ];


            const laneLengthM =
              Number(
                lane?.length_m
              ) || 0;


            return (
              totalLength +
              laneLengthM
            );

          },
          0
        );

      }, [
        simulationLaneIds
      ]);

  // =======================================================
  // Language
  // =======================================================

  const [language, setLanguage] =
    useState("en");

  const t =
    text[language] ?? text.en;

  const isRTL =
    language === "fa1";


  // =======================================================
  // Simulation controls
  // =======================================================

    const [trafficDemand, setTrafficDemand] =
      useState(900);

      /*
   const [
      freeFlowSpeed,
      setFreeFlowSpeed
    ] = useState(50);
*/
    const [
  speedLimit,
  setSpeedLimit
] = useState(50);

  const [isRunning, setIsRunning] =
    useState(false);

    
  const [simulationTime, setSimulationTime] =
  useState(0);

  const [spawnedVehicleIds, setSpawnedVehicleIds] =
  useState(new Set());

  // =======================================================
  // Simulation results
  // =======================================================

  const [density, setDensity] =
    useState(0);

  const [averageSpeed, setAverageSpeed] =
    useState(0);

  const [flow, setFlow] =
    useState(0);


  // =======================================================
  // Vehicle state
  //
  // Later this will contain:
  //
  // {
  //   id,
  //   route,
  //   routeIndex,
  //   currentLaneId,
  //   distanceAlongLane,
  //   speedMps,
  //   accelerationMps2,
  //   lat,
  //   lon
  // }
  //
  // =======================================================

  const [vehicles, setVehicles] =
    useState([]);

   const simulationTimeRef =
      useRef(0);

    const spawnedVehicleIdsRef =
      useRef(
        new Set()
      );

    const vehicleScheduleRef =
  useRef([]);

    // Number of vehicles that have actually
    // reached the destination.
    const completedVehicleCountRef =
      useRef(0);


  // =======================================================
  // Optional selected OD
  // =======================================================

  const [originLaneId, setOriginLaneId] =
    useState("lane_0015");

  const [destinationLaneId, setDestinationLaneId] =
    useState("lane_0010");

   

  // =======================================================
  // Inspect data
  // =======================================================

  useEffect(() => {

    console.log(
      "Lane centerline GeoJSON:",
      laneCenterlines
    );

    console.log(
      "Routing graph:",
      routingGraph
    );

  }, []);


  // =======================================================
  // Entry / exit lanes
  // =======================================================
/*
  const entryLanes =
    routingGraph?.entry_lanes ?? ["lane_0015"];

  const exitLanes =
    routingGraph?.exit_lanes ?? ["lane_0010"];
*/
 const entryLanes =
    ["lane_0015", "lane_0013", "lane_0007"];

  const exitLanes =
   ["lane_0010", "lane_0011", "lane_0020", "lane_0002", "lane_0016"];

  // =======================================================
  // Default OD
  // =======================================================

  useEffect(() => {

    if (
      !originLaneId &&
      entryLanes.length > 0
    ) {
      setOriginLaneId(
        entryLanes[0]
      );
    }

    if (
      !destinationLaneId &&
      exitLanes.length > 0
    ) {
      setDestinationLaneId(
        exitLanes[0]
      );
    }

  }, [
    entryLanes,
    exitLanes,
    originLaneId,
    destinationLaneId,
  ]);

  // =======================================================
  // Animation
  // =======================================================

    useEffect(() => {

    if (!isRunning) {
      return;
    }


    let animationFrameId;


    let previousTime =
      performance.now();


    const animate = (
      currentTime
    ) => {

      // =============================================
      // Calculate timestep
      // =============================================

      const dt =
        Math.min(
          (
            currentTime -
            previousTime
          ) / 1000,
          0.1
        );


      previousTime =
        currentTime;


      // =============================================
      // Advance simulation clock
      // =============================================

      simulationTimeRef.current +=
        dt;


      // =============================================
      // Update simulation
      // =============================================

      setVehicles(
          currentVehicles => {

            // =============================================
            // 1. Build shared lane occupancy index
            // =============================================

            const laneIndex =
              buildLaneIndex(
                currentVehicles
              );


            // =============================================
            // 2. Update driving behavior + movement
            // =============================================

            const movedVehicles =
                  currentVehicles.map(
                    vehicle => {

                      const updatedVehicle = {
                        ...vehicle
                      };


                      // -------------------------------------
                      // Find leader
                      // -------------------------------------

                      const leaderInfo =
                        findLeader(
                          vehicle,
                          laneIndex
                        );


                      // -------------------------------------
                      // Car-following behavior
                      // -------------------------------------

                      updateVehicleSpeed(
                        updatedVehicle,
                        leaderInfo,
                        dt
                      );


                      // -------------------------------------
                      // Move vehicle
                      // -------------------------------------

                      moveVehicle(
                        updatedVehicle,
                        routingGraph,
                        dt
                      );


                      return updatedVehicle;

                    }
                  );


                // =============================================
                // 3. Count completed vehicles
                // =============================================

                const finishedVehicleCount =
                  movedVehicles.filter(
                    vehicle =>
                      vehicle.finished
                  ).length;


                completedVehicleCountRef.current +=
                  finishedVehicleCount;


                // =============================================
                // 4. Remove completed vehicles
                // =============================================

                let updatedVehicles =
                  movedVehicles.filter(
                    vehicle =>
                      !vehicle.finished
                  );


            // =============================================
            // EXISTING SPAWN CODE GOES HERE
            // =============================================

            for (
              const spec
              of vehicleScheduleRef.current
            ) {

              // -------------------------------------------
              // Has this vehicle already entered?
              // -------------------------------------------

              const alreadySpawned =
                spawnedVehicleIdsRef
                  .current
                  .has(
                    spec.id
                  );


              if (
                alreadySpawned
              ) {
                continue;
              }


              // -------------------------------------------
              // Has its requested entry time arrived?
              // -------------------------------------------

              const shouldSpawn =
                simulationTimeRef.current >=
                spec.spawnTimeS;


              if (
                !shouldSpawn
              ) {
                continue;
              }

               // -------------------------------------------
              // Now I have to change spawn model
              // -------------------------------------------

              const desiredSpawnSpeedMps =
              spec.desiredSpeedMps;


            const minimumSpawnGapM =
              4.5 +
              2.5 +
              desiredSpawnSpeedMps *
              1.5;

              // -------------------------------------------
              // Is there enough space on the entry lane?
              // -------------------------------------------

              const entryAvailable =
              canSpawnVehicle({

                route:
                  spec.route,

                vehicles:
                  updatedVehicles,

                minimumSpawnGapM:
                  minimumSpawnGapM,

              });


              // Entry lane occupied.
              //
              // IMPORTANT:
              // Do NOT add the ID to spawnedVehicleIdsRef.
              // Therefore the vehicle will try again
              // during the next simulation frame.
              if (
                !entryAvailable
              ) {
                continue;
              }


              // -------------------------------------------
              // Create vehicle
              // -------------------------------------------

              const newVehicle =
                      new Vehicle({

                        id:
                          spec.id,

                        route:
                          spec.route,

                        routingGraph,

                        speedMps:
                          spec.speedMps,

                        desiredSpeedMps:
                          spec.desiredSpeedMps,

                      });


                    // -------------------------------------------
                    // Preserve stream / spawning information
                    // -------------------------------------------

                    newVehicle.streamId =
                      spec.streamId;


                    newVehicle.requestedSpawnTimeS =
                      spec.spawnTimeS;


                    newVehicle.actualSpawnTimeS =
                      simulationTimeRef.current;


                    newVehicle.entryDelayS =
                      Math.max(
                        0,
                        simulationTimeRef.current -
                        spec.spawnTimeS
                      );


                    // ===========================================
                    // IMPORTANT:
                    // Add vehicle to active simulation
                    // ===========================================

                    updatedVehicles.push(
                      newVehicle
                    );


                    // -------------------------------------------
                    // Only AFTER successful insertion,
                    // mark the vehicle as spawned.
                    // -------------------------------------------

                    spawnedVehicleIdsRef
                      .current
                      .add(
                        spec.id
                      );
            }


            return updatedVehicles;

          }
        ); //end of set vechile

        if (
            simulationTimeRef.current > 0
          ) {

            const measuredFlowVehPerHour =
              (
                completedVehicleCountRef.current /
                simulationTimeRef.current
              )
              * 3600;


            setFlow(
              measuredFlowVehPerHour
            );

          } // end of if




      // =============================================
      // Request next animation frame
      // =============================================

      animationFrameId =
        requestAnimationFrame(
          animate
        );

    };


    animationFrameId =
      requestAnimationFrame(
        animate
      );


    // ===============================================
    // Cleanup
    // ===============================================

    return () => {

      cancelAnimationFrame(
        animationFrameId
      );

    };


  }, [
    isRunning,
    routingGraph,
    selectedRoute
  ]);



  // =======================================================
  // Live traffic metrics
  // =======================================================
  useEffect(() => {

    // -----------------------------------------------------
    // No active simulation network
    // -----------------------------------------------------

    if (
      simulationNetworkLengthM <= 0
    ) {

      setDensity(0);

      setAverageSpeed(0);

      return;

    }


    // -----------------------------------------------------
    // Build lookup of all lanes currently participating
    // in the simulation.
    // -----------------------------------------------------

    const simulationLaneSet =
      new Set(
        simulationLaneIds
      );


    // -----------------------------------------------------
    // Vehicles currently inside simulation network
    // -----------------------------------------------------

    const networkVehicles =
      vehicles.filter(
        vehicle =>
          !vehicle.finished &&
          simulationLaneSet.has(
            vehicle.currentLaneId
          )
      );


    // =====================================================
    // Density
    //
    // k = N / L
    //
    // N = vehicles currently inside network
    // L = total active lane length in km
    //
    // unit: veh/km
    // =====================================================

    const networkLengthKm =
      simulationNetworkLengthM /
      1000;


    const currentDensity =
      networkLengthKm > 0
        ? (
            networkVehicles.length /
            networkLengthKm
          )
        : 0;


    setDensity(
      currentDensity
    );


    // =====================================================
    // Average speed
    //
    // Space-mean approximation for current vehicles
    //
    // unit: km/h
    // =====================================================

    if (
      networkVehicles.length === 0
    ) {

      setAverageSpeed(0);

      return;

    }


    const totalSpeedMps =
      networkVehicles.reduce(
        (
          total,
          vehicle
        ) => {

          return (
            total +
            (
              Number(
                vehicle.speedMps
              ) || 0
            )
          );

        },
        0
      );


    const meanSpeedMps =
      totalSpeedMps /
      networkVehicles.length;


    const meanSpeedKmh =
      meanSpeedMps *
      3.6;


    setAverageSpeed(
      meanSpeedKmh
    );


  }, [
    vehicles,
    simulationLaneIds,
    simulationNetworkLengthM
  ]);

  // =======================================================
  // Map center
  // =======================================================

  const mapCenter =
    useMemo(
      () => [
        -33.9195,
        151.2255,
      ],
      []
    );


  // =======================================================
  // Lane style
  // =======================================================

  const laneStyle = () => ({
    color: "#2563eb",
    weight: 3,
    opacity: 0.85,
  });


  // =======================================================
  // Simulation handlers
  // =======================================================
 
    const generateVehicleSchedule = ({
            trafficDemand,
            speedLimit,
            selectedRoute,

            durationS = 120,

            streamId = "stream",
          }) => {

            if (
              !Array.isArray(selectedRoute) ||
              selectedRoute.length === 0 ||
              trafficDemand <= 0 ||
              speedLimit <= 0
            ) {
              return [];
            }


            // =====================================================
            // Mean arrival interval
            //
            // trafficDemand: veh/h
            // =====================================================

            const meanSpawnIntervalS =
              3600 /
              trafficDemand;


            const schedule =
              [];


            let spawnTimeS =
              0;

            let vehicleIndex =
              1;


            while (
              spawnTimeS <=
              durationS
            ) {

              // ===================================================
              // Desired vehicle speed
              //
              // Vehicles travel between approximately
              // 85% and 100% of the speed limit.
              // ===================================================

              const speedFactor =
                0.85 +
                Math.random() * 0.15;


              const desiredSpeedKmh =
                speedLimit *
                speedFactor;


              const desiredSpeedMps =
                desiredSpeedKmh /
                3.6;


              // ===================================================
              // Add vehicle specification
              // ===================================================

              schedule.push({

                id:
                  `${streamId}_vehicle_${String(
                    vehicleIndex
                  ).padStart(
                    3,
                    "0"
                  )}`,

                streamId,

                spawnTimeS,

                speedMps:
                  desiredSpeedMps,

                desiredSpeedMps:
                  desiredSpeedMps,

                route: [
                  ...selectedRoute
                ],

              });


              vehicleIndex +=
                1;


              // ===================================================
              // Random arrival interval
              //
              // Exponential distribution
              // ===================================================

              const u =
                Math.max(
                  Math.random(),
                  0.000001
                );


              const randomIntervalS =
                -meanSpawnIntervalS *
                Math.log(
                  u
                );


              spawnTimeS +=
                randomIntervalS;

            }


            return schedule;

          };

    const handleStartSimulation = () => {

            // =====================================================
            // Define multiple traffic streams
            // =====================================================

            const streams = [

                {
                  streamId:
                    "stream_001",

                  route: [
                    "lane_0015",
                    "lane_0026",
                    "lane_0003",
                    "lane_0034",
                    "lane_0010"
                  ],

                  trafficDemand:
                    trafficDemand /2 ,

                  speedLimit:
                          speedLimit,
                },


                {
                  streamId:
                    "stream_002",

                  route: [
                    "lane_0015",
                    "lane_0026",
                    "lane_0003",
                    "lane_0033",
                    "lane_0020"
                  ],

                  trafficDemand:
                    trafficDemand / 2,

                  speedLimit:
                      speedLimit,
                },

              ];


            // =====================================================
            // Validate routes
            // =====================================================

            /*
            const validStreams =
              trafficStreams.filter(
                stream =>
                  Array.isArray(
                    stream.selectedRoute
                  ) &&
                  stream.selectedRoute.length > 0
              );*/
             const validStreams =
              streams.filter(
                stream =>
                  Array.isArray(
                    stream.route
                  ) &&
                  stream.route.length > 0
              );

            if (
              validStreams.length === 0
            ) {

              console.warn(
                "No valid traffic routes were provided."
              );

              return;

            }

            setTrafficStreams(
              validStreams
            );


            // =====================================================
            // Generate one schedule for every traffic stream
            // =====================================================

           const schedules =
                validStreams.map(
                  stream => {

                    return generateVehicleSchedule({

                      trafficDemand:
                        stream.trafficDemand,

                      speedLimit:
                        stream.speedLimit,

                      selectedRoute:
                        stream.route,

                      durationS:
                        120,

                      streamId:
                        stream.streamId,

                    });

                  }
                );


            // =====================================================
            // Merge schedules
            // =====================================================

            const combinedSchedule =
              schedules
                .flat()
                .sort(
                  (a, b) =>
                    a.spawnTimeS -
                    b.spawnTimeS
                );
            
            vehicleScheduleRef.current =
              combinedSchedule;


            console.log(
              "Generated traffic schedules:",
              schedules
            );


            console.log(
              "Combined vehicle schedule:",
              combinedSchedule
            );


            // =====================================================
            // Store combined schedule
            // =====================================================

            vehicleScheduleRef.current =
              combinedSchedule;


            // =====================================================
            // Reset simulation
            // =====================================================

            setVehicles([]);


            simulationTimeRef.current =
              0;


            spawnedVehicleIdsRef.current =
              new Set();


            completedVehicleCountRef.current =
              0;


            setDensity(0);

            setAverageSpeed(0);

            setFlow(0);


            // =====================================================
            // Start simulation
            // =====================================================

            setIsRunning(true);

          };


  const handlePauseSimulation = () => {

    setIsRunning(false);

  };


    const handleResetSimulation = () => {

      setIsRunning(false);

      setVehicles([]);


      simulationTimeRef.current =
        0;

      spawnedVehicleIdsRef.current =
        new Set();

      completedVehicleCountRef.current =
        0;


      setDensity(0);

      setAverageSpeed(0);

      setFlow(0);

    };


  // =======================================================
  // Routing placeholder
  //
  // Later replace this with:
  //
  // const route = astar(
  //   routingGraph,
  //   originLaneId,
  //   destinationLaneId
  // );
  //
  // =======================================================

    const handleGenerateRoute = () => {

        if (
          !originLaneId ||
          !destinationLaneId
        ) {
          console.warn(
            "Origin or destination lane is missing."
          );

          return;
        }


        const route = astar(
          routingGraph,
          originLaneId,
          destinationLaneId
        );


        console.log(
          "Origin:",
          originLaneId
        );

        console.log(
          "Destination:",
          destinationLaneId
        );

        console.log(
          "Generated route:",
          route
        );


        setSelectedRoute(
          route
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
    flex
    min-h-screen
    w-full
    flex-col
    overflow-x-hidden
    bg-slate-50
    p-2

    sm:p-3

    lg:h-screen
    lg:min-h-0
    lg:overflow-hidden
    lg:p-4
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


    {/* Language selector */}

    <select
      value={
        language
      }
      onChange={
        (event) =>
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
      Main responsive layout

      MOBILE:
      Introduction
      Controls
      Map
      Results

      DESKTOP:
      Left column     | Map
      -------------------------
      Introduction    |
      Controls        | Map
      Results         |
  =================================================== */}

  <section
  className="
    grid
    w-full
    grid-cols-1
    gap-3

    lg:min-h-0
    lg:flex-1
    lg:grid-cols-[360px_minmax(0,1fr)]
    lg:grid-rows-[auto_auto_minmax(0,1fr)]
    lg:gap-4

    xl:grid-cols-[420px_minmax(0,1fr)]
  "
>

    {/* =================================================
        Course introduction

        Mobile: item 1
        Desktop: left column / row 1
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
        Simulation controls

        Mobile: item 2
        Desktop: left column / row 2
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
          Traffic demand
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
            htmlFor="traffic-demand"
            className="
              text-xs
              font-medium
              text-slate-700
            "
          >
            {t.trafficDemand}
          </label>


          <span
            className="
              shrink-0
              text-xs
              text-slate-500
            "
          >
            {trafficDemand}
            {" "}
            {t.flowUnit}
          </span>

        </div>


        <input
          id="traffic-demand"
          type="range"
          min="300"
          max="2400"
          step="100"
          value={
            trafficDemand
          }
          onChange={
            (event) =>
              setTrafficDemand(
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
          {t.vehicleSpawnInterval}
          {": "}
          {
            (
              3600 /
              trafficDemand
            ).toFixed(1)
          }
          {" "}
          {t.secondsPerVehicle}
        </div>

      </div>


      {/* ===============================================
          Free-flow speed
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
            >
              {t.speedLimit}
            </label>

            <span>
              {speedLimit} km/h
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
              onChange={
                (event) =>
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

    </section>


    {/* =================================================
        MAP

        Mobile:
        full width and 55vh tall

        Desktop:
        entire right column and all rows
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
          selectedRoute
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
          Vehicle count overlay
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

        Mobile: AFTER map
        Desktop: left column / row 3
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
            `${density.toFixed(0)} ${t.densityUnit}`
          }
        />


        <Metric
          label={
            t.averageSpeed
          }
          value={
            `${averageSpeed.toFixed(0)} ${t.speedUnit}`
          }
        />


        <Metric
          label={
            t.trafficFlow
          }
          value={
            `${flow.toFixed(0)} ${t.flowUnit}`
          }
        />

      </div>


      {/* ===============================================
          Chart placeholder
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