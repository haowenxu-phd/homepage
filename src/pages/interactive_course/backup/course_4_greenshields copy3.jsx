
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

 

import text from "./assets/course_4_greenshields/trans/course.json";


  
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


  const routeLengthM =
    useMemo(() => {

      if (
        !selectedRoute ||
        selectedRoute.length === 0
      ) {
        return 0;
      }

      return selectedRoute.reduce(
        (totalLength, laneId) => {

          const lane =
            routingGraph?.lanes?.[
              laneId
            ];

          const laneLength =
            Number(
              lane?.length_m
            ) || 0;

          return (
            totalLength +
            laneLength
          );

        },
        0
      );

    }, [
      selectedRoute
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

    const [freeFlowSpeed, setFreeFlowSpeed] =
      useState(50);

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
                    // Vehicle movement
                    // -------------------------------------

                    moveVehicle(
                      updatedVehicle,
                      routingGraph,
                      dt
                    );


                    return updatedVehicle;

                  }
                )

                // -----------------------------------------
                // Remove completed vehicles
                // -----------------------------------------

                .filter(
                  vehicle =>
                    !vehicle.finished
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
            ){

              const alreadySpawned =
                spawnedVehicleIdsRef
                  .current
                  .has(
                    spec.id
                  );


              const shouldSpawn =
                simulationTimeRef.current >=
                spec.spawnTimeS;


              if (
                !alreadySpawned &&
                shouldSpawn
              ) {

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


                updatedVehicles.push(
                  newVehicle
                );


                spawnedVehicleIdsRef
                  .current
                  .add(
                    spec.id
                  );

              }

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

  // ---------------------------------------------
  // No valid route
  // ---------------------------------------------

  if (
    routeLengthM <= 0
  ) {

    setDensity(0);
    setAverageSpeed(0);

    return;
  }


  // ---------------------------------------------
  // Vehicles currently inside study corridor
  // ---------------------------------------------

      const routeLaneSet =
        new Set(
          selectedRoute
        );


      const corridorVehicles =
        vehicles.filter(
          vehicle =>
            routeLaneSet.has(
              vehicle.currentLaneId
            )
        );


      // =============================================
      // Density
      //
      // veh / km
      // =============================================

      const routeLengthKm =
        routeLengthM / 1000;


      const currentDensity =
        corridorVehicles.length /
        routeLengthKm;


      setDensity(
        currentDensity
      );


      // =============================================
      // Average speed
      //
      // mean actual vehicle speed
      // =============================================

      if (
        corridorVehicles.length === 0
      ) {

        setAverageSpeed(0);

      } else {

        const totalSpeedMps =
          corridorVehicles.reduce(
            (
              sum,
              vehicle
            ) =>
              sum +
              vehicle.speedMps,
            0
          );


        const meanSpeedMps =
          totalSpeedMps /
          corridorVehicles.length;


        const meanSpeedKmh =
          meanSpeedMps * 3.6;


        setAverageSpeed(
          meanSpeedKmh
        );

      }

    }, [
      vehicles,
      selectedRoute,
      routeLengthM
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
            freeFlowSpeed,
            selectedRoute,
            durationS = 120,
            speedVariationKmh = 5,
      }) => {

        // ---------------------------------------------
        // Vehicle entry interval
        // ---------------------------------------------

        const spawnIntervalS =
          3600 / trafficDemand;


        // ---------------------------------------------
        // Build schedule
        // ---------------------------------------------

        const schedule = [];

        let spawnTimeS = 0;

        let vehicleIndex = 1;


        while (
          spawnTimeS <= durationS
        ) {

          // Random desired speed around
          // the free-flow speed.
          //
          // Example:
          // freeFlowSpeed = 50 km/h
          // variation = ±5 km/h

          const randomVariationKmh =
            (
              Math.random() * 2 - 1
            ) *
            speedVariationKmh;


          const desiredSpeedKmh =
            Math.max(
              5,
              freeFlowSpeed +
              randomVariationKmh
            );


          const desiredSpeedMps =
            desiredSpeedKmh / 3.6;


          schedule.push({

                  id:
                    `vehicle_${String(
                      vehicleIndex
                    ).padStart(
                      3,
                      "0"
                    )}`,

                  spawnTimeS,

                  speedMps:
                    desiredSpeedMps,

                  desiredSpeedMps:
                    desiredSpeedMps,

                  route:
                    [...selectedRoute],

                });


          vehicleIndex += 1;

          spawnTimeS +=
            spawnIntervalS;

        }


        return schedule;

      };

    const handleStartSimulation = () => {

        if (
          !selectedRoute ||
          selectedRoute.length === 0
        ) {

          console.warn(
            "Generate a route first."
          );

          return;
        }


        const schedule =
            generateVehicleSchedule({

              trafficDemand,

              freeFlowSpeed,

              selectedRoute,

              durationS:
                120,

              speedVariationKmh:
                5,

            });


        console.log(
          "Generated vehicle schedule:",
          schedule
        );


        vehicleScheduleRef.current =
          schedule;


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
        h-screen
        w-full
        flex-col
        bg-slate-50
        p-4
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
          items-center
          justify-between
          gap-4
          rounded-lg
          border
          border-slate-200
          bg-white
          px-4
          py-3
          shadow-sm
        "
      >

        <div
          className="
            min-w-0
            flex-1
            text-center
          "
        >

          <h3
            className="
              text-xl
              font-semibold
              text-slate-800
            "
          >
            {t.courseTitle}
          </h3>

        </div>


        {/* Language selector */}

        <select
          value={language}
          onChange={
            (event) =>
              setLanguage(
                event.target.value
              )
          }
          className="
            shrink-0
            rounded-md
            border
            border-slate-300
            bg-white
            px-3
            py-2
            text-sm
            text-slate-700
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
          min-h-0
          flex-1
          grid-cols-[300px_minmax(0,1fr)]
          gap-4
        "
      >

        {/* =================================================
            Left sidebar
        ================================================== */}

        <aside
          className="
            flex
            min-h-0
            flex-col
            gap-3
            overflow-y-auto
          "
        >

          {/* -----------------------------------------------
              Course introduction
          ------------------------------------------------ */}

          <section
            className="
              rounded-lg
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
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


          {/* -----------------------------------------------
              Simulation controls
          ------------------------------------------------ */}

          <section
            className="
              rounded-lg
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
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

            {/* Traffic demand */}

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
                {t.vehicleSpawnInterval}:
                {" "}
                {
                  (
                    3600 /
                    trafficDemand
                  ).toFixed(1)
                }
                {""}
                {t.secondsPerVehicle}
              </div>

            </div>


            {/* Free-flow speed */}

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
                  htmlFor="free-flow-speed"
                  className="
                    text-xs
                    font-medium
                    text-slate-700
                  "
                >
                  {t.freeFlowSpeed}
                </label>

                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  {freeFlowSpeed}
                  {" "}
                  {t.speedUnit}
                </span>

              </div>

              <input
                id="free-flow-speed"
                type="range"
                min="30"
                max="80"
                step="5"
                value={
                  freeFlowSpeed
                }
                onChange={
                  (event) =>
                    setFreeFlowSpeed(
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


            {/* ---------------------------------------------
                Origin lane
            ---------------------------------------------- */}

            <div
              className="
                mb-3
              "
            >

              <label
                className="
                  mb-1
                  block
                  text-xs
                  font-medium
                  text-slate-700
                "
              >
                Origin Lane
              </label>

              <select
                value={
                  originLaneId
                }
                onChange={
                  (event) =>
                    setOriginLaneId(
                      event.target.value
                    )
                }
                className="
                  w-full
                  rounded-md
                  border
                  border-slate-300
                  bg-white
                  px-2
                  py-2
                  text-xs
                  text-slate-700
                "
              >

                {entryLanes.map(
                  (laneId) => (

                    <option
                      key={
                        laneId
                      }
                      value={
                        laneId
                      }
                    >
                      {laneId}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* ---------------------------------------------
                Destination lane
            ---------------------------------------------- */}

            <div
              className="
                mb-4
              "
            >

              <label
                className="
                  mb-1
                  block
                  text-xs
                  font-medium
                  text-slate-700
                "
              >
                Destination Lane
              </label>

              <select
                value={
                  destinationLaneId
                }
                onChange={
                  (event) =>
                    setDestinationLaneId(
                      event.target.value
                    )
                }
                className="
                  w-full
                  rounded-md
                  border
                  border-slate-300
                  bg-white
                  px-2
                  py-2
                  text-xs
                  text-slate-700
                "
              >

                {exitLanes.map(
                  (laneId) => (

                    <option
                      key={
                        laneId
                      }
                      value={
                        laneId
                      }
                    >
                      {laneId}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* Generate route */}

            <button
              type="button"
              onClick={
                handleGenerateRoute
              }
              className="
                mb-2
                w-full
                rounded-md
                border
                border-blue-500
                bg-blue-50
                px-3
                py-2
                text-sm
                font-medium
                text-blue-700
                transition
                hover:bg-blue-100
              "
            >
              {t.generateRoute}
            </button>


            {/* Start / Pause / Reset */}

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
                    py-2
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
                    py-2
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
                  py-2
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


          {/* -----------------------------------------------
              Results
          ------------------------------------------------ */}

          <section
            className="
              rounded-lg
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
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
              "
            >

              <Metric
                label={
                  t.density
                }
                value={
                  `${density.toFixed(1)} ${t.densityUnit}`
                }
              />

              <Metric
                label={
                  t.averageSpeed
                }
                value={
                  `${averageSpeed.toFixed(1)} ${t.speedUnit}`
                }
              />

              <Metric
                label={
                  t.trafficFlow
                }
                value={
                  `${flow.toFixed(1)} ${t.flowUnit}`
                }
              />

            </div>


            {/* Chart placeholder */}

            <div
              className="
                mt-4
                flex
                min-h-[130px]
                items-center
                justify-center
                rounded-md
                border
                border-dashed
                border-slate-300
                bg-slate-50
                p-4
                text-center
                text-xs
                text-slate-400
              "
            >
              {t.speedDensityRelationship}
            </div>

          </section>

        </aside>


        {/* =================================================
            Leaflet simulation area
        ================================================== */}

        

          <section
            className="
              relative
              min-h-0
              overflow-hidden
              rounded-lg
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <TrafficMap
              laneGeoJSON={
                laneCenterlines
              }
              selectedRoute={
                selectedRoute
              }
              vehicles={
                vehicles
              }
              t={
                t
              }
            />
          </section>


          {/* -----------------------------------------------
              Map title
          ------------------------------------------------ */}
          {/**
          <div
            className="
              pointer-events-none
              absolute
              left-4
              top-4
              z-[1000]
              rounded-lg
              border
              border-slate-200
              bg-white/95
              px-4
              py-3
              shadow-md
              backdrop-blur
            "
          >

            <div
              className="
                text-sm
                font-semibold
                text-slate-800
              "
            >
              {t.mapTitle}
            </div>

            <div
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              {t.mapSubtitle}
            </div>

          </div>
            */}

          {/* -----------------------------------------------
              Simulation status
          ------------------------------------------------ */}
          {/**
           * 
           * 
           * <div
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-4
                        z-[1000]
                        rounded-lg
                        border
                        border-slate-200
                        bg-white/95
                        px-3
                        py-2
                        shadow-md
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-medium
                          text-slate-700
                        "
                      >
                        {t.status}
                        {": "}
                        {
                          isRunning
                            ? t.running
                            : t.paused
                        }
                      </span>

                    </div>
          */}
          


          {/* -----------------------------------------------
              Debug / vehicle count
          ------------------------------------------------ */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-4
              right-4
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