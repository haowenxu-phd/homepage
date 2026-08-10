import React, {
  useState,
} from "react";

import text
from "./step3.json";


export default function Step3DynamicRouting({
  language,

  roadNodes,
  roadEdges,
  routingGraph,

  origin,
  destination,

  originNodeId,
  destinationNodeId,

  closedEdgeIds,
  setClosedEdgeIds,

  edgeWeightMode,
  setEdgeWeightMode,

  searchState,
  setSearchState,

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
  // Local state
  // ============================================================

  const [
    congestionLevel,
    setCongestionLevel,
  ] = useState("medium");


  const [
    isRunning,
    setIsRunning,
  ] = useState(false);


  // ============================================================
  // Clear closures
  // ============================================================

  const handleClearClosures = () => {

    setClosedEdgeIds(
      []
    );


    setSearchState(
      null
    );


    setRouteResult(
      null
    );

  };


  // ============================================================
  // Run dynamic routing
  //
  // Placeholder for now.
  // Later this will call real routing logic.
  // ============================================================

  const handleRunDynamicRouting =
    async () => {

      if (
        !origin ||
        !destination
      ) {

        return;

      }


      setIsRunning(
        true
      );


      const start =
        performance.now();


      // Placeholder
      await Promise.resolve();


      const end =
        performance.now();


      setSearchState({

        visitedNodeIds: [],

        visitedEdgeIds: [],

        version:
          Date.now(),

      });


      setRouteResult({

        runtimeMs:
          end - start,

        edgeIds: [],

        nodeIds: [],

        cost:
          null,

        version:
          Date.now(),

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
          Dynamic network instruction
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
            text-slate-700
          "
        >
          {
            t.roadClosure
          }
        </div>


        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-500
          "
        >
          {
            t.roadClosureHint
          }
        </p>


        <div
          className="
            mt-2
            rounded
            bg-slate-50
            p-2
            text-xs
            text-slate-600
            ring-1
            ring-slate-200
          "
        >

          {
            t.closedEdges
          }:

          {" "}

          {
            closedEdgeIds?.length ??
            0
          }

        </div>


        <button
          type="button"

          onClick={
            handleClearClosures
          }

          className="
            mt-2
            w-full
            rounded
            border
            border-slate-300
            px-3
            py-2
            text-sm
            font-medium
            text-slate-700
            hover:bg-slate-50
          "
        >
          {
            t.clearClosures
          }
        </button>

      </section>


      {/* ======================================================
          Routing objective
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200
          p-3
        "
      >

        <label
          htmlFor="dynamic-routing-weight"
          className="
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {
            t.routingObjective
          }
        </label>


        <select

          id="dynamic-routing-weight"

          value={
            edgeWeightMode
          }

          onChange={
            (event) =>
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
            {
              t.shortestDistance
            }
          </option>

          <option value="time">
            {
              t.shortestTime
            }
          </option>

          <option value="generalized-cost">
            {
              t.generalizedCost
            }
          </option>

        </select>

      </section>


      {/* ======================================================
          Congestion
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200
          p-3
        "
      >

        <label
          htmlFor="congestion-level"
          className="
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {
            t.congestion
          }
        </label>


        <select

          id="congestion-level"

          value={
            congestionLevel
          }

          onChange={
            (event) =>
              setCongestionLevel(
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

          <option value="light">
            {
              t.light
            }
          </option>

          <option value="medium">
            {
              t.medium
            }
          </option>

          <option value="heavy">
            {
              t.heavy
            }
          </option>

        </select>

      </section>


      {/* ======================================================
          Run
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
            handleRunDynamicRouting
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
            t.closedEdges
          }
          value={
            closedEdgeIds?.length ??
            0
          }
        />


        <Metric
          label={
            t.runtime
          }
          value={
            routeResult?.runtimeMs != null
              ? `${Number(
                  routeResult.runtimeMs
                ).toFixed(2)} ms`
              : "—"
          }
        />


        <Metric
          label={
            t.routeCost
          }
          value={
            routeResult?.cost ??
            "—"
          }
        />


        <Metric
          label={
            t.objective
          }
          value={
            edgeWeightMode
          }
        />

      </section>

    </div>

  );

}


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