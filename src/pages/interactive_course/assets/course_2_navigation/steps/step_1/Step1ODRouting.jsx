// Step1ODRouting.jsx

import React, { useState } from "react";

import text from "./step1.json";

import {
  generateRandomOD,
  runRoutingDemo,
  snapPointToRoutingGraph,
} from "./step1.logic";


 

 

// ============================================================
// This is a play function
// ============================================================
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}


// ============================================================
// Highlight Origin / Destination words inside description
// ============================================================


function HighlightODDescription({
  description,
  language,
}) {

  if (!description) {
    return null;
  }


  // ----------------------------------------------------------
  // Prefer translated terms if they exist in step1.json.
  //
  // If step1.json later contains:
  //
  // "originWord": "origin"
  // "destinationWord": "destination"
  //
  // you can pass those instead.
  //
  // For now these are fallback terms.
  // ----------------------------------------------------------

  const terms = {

    en: {
      origin: "origin",
      destination: "destination",
    },

    zh: {
      origin: "起点",
      destination: "终点",
    },

    fa: {
      origin: "مبدأ",
      destination: "مقصد",
    },

  };


  const current =
    terms[language] ??
    terms.en;


  // ----------------------------------------------------------
  // Escape regex special characters
  // ----------------------------------------------------------

  const escapeRegex =
    (value) =>
      value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );


  const regex =
    new RegExp(
      `(${escapeRegex(current.origin)}|${escapeRegex(current.destination)})`,
      "gi"
    );


  const parts =
    description.split(regex);


  return (
    <>
      {
        parts.map(
          (part, index) => {

            const lower =
              part.toLowerCase();


            if (
              lower ===
              current.origin.toLowerCase()
            ) {

              return (
                <span
                  key={index}
                  className="
                    font-semibold
                    text-red-600
                  "
                >
                  {part}
                </span>
              );

            }


            if (
              lower ===
              current.destination.toLowerCase()
            ) {

              return (
                <span
                  key={index}
                  className="
                    font-semibold
                    text-blue-600
                  "
                >
                  {part}
                </span>
              );

            }


            return (
              <React.Fragment
                key={index}
              >
                {part}
              </React.Fragment>
            );

          }
        )
      }
    </>
  );

}


// ============================================================
// Step 1
// ============================================================

export default function Step1ODRouting({

  language,

  roadNodes,
  roadEdges,
  routingGraph,

  origin,
  destination,

  setOrigin,
  setDestination,

  originNodeId,
  destinationNodeId,

  setOriginNodeId,
  setDestinationNodeId,

  selectedAlgorithm,
  setSelectedAlgorithm,

  edgeWeightMode,
  setEdgeWeightMode,

  searchState,
  setSearchState,

  routeResult,
  setRouteResult,

}) {

  // ==========================================================
  // Translation
  // ==========================================================

  const t =
    text?.[language] ??
    text.en;


  const direction =
    language === "fa"
      ? "rtl"
      : "ltr";


  // ==========================================================
  // Local UI state
  // ==========================================================

 
  const [
    isRunning,
    setIsRunning,
  ] = useState(false);

  // ==========================================================
  // Previous completed routing result
  //
  // Used to compare the latest run against the immediately
  // preceding run.
  // ==========================================================

  const [
    previousRouteResult,
    setPreviousRouteResult,
  ] = useState(null);


  // ==========================================================
  // Generate random OD
  // ==========================================================

  const handleRandomOD = () => {

    const result =
      generateRandomOD({

        roadNodes,
        roadEdges,
        routingGraph,

      });


    if (!result) {

      console.warn(
        "Could not generate random OD."
      );

      return;

    }


    // --------------------------------------------------------
    // Set Origin
    // --------------------------------------------------------

    setOrigin(
      result.origin
    );


    // --------------------------------------------------------
    // Set Destination
    // --------------------------------------------------------

    setDestination(
      result.destination
    );


    // --------------------------------------------------------
    // Set graph node IDs
    // --------------------------------------------------------

    setOriginNodeId?.(
      result.originNodeId ??
      null
    );


    setDestinationNodeId?.(
      result.destinationNodeId ??
      null
    );


    // --------------------------------------------------------
    // Clear previous route/search animation
    // --------------------------------------------------------

    setSearchState(
      null
    );


    setRouteResult(
      null
    );

 


    setPreviousRouteResult(
      null
    );



  };


  // ==========================================================
  // Run navigation algorithm
  // ==========================================================

  // ============================================================
// Run navigation algorithm
// ============================================================
const handlePlay = async () => {

  if (
    !origin ||
    !destination
  ) {

    console.warn(
      "Origin and destination are required."
    );

    return;

  }


  if (
    !routingGraph
  ) {

    console.warn(
      "Routing graph is not available."
    );

    return;

  }


  setIsRunning(
    true
  );


  try {

    // ========================================================
    // 1. Snap Origin marker to road graph
    // ========================================================

    const snappedOrigin =
      snapPointToRoutingGraph({

        point:
          origin,

        roadEdges,

        routingGraph,

      });


    // ========================================================
    // 2. Snap Destination marker to road graph
    // ========================================================

    const snappedDestination =
      snapPointToRoutingGraph({

        point:
          destination,

        roadEdges,

        routingGraph,

      });


    if (
      !snappedOrigin ||
      !snappedDestination
    ) {

      console.error(
        "Could not snap Origin / Destination to routing graph."
      );

      return;

    }


    // ========================================================
    // 3. Extract graph node IDs
    // ========================================================

    const resolvedOriginNodeId =
      String(
        snappedOrigin.nodeId
      );


    const resolvedDestinationNodeId =
      String(
        snappedDestination.nodeId
      );


    console.log(
      "Origin routing node:",
      resolvedOriginNodeId
    );


    console.log(
      "Destination routing node:",
      resolvedDestinationNodeId
    );


    // ========================================================
    // 4. Store node IDs
    // ========================================================

    setOriginNodeId?.(
      resolvedOriginNodeId
    );


    setDestinationNodeId?.(
      resolvedDestinationNodeId
    );


    // ========================================================
    // 5. Clear previous animation / route
    // ========================================================
      if (
        routeResult
      ) {

        setPreviousRouteResult(
          routeResult
        );

      }


      // Clear current metrics + final route highlight
      setRouteResult(
        null
      );


      // Clear visited/search highlighting
      setSearchState(
        null
      );


    // ========================================================
    // 6. Run selected routing algorithm
    //
    // IMPORTANT:
    // runRoutingDemo should return result immediately here.
    // It should NOT perform its own animation loop anymore.
    // ========================================================
      console.log(
        "Running algorithm:",
        selectedAlgorithm
      );


      const result =
        await runRoutingDemo({

          routingGraph,

          originNodeId:
            resolvedOriginNodeId,

          destinationNodeId:
            resolvedDestinationNodeId,

          algorithm:
            selectedAlgorithm,

          weightMode:
            edgeWeightMode,

        });


      if (
        !result
      ) {

        console.warn(
          "Routing algorithm returned no result."
        );

        return;

      }


      console.log(
        "Routing result:",
        result
      );



    // ========================================================
    // 7. Validate iteration history
    // ========================================================

    const iterations =
      Array.isArray(
        result.iterations
      )
        ? result.iterations
        : [];


    if (
      iterations.length === 0
    ) {

      console.warn(
        "Routing result contains no iteration history."
      );


      if (
        routeResult
      ) {

        setPreviousRouteResult(
          routeResult
        );

      }


      setRouteResult(
        result
      );


      return;

    }



    // ========================================================
    // 8. Play iteration animation ONCE
    //
    // 500 ms = 0.5 seconds per iteration
    // ========================================================

          
      for (
        let i = 0;
        i < iterations.length;
        i++
      ) {

        const iteration =
          iterations[i];


        setSearchState?.({

          algorithm:
            selectedAlgorithm,

          iteration:
            iteration.iteration,

          currentNodeId:
            iteration.currentNodeId,

          currentCost:
            iteration.currentCost,

          visitedNodeIds:
            iteration.visitedNodeIds ??
            [],

          visitedEdgeIds:
            iteration.visitedEdgeIds ??
            [],

          frontierNodeIds:
            iteration.frontierNodeIds ??
            [],

          relaxedEdges:
            iteration.relaxedEdges ??
            [],

          destinationReached:
            iteration.destinationReached ??
            false,

          isComplete:
            false,

          version:
            Date.now(),

        });


        await delay(
          5
        );

      }

 


    // ========================================================
    // 9. Animation finished
    //
    // Now show final route
    // ========================================================
      /*
    if (
        routeResult
      ) {

        setPreviousRouteResult(
          routeResult
        );

      }*/


    setRouteResult(
      result
    );



    setSearchState?.({

      algorithm:
        selectedAlgorithm,

      iteration:
        iterations.length - 1,

      currentNodeId:
        resolvedDestinationNodeId,

      visitedNodeIds:
        iterations[
          iterations.length - 1
        ]?.visitedNodeIds ??
        [],

      visitedEdgeIds:
        iterations[
          iterations.length - 1
        ]?.visitedEdgeIds ??
        [],

      frontierNodeIds:
        [],

      relaxedEdges:
        [],

      destinationReached:
        result.found === true,

      isComplete:
        true,

      version:
        Date.now(),

    });


    console.log(
      "Animation complete."
    );

  }
  catch (
    error
  ) {

    console.error(
      "Routing demo failed:",
      error
    );

  }
  finally {

    // ========================================================
    // Always re-enable Play button
    // ========================================================

    setIsRunning(
      false
    );

  }

};


  // ==========================================================
  // Metrics
  // ==========================================================

        const runtimeText =
        routeResult?.runtimeMs != null
          ? `${Number(
              routeResult.runtimeMs
            ).toFixed(2)} ms`
          : "—";


      const visitedText =
        routeResult?.nodesVisited != null
          ? routeResult.nodesVisited
          : "—";


      const routeCostText =
        routeResult?.cost != null
          ? routeResult.cost
          : "—";

   

  const complexityText =
    (() => {

      switch (
        selectedAlgorithm
      ) {

        case "dijkstra":

          return "O((V + E) log V)";
        
        case "dijkstra_2way":

          return "O((V + E) log V)";


        case "astar":

          return "Heuristic-dependent";


        case "bfs":

          return "O(V + E)";


        default:

          return "—";

      }

    })();


  // ==========================================================
  // Coordinate helpers
  // ==========================================================

  const formatCoordinate =
    (value) => {

      const number =
        Number(value);


      if (
        !Number.isFinite(number)
      ) {

        return "—";

      }


      return number.toFixed(5);

    };


  // ==========================================================
  // Render
  // ==========================================================

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
          Step introduction
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


        <h4
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

        </h4>


        <p
          className="
            mt-1
            text-sm
            leading-5
            text-slate-600
          "
        >

          <HighlightODDescription
            description={
              t.description
            }
            language={
              language
            }
          />

        </p>

      </section>


      {/* ======================================================
          Random OD
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
            handleRandomOD
          }

          className="
            w-full
            rounded
            bg-sky-600
            px-3
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-sky-700
          "
        >

          {
            t.randomOD
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
            t.dragHint
          }

        </p>


        {/* ----------------------------------------------------
            Current OD status
        ----------------------------------------------------- */}

        {/* ======================================================
            Origin + Destination
        ====================================================== */}

        <div
          className="
            flex
            w-full
            flex-nowrap
            items-center
            gap-6
            text-sm
          "
        >

          {/* ==================================================
              Origin
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-1
              flex-nowrap
              items-center
              gap-2
            "
          >

            {/* Small red indicator */}

            <span
              className="
                h-2.5
                w-2.5
                shrink-0
                rounded-full
                bg-red-600
              "
            />


            {/* Origin label */}

            <span
              className="
                shrink-0
                font-semibold
                text-red-600
              "
            >
              O:
            </span>


            {/* Origin coordinates */}

            <span
              className="
                min-w-0
                truncate
                whitespace-nowrap
                text-slate-500
              "
            >
              {
                origin
                  ? `${formatCoordinate(
                      origin.lat
                    )}, ${formatCoordinate(
                      origin.lng
                    )}`
                  : t.notSet
              }
            </span>

          </div>


          {/* ==================================================
              Destination
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-1
              flex-nowrap
              items-center
              gap-2
            "
          >

            {/* Small blue indicator */}

            <span
              className="
                h-2.5
                w-2.5
                shrink-0
                rounded-full
                bg-blue-600
              "
            />


            {/* Destination label */}

            <span
              className="
                shrink-0
                font-semibold
                text-blue-600
              "
            >
              D:
            </span>


            {/* Destination coordinates */}

            <span
              className="
                min-w-0
                truncate
                whitespace-nowrap
                text-slate-500
              "
            >
              {
                destination
                  ? `${formatCoordinate(
                      destination.lat
                    )}, ${formatCoordinate(
                      destination.lng
                    )}`
                  : t.notSet
              }
            </span>

          </div>

        </div>

      </section>


     {/* ======================================================
    Routing objective + Navigation algorithm
====================================================== */}

<section
  className="
    grid
    grid-cols-1
    gap-3
    border-b
    border-slate-200
    p-3
    sm:grid-cols-2
  "
>

      {/* ====================================================
          Routing objective
      ==================================================== */}

      <div className="min-w-0">

        <label
          htmlFor="routing-weight"
          className="
            block
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {t.routingObjective}
        </label>


        <select
          id="routing-weight"

          value={edgeWeightMode}

          onChange={(event) =>
            setEdgeWeightMode(
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

          <option value="distance">
            {t.shortestDistance}
          </option>

          <option value="time">
            {t.shortestTime}
          </option>

        </select>

      </div>


      {/* ====================================================
          Navigation algorithm
      ==================================================== */}

      <div className="min-w-0">

        <label
          htmlFor="routing-algorithm"
          className="
            block
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {t.algorithm}
        </label>


        <select
          id="routing-algorithm"

          value={selectedAlgorithm}

          onChange={(event) =>
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

          <option value="dijkstra">
            Dijkstra
          </option>

          <option value="dijkstra_2way">
            Bidirectional Dijkstra
          </option>

          <option value="astar">
            A*
          </option>

          <option value="bfs">
            Breadth-First Search
          </option>

        </select>

      </div>

    </section>


      {/* ======================================================
          Play animation
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
            handlePlay
          }

          disabled={
            !origin ||
            !destination ||
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
              : `▶ ${t.play}`
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
            t.searchTime
          }

          value={
            routeResult?.runtimeMs
          }

          previousValue={
            previousRouteResult?.runtimeMs
          }

          formatter={
            (value) =>
              `${Number(value).toFixed(2)} ms`
          }
        />


        {/* ======================================================
            Nodes Visited
        ====================================================== */}

        <Metric
          label={
            t.nodesVisited
          }

          value={
            routeResult?.nodesVisited
          }

          previousValue={
            previousRouteResult?.nodesVisited
          }

          formatter={
            (value) =>
              Number(value).toLocaleString()
          }
        />


        {/* ======================================================
            Route Cost
        ====================================================== */}

        <Metric
          label={
            t.routeCost
          }

          value={
            routeResult?.cost
          }

          previousValue={
            previousRouteResult?.cost
          }

          formatter={
            (value) => {

              const number =
                Number(value);


              if (
                !Number.isFinite(
                  number
                )
              ) {

                return "∞";

              }


              return number.toFixed(
                2
              );

            }
          }
        />


        {/* ======================================================
            Computational Complexity
        ====================================================== */}

        <Metric
          label={
            t.complexity
          }

          value={
            complexityText
          }
        />

      </section>

    </div>

  );

}


  // ============================================================
  // Metric display
  // ============================================================
  function Metric({

    label,

    value,

    previousValue = null,

      formatter =
        (value) =>
          value,

    }) {

      // ==========================================================
      // Check values
      // ==========================================================

      const hasValue =
        value !== null &&
        value !== undefined;


      const hasPreviousValue =
        previousValue !== null &&
        previousValue !== undefined;


      // ==========================================================
      // Render
      // ==========================================================

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

          {/* ------------------------------------------------------
              Label
          ------------------------------------------------------ */}

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


          {/* ------------------------------------------------------
              Value
          ------------------------------------------------------ */}

          <div
            className="
              mt-1
              break-words
              text-sm
            "
          >

            {
              !hasValue
                ? (

                  <span
                    className="
                      font-semibold
                      text-slate-800
                    "
                  >
                    —
                  </span>

                )
                : (

                  <>

                    {/* ============================================
                        Current result
                    ============================================ */}

                    <span
                      className="
                        font-bold
                        text-slate-900
                      "
                    >

                      {
                        formatter(
                          value
                        )
                      }

                    </span>


                    {/* ============================================
                        Previous result
                    ============================================ */}

                    {
                      hasPreviousValue && (

                        <span
                          className="
                            ml-1.5
                            font-normal
                            text-slate-400
                          "
                        >

                          (
                          {
                            formatter(
                              previousValue
                            )
                          }
                          )

                        </span>

                      )
                    }

                  </>

                )
            }

          </div>

        </div>

      );

    }