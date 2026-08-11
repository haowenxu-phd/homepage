import React, {
  useEffect,
  useState,
} from "react";

import text
from "./step2.json";

import { antColonyOptimization }
from "../../algorithms/antColonyOptimization";


export default function Step1TourOptimization({
  
  language,

  routingGraph,

  origin,
  setOrigin,

  originNodeId,
  setOriginNodeId,

  destination,
  setDestination,

  destinationNodeId,
  setDestinationNodeId,

  waypoints,
  setWaypoints,

  routeResult,
  setRouteResult,

  setAnimationRouteResult
}) {

  // ============================================================
  // ACO animation state
  // ============================================================

  const [
    animationFrames,
    setAnimationFrames,
  ] = useState([]);


  const [
    animationFrameIndex,
    setAnimationFrameIndex,
  ] = useState(0);


  const [
    isAnimating,
    setIsAnimating,
  ] = useState(false);


  const [
    animationSpeedMs,
    setAnimationSpeedMs,
  ] = useState(500);

  const currentAnimationFrame =
  animationFrames[
    animationFrameIndex
  ] ??
  null;

  // ============================================================
  // Translation
  // ============================================================

  const t =
    text?.[language] ??
    text.en;


  const direction =
    language === "fa"
      ? "rtl"
      : "ltr";


  // ============================================================
  // Local UI state
  // ============================================================

  const [
    numberOfStops,
    setNumberOfStops,
  ] = useState(5);


  const [
    selectedAlgorithm,
    setSelectedAlgorithm,
  ] = useState(
    "aco"
  );


  const [
    iterations,
    setIterations,
  ] = useState(100);


  const [
    isRunning,
    setIsRunning,
  ] = useState(false);


  const [
    metrics,
    setMetrics,
  ] = useState({
    runtimeMs: null,
    bestCost: null,
    improvement: null,
    iterationsCompleted: null,
  });


  // ============================================================
  // Generate random stops
  //
  // Placeholder:
  // later this should sample valid routingGraph nodes and also
  // create geographic waypoint markers on the Leaflet map.
  // ============================================================

  const handleGenerateStops = () => {

        const nodeEntries =
          Object.entries(
            routingGraph?.nodes ?? {}
          );


        // ----------------------------------------------------------
        // Total required nodes:
        //
        // 1 origin
        // + N intermediate stops
        // + 1 destination
        // ----------------------------------------------------------

        const totalRequiredNodes =
          numberOfStops + 2;


        if (
          nodeEntries.length <
          totalRequiredNodes
        ) {

          console.warn(
            "Not enough routing nodes to generate origin, destination, and stops."
          );

          return;

        }


        // ----------------------------------------------------------
        // Shuffle routing nodes
        // ----------------------------------------------------------

        const shuffled =
          [...nodeEntries]
            .sort(
              () =>
                Math.random() - 0.5
            );


        const selected =
          shuffled.slice(
            0,
            totalRequiredNodes
          );


        // ----------------------------------------------------------
        // Helper:
        // convert routing node into the common location structure
        // ----------------------------------------------------------

        const makeLocation = (
          nodeId,
          node
        ) => {

          const roadId =
            getRoadIdForNode(
              nodeId,
              node
            );


          return {

            nodeId:
              String(
                nodeId
              ),

            roadId,

            lat:
              Number(
                node.lat
              ),

            lng:
              Number(
                node.lon
              ),

          };

        };


        // ----------------------------------------------------------
        // Origin
        // ----------------------------------------------------------

        const [
          originNodeEntry,
          ...remainingEntries
        ] = selected;


        const [
          originId,
          originNode
        ] = originNodeEntry;


        const newOrigin =
          makeLocation(
            originId,
            originNode
          );


        // ----------------------------------------------------------
        // Destination
        // ----------------------------------------------------------

        const destinationNodeEntry =
          remainingEntries[
            remainingEntries.length - 1
          ];


        const [
          destinationId,
          destinationNode
        ] = destinationNodeEntry;


        const newDestination =
          makeLocation(
            destinationId,
            destinationNode
          );


        // ----------------------------------------------------------
        // Intermediate stops
        // ----------------------------------------------------------

        const stopEntries =
          remainingEntries.slice(
            0,
            -1
          );


        const newWaypoints =
          stopEntries.map(
            (
              [
                nodeId,
                node
              ],
              index
            ) => {

              return {

                ...makeLocation(
                  nodeId,
                  node
                ),

                stopIndex:
                  index + 1,

              };

            }
          );


        // ----------------------------------------------------------
        // Update parent state
        // ----------------------------------------------------------

        setOrigin({
          lat:
            newOrigin.lat,

          lng:
            newOrigin.lng,

          roadId:
            newOrigin.roadId,
        });


        setOriginNodeId(
          newOrigin.nodeId
        );


        setDestination({
          lat:
            newDestination.lat,

          lng:
            newDestination.lng,

          roadId:
            newDestination.roadId,
        });


        setDestinationNodeId(
          newDestination.nodeId
        );


        setWaypoints(
          newWaypoints
        );


        // ----------------------------------------------------------
        // Clear previous optimisation result
        // ----------------------------------------------------------

        setRouteResult(
          null
        );


        setMetrics({

          runtimeMs:
            null,

          bestCost:
            null,

          improvement:
            null,

          iterationsCompleted:
            null,

        });

      };

  // ============================================================
  // ========= Road Mapping from Points =======================

        const getRoadIdForNode = (
        nodeId,
        node
      ) => {

        // ----------------------------------------------------------
        // First try:
        // road information stored directly on routing node
        // ----------------------------------------------------------

        const directRoadId =
          node?.roadId ??
          node?.road_id ??
          node?.roadID ??
          null;


        if (
          directRoadId !== null &&
          directRoadId !== undefined
        ) {

          return String(
            directRoadId
          );

        }


        // ----------------------------------------------------------
        // Second try:
        // find an incident edge connected to this node
        // ----------------------------------------------------------

        const edgeEntries =
          Object.entries(
            routingGraph?.edges ?? {}
          );


        for (
          const [
            edgeId,
            edge
          ]
          of edgeEntries
        ) {

          const fromId =
            String(
              edge?.from ??
              edge?.source ??
              edge?.u ??
              ""
            );


          const toId =
            String(
              edge?.to ??
              edge?.target ??
              edge?.v ??
              ""
            );


          if (
            fromId === String(nodeId) ||
            toId === String(nodeId)
          ) {

            const roadId =
              edge?.roadId ??
              edge?.road_id ??
              edge?.roadID ??
              edge?.properties?.road_id ??
              edge?.properties?.roadId ??
              null;


            if (
              roadId !== null &&
              roadId !== undefined
            ) {

              return String(
                roadId
              );

            }

          }

        }


        return null;

      };

  // ============================================================
  // Run optimisation
  //
  // Placeholder UI implementation.
  // Real ACO / SA / GA will go into step2.logic.js later.
  // ============================================================

  const handleRunOptimisation =
        async () => {

          // ==========================================================
          // Validate optimisation problem
          // ==========================================================

          if (
            !originNodeId ||
            !destinationNodeId ||
            !waypoints ||
            waypoints.length < 1
          ) {

            console.warn(
              "Origin, destination, and at least one intermediate stop are required."
            );

            return;

          }


          setIsRunning(
            true
          );


          try {

            // ========================================================
            // Build complete optimisation stop list
            //
            // Origin
            //   ↓
            // intermediate stops
            //   ↓
            // Destination
            // ========================================================

            const stopNodeIds = [

              String(
                originNodeId
              ),

              ...waypoints.map(
                (waypoint) =>
                  String(
                    waypoint.nodeId
                  )
              ),

              String(
                destinationNodeId
              ),

            ];


            // ========================================================
            // Start performance timer
            // ========================================================

            const start =
              performance.now();


            // ========================================================
            // Run selected optimisation algorithm
            // ========================================================

            let optimisationResult;


            if (
              selectedAlgorithm === "aco"
            ) {

              optimisationResult =
                await antColonyOptimization({

                  routingGraph,

                  stopNodeIds,

                  originNodeId:
                    String(
                      originNodeId
                    ),

                  destinationNodeId:
                    String(
                      destinationNodeId
                    ),

                  waypointNodeIds:
                    waypoints.map(
                      (waypoint) =>
                        String(
                          waypoint.nodeId
                        )
                    ),

                  iterations,

                });

            }

            else {

              console.warn(
                `Unsupported optimisation algorithm: ${selectedAlgorithm}`
              );

              return;

            }


            // ========================================================
            // Stop performance timer
            // ========================================================

            const end =
              performance.now();


            const runtimeMs =
              end - start;


            // ========================================================
            // Construct result for RoutingMap
            // ========================================================

            const result = {

              algorithm:
                selectedAlgorithm,

              originNodeId:
                String(
                  originNodeId
                ),

              destinationNodeId:
                String(
                  destinationNodeId
                ),

              waypointNodeIds:
                waypoints.map(
                  (waypoint) =>
                    String(
                      waypoint.nodeId
                    )
                ),


              // ------------------------------------------------------
              // Best visiting sequence produced by ACO
              // ------------------------------------------------------

              tourNodeIds:
                optimisationResult
                  ?.tourNodeIds ??
                optimisationResult
                  ?.bestTour ??
                [],


              // ------------------------------------------------------
              // Full road-network route
              //
              // RoutingMap already understands nodeIds / edgeIds.
              // ------------------------------------------------------

              nodeIds:
                optimisationResult
                  ?.nodeIds ??
                [],

              edgeIds:
                optimisationResult
                  ?.edgeIds ??
                [],


              // ------------------------------------------------------
              // Optimisation performance
              // ------------------------------------------------------

              cost:
                optimisationResult
                  ?.cost ??
                optimisationResult
                  ?.bestCost ??
                null,

              runtimeMs,

              iterations:
                optimisationResult
                  ?.iterationsCompleted ??
                iterations,


              // Optional convergence history for later visualisation

              history:
                optimisationResult
                  ?.history ??
                [],


              version:
                Date.now(),

            };


            // ========================================================
            // Update map
            // ========================================================

            setRouteResult(
              result
            );


            // ========================================================
            // Update metrics
            // ========================================================

            setMetrics({

              runtimeMs:
                result.runtimeMs,

              bestCost:
                result.cost,

              improvement:
                optimisationResult
                  ?.improvement ??
                null,

              iterationsCompleted:
                result.iterations,

            });

          }

          catch (
            error
          ) {

            console.error(
              "ACO optimisation failed:",
              error
            );

          }

          finally {

            setIsRunning(
              false
            );

          }

        };


        // ============================================================
        // Send current ACO frame to Leaflet
        // ============================================================

        useEffect(
          () => {

            if (
              !currentAnimationFrame
            ) {

              return;

            }


            setAnimationRouteResult?.({

              algorithm:
                "aco",

              animation:
                true,

              iteration:
                currentAnimationFrame
                  .iteration,

              totalIterations:
                currentAnimationFrame
                  .totalIterations,

              cost:
                currentAnimationFrame
                  .bestCost,

              bestTour:
                currentAnimationFrame
                  .bestTour,

              nodeIds:
                currentAnimationFrame
                  .bestRouteNodeIds ??
                [],

              edgeIds:
                currentAnimationFrame
                  .bestRouteEdgeIds ??
                [],

              version:
                Date.now(),

            });

          },
          [
            currentAnimationFrame,
            setAnimationRouteResult,
          ]
        );
  // ============================================================
  // Render
  // ============================================================

  return (

    <div
      dir={direction}
      className="
        flex
        w-full
        flex-col
      "
    >

      {/* ======================================================
          Introduction
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200
          p-3
        "
      >

        <div
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-sky-600
          "
        >
          {
            t.stepLabel
          }
        </div>


        <h2
          className="
            mt-1
            text-lg
            font-semibold
            text-slate-900
          "
        >
          {
            t.title
          }
        </h2>


        <p
          className="
            mt-1
            text-sm
            leading-5
            text-slate-600
          "
        >
          {
            t.description
          }
        </p>

      </section>


      {/* ======================================================
          Number of stops
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200
          p-3
        "
      >

        <label
          htmlFor="number-of-stops"
          className="
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {
            t.numberOfStops
          }
        </label>


        <div
          className="
            mt-1
            flex
            items-center
            gap-2
          "
        >

          <input

            id="number-of-stops"

            type="number"

            min="3"

            max="15"

            value={
              numberOfStops
            }

            onChange={
              (event) =>
                setNumberOfStops(
                  Number(
                    event.target.value
                  )
                )
            }

            className="
              min-w-0
              flex-1
              rounded
              border
              border-slate-300
              px-2
              py-2
              text-sm
            "
          />


          <button

            type="button"

            onClick={
              handleGenerateStops
            }

            className="
              rounded
              bg-sky-600
              px-3
              py-2
              text-sm
              font-medium
              text-white
              hover:bg-sky-700
            "
          >
            {
              t.generateStops
            }
          </button>

        </div>


        <p
          className="
            mt-2
            text-xs
            leading-5
            text-slate-500
          "
        >
          {
            t.stopHint
          }
        </p>



      </section>




      {/* ======================================================
          Algorithm
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200
          p-3
        "
      >

        <label
          htmlFor="tsp-algorithm"
          className="
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {
            t.algorithm
          }
        </label>


        <select

          id="tsp-algorithm"

          value={
            selectedAlgorithm
          }

          onChange={
            (event) =>
              setSelectedAlgorithm(
                event.target.value
              )
          }

          className="
            mt-1
            w-full
            rounded
            border
            border-slate-300
            bg-white
            px-2
            py-2
            text-sm
          "
        >

          <option value="nearest-neighbour">
            {
              t.nearestNeighbour
            }
          </option>

          <option value="aco">
            {
              t.aco
            }
          </option>

          <option value="sa">
            {
              t.sa
            }
          </option>

          <option value="ga">
            {
              t.ga
            }
          </option>

        </select>

      </section>


      {/* ======================================================
          Iterations
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200
          p-3
        "
      >

        <label
          htmlFor="iterations"
          className="
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {
            t.iterations
          }
        </label>


        <input

          id="iterations"

          type="number"

          min="1"

          max="1000"

          value={
            iterations
          }

          onChange={
            (event) =>
              setIterations(
                Number(
                  event.target.value
                )
              )
          }

          className="
            mt-1
            w-full
            rounded
            border
            border-slate-300
            px-2
            py-2
            text-sm
          "
        />

      </section>


      {/* ======================================================
          Run optimisation
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200
          p-3
        "
      >

        <button

          type="button"

          onClick={
            handleRunOptimisation
          }

          disabled={
            !waypoints ||
            waypoints.length < 2 ||
            isRunning
          }

          className="
            w-full
            rounded
            bg-emerald-600
            px-3
            py-2
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-emerald-700
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >

          {
            isRunning
              ? t.running
              : `▶ ${t.run}`
          }

        </button>


        <p
          className="
            mt-2
            text-xs
            leading-5
            text-slate-500
          "
        >
          {
            t.animationHint
          }
        </p>

      </section>


      {/* ======================================================
          Animation
      ====================================================== */}


      <section
        className="
          grid
          grid-cols-2
          gap-2
          p-3
        "
      >
          <div
              className="
                mt-3
                rounded-lg
                border
                border-slate-200
                p-3
              "
            >

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  ACO Search Animation
                </span>


                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >

                  Iteration{" "}

                  {
                    currentAnimationFrame
                      ?.iteration ??
                    0
                  }

                  {" / "}

                  {
                    animationFrames.length
                  }

                </span>

              </div>


              <div
                className="
                  grid
                  grid-cols-4
                  gap-2
                "
              >

                <button
                  type="button"
                  onClick={
                    handlePreviousIteration
                  }
                  className="
                    rounded
                    border
                    border-slate-300
                    px-2
                    py-1
                    text-sm
                  "
                >
                  ◀
                </button>


                <button
                  type="button"
                  onClick={
                    isAnimating
                      ? handlePauseAnimation
                      : handlePlayAnimation
                  }
                  className="
                    rounded
                    bg-sky-600
                    px-2
                    py-1
                    text-sm
                    text-white
                  "
                >

                  {
                    isAnimating
                      ? "Pause"
                      : "Play"
                  }

                </button>


                <button
                  type="button"
                  onClick={
                    handleNextIteration
                  }
                  className="
                    rounded
                    border
                    border-slate-300
                    px-2
                    py-1
                    text-sm
                  "
                >
                  ▶
                </button>


                <button
                  type="button"
                  onClick={
                    handleResetAnimation
                  }
                  className="
                    rounded
                    border
                    border-slate-300
                    px-2
                    py-1
                    text-sm
                  "
                >
                  Reset
                </button>

              </div>

            </div>

            <input

              type="range"

              min={
                0
              }

              max={
                Math.max(
                  animationFrames.length - 1,
                  0
                )
              }

              value={
                animationFrameIndex
              }

              onChange={
                event => {

                  setIsAnimating(
                    false
                  );


                  setAnimationFrameIndex(
                    Number(
                      event.target.value
                    )
                  );

                }
              }

              className="
                mt-3
                w-full
              "

            />

      </section>
      {/* ======================================================
          Metrics
      ====================================================== */}

      <section
        className="
          grid
          grid-cols-2
          gap-2
          p-3
        "
      >

        <Metric
          label={
            t.runtime
          }
          value={
            metrics.runtimeMs != null
              ? `${metrics.runtimeMs.toFixed(2)} ms`
              : "—"
          }
        />


        <Metric
          label={
            t.bestCost
          }
          value={
            metrics.bestCost ??
            "—"
          }
        />


        <Metric
          label={
            t.iterationsCompleted
          }
          value={
            metrics.iterationsCompleted ??
            "—"
          }
        />


        <Metric
          label={
            t.improvement
          }
          value={
            metrics.improvement ??
            "—"
          }
        />

      </section>

    </div>

  );

}


// ============================================================
// Metric
// ============================================================

function Metric({
  label,
  value,
}) {

  return (

    <div
      className="
        rounded
        bg-slate-50
        p-2
        ring-1
        ring-slate-200
      "
    >

      <div
        className="
          text-[11px]
          text-slate-500
        "
      >
        {
          label
        }
      </div>


      <div
        className="
          mt-1
          break-words
          text-sm
          font-semibold
          text-slate-800
        "
      >
        {
          value
        }
      </div>

    </div>

  );

}