
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


  // =======================================================
  // Language
  // =======================================================

  const [language, setLanguage] =
    useState("en");

  const t =
    text[language] ?? text.en;

  const isRTL =
    language === "fa";


  // =======================================================
  // Simulation controls
  // =======================================================

  const [numberOfVehicles, setNumberOfVehicles] =
    useState(20);

  const [freeFlowSpeed, setFreeFlowSpeed] =
    useState(50);

  const [jamDensity, setJamDensity] =
    useState(120);

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

            let updatedVehicles =
              currentVehicles
                .map(
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
                    // Update speed
                    // -------------------------------------

                    updateVehicleSpeed(
                      updatedVehicle,
                      leaderInfo,
                      dt
                    );


                    // -------------------------------------
                    // Move vehicle using updated speed
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
            // EXISTING SPAWN CODE GOES HERE
            // =============================================

            for (
              const spec
              of TEST_VEHICLE_SCHEDULE
            ) {

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
                      selectedRoute,

                    routingGraph,

                    // Initial speed
                    speedMps:
                      spec.speedMps,

                    // Desired free speed
                    desiredSpeedMps:
                      spec.speedMps,

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
        );


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

  const TEST_VEHICLE_SCHEDULE  = [
      {
        id: "vehicle_001",
        spawnTimeS: 0,
        speedMps: 12,
      },
      {
        id: "vehicle_002",
        spawnTimeS: 2,
        speedMps: 9,
      },
      {
        id: "vehicle_003",
        spawnTimeS: 4,
        speedMps: 14,
      },
      {
        id: "vehicle_004",
        spawnTimeS: 7,
        speedMps: 10,
      },
    ];

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


          setVehicles([]);


          simulationTimeRef.current =
            0;


          spawnedVehicleIdsRef.current =
            new Set();


          setIsRunning(true);

        };


  const handlePauseSimulation = () => {

    setIsRunning(false);

  };


  const handleResetSimulation = () => {

    setIsRunning(false);

    setVehicles([]);

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


            {/* Number of vehicles */}

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
                  htmlFor="vehicle-count"
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
                    text-xs
                    text-slate-500
                  "
                >
                  {numberOfVehicles}
                </span>

              </div>

              <input
                id="vehicle-count"
                type="range"
                min="1"
                max="100"
                step="1"
                value={
                  numberOfVehicles
                }
                onChange={
                  (event) =>
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
                min="20"
                max="100"
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


            {/* Jam density */}

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
                  htmlFor="jam-density"
                  className="
                    text-xs
                    font-medium
                    text-slate-700
                  "
                >
                  {t.jamDensity}
                </label>

                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  {jamDensity}
                  {" "}
                  {t.densityUnit}
                </span>

              </div>

              <input
                id="jam-density"
                type="range"
                min="50"
                max="200"
                step="5"
                value={
                  jamDensity
                }
                onChange={
                  (event) =>
                    setJamDensity(
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