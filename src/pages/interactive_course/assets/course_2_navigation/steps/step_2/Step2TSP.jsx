import React, {
  useState,
} from "react";

import text
from "./step2.json";


export default function Step2TSP({
  language,

  roadNodes,
  roadEdges,
  routingGraph,

  origin,
  destination,

  originNodeId,
  destinationNodeId,

  waypoints,
  setWaypoints,

  routeResult,
  setRouteResult,
}) {

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


    if (
      nodeEntries.length <
      numberOfStops
    ) {

      console.warn(
        "Not enough routing nodes to generate TSP stops."
      );

      return;

    }


    const shuffled =
      [...nodeEntries]
        .sort(
          () =>
            Math.random() - 0.5
        );


    const selected =
      shuffled.slice(
        0,
        numberOfStops
      );


    const newWaypoints =
      selected.map(
        ([nodeId, node]) => ({

          nodeId:
            String(
              nodeId
            ),

          lat:
            node.lat,

          lng:
            node.lon,

        })
      );


    setWaypoints(
      newWaypoints
    );


    setRouteResult(
      null
    );


    setMetrics({
      runtimeMs: null,
      bestCost: null,
      improvement: null,
      iterationsCompleted: null,
    });

  };


  // ============================================================
  // Run optimisation
  //
  // Placeholder UI implementation.
  // Real ACO / SA / GA will go into step2.logic.js later.
  // ============================================================

  const handleRunOptimisation =
    async () => {

      if (
        !waypoints ||
        waypoints.length < 2
      ) {

        return;

      }


      setIsRunning(
        true
      );


      const start =
        performance.now();


      // Temporary async pause
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            250
          )
      );


      const end =
        performance.now();


      const result = {

        algorithm:
          selectedAlgorithm,

        waypointNodeIds:
          waypoints.map(
            (waypoint) =>
              waypoint.nodeId
          ),

        runtimeMs:
          end - start,

        cost:
          null,

        edgeIds:
          [],

        nodeIds:
          [],

        version:
          Date.now(),

      };


      setRouteResult(
        result
      );


      setMetrics({

        runtimeMs:
          result.runtimeMs,

        bestCost:
          null,

        improvement:
          null,

        iterationsCompleted:
          iterations,

      });


      setIsRunning(
        false
      );

    };


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