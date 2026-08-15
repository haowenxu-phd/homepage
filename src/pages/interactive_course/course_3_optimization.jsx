import React, {
  useMemo,
  useState,
} from "react";


// ============================================================
// Course data
// ============================================================

import roadNodes
from "./assets/course_3_optimization/data/coogee_drive_nodes.json";

import roadEdges
from "./assets/course_3_optimization/data/coogee_drive_edges.json";

import routingGraph
from "./assets/course_3_optimization/data/coogee_routing_graph.json";


// ============================================================
// Shared components
// ============================================================

import RoutingMap
from "./assets/course_3_optimization/components/RoutingMap";

import WorkflowProgress
from "./assets/course_3_optimization/components/WorkflowProgress";


// ============================================================
// Step components
// ============================================================

/*import Step1ODRouting
from "./assets/course_2_navigation/steps/step_1/Step1ODRouting";*/

import Step1TourOptimization
from "./assets/course_3_optimization/steps/step_1/Step2TSP";

/*import Step3DynamicRouting
from "./assets/course_2_navigation/steps/step_3/Step3DynamicRouting";*/

import Step4Compare
from "./assets/course_2_navigation/steps/step_4/Step4Compare";


// ============================================================
// Course translation
// ============================================================

import text
from "./assets/course_3_optimization/trans/course.json";



export default function InteractiveLearning_c3_optimization() {

  // ============================================================
  // Course UI state
  // ============================================================

  const [
    language,
    setLanguage,
  ] = useState("en");


  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  const [
  animationRouteResult,
  setAnimationRouteResult,
] = useState(null);


  const totalSteps = 2;


  // ============================================================
  // Shared OD state
  //
  // Store coordinates here.
  // Later these can be snapped to routingGraph node IDs.
  // ============================================================

  const [
    origin,
    setOrigin,
  ] = useState(null);


  const [
    destination,
    setDestination,
  ] = useState(null);


  // ============================================================
  // Snapped routing-node IDs
  //
  // Keep these separate from geographic coordinates.
  // ============================================================

  const [
    originNodeId,
    setOriginNodeId,
  ] = useState(null);


  const [
    destinationNodeId,
    setDestinationNodeId,
  ] = useState(null);


  // ============================================================
  // Step 2 shared state
  // ============================================================

  const [
    waypoints,
    setWaypoints,
  ] = useState([]);


  // ============================================================
  // Routing algorithm
  // ============================================================

  const [
    selectedAlgorithm,
    setSelectedAlgorithm,
  ] = useState(
    "dijkstra"
  );


  const [
    edgeWeightMode,
    setEdgeWeightMode,
  ] = useState(
    "distance"
  );


  // ============================================================
  // Algorithm animation / search state
  // ============================================================

  const [
    searchState,
    setSearchState,
  ] = useState(null);


  // ============================================================
  // Final route result
  // ============================================================

  const [
    routeResult,
    setRouteResult,
  ] = useState(null);


  // ============================================================
  // Dynamic-network state
  // ============================================================

  const [
    closedEdgeIds,
    setClosedEdgeIds,
  ] = useState([]);


  // ============================================================
  // Translation
  // ============================================================

  const t =
    text?.[language] ??
    text.en;


  const textDirection =
    language === "fa"
      ? "rtl"
      : "ltr";


  // ============================================================
  // Workflow labels
  // ============================================================

  const workflowSteps =
    useMemo(
      () => [
 

        {
          id: 1,
          title:
            t.steps?.step2 ??
            "Optimise a Tour",
        },
        /*
        {
          id: 3,
          title:
            t.steps?.step3 ??
            "Respond to Change",
        },*/

        {
          id: 2,
          title:
            t.steps?.step4 ??
            "Compare & Apply",
        },

      ],
      [t]
    );


  // ============================================================
  // Previous step
  // ============================================================

  const goPrevious = () => {

    setCurrentStep(
      (step) =>
        Math.max(
          1,
          step - 1
        )
    );

  };


  // ============================================================
  // Next step
  // ============================================================

  const goNext = () => {

    setCurrentStep(
      (step) =>
        Math.min(
          totalSteps,
          step + 1
        )
    );

  };


  // ============================================================
  // Render current step
  // ============================================================

  const renderStep =
    () => {

      switch (
        currentStep
      ) {

        // ======================================================
        // STEP 1
        // OD + Dijkstra / A*
        // ======================================================

       

        // ======================================================
        // STEP 2
        // TSP / ACO / optimisation
        // ======================================================
        
        case 1:

          return (

            <Step1TourOptimization

                              
                  language={
                    language
                  }

                  routingGraph={
                    routingGraph
                  }


                  origin={
                    origin
                  }

                  setOrigin={
                    setOrigin
                  }

                  originNodeId={
                    originNodeId
                  }

                  setOriginNodeId={
                    setOriginNodeId
                  }


                  destination={
                    destination
                  }

                  setDestination={
                    setDestination
                  }

                  destinationNodeId={
                    destinationNodeId
                  }

                  setDestinationNodeId={
                    setDestinationNodeId
                  }


                  waypoints={
                    waypoints
                  }

                  setWaypoints={
                    setWaypoints
                  }


                  routeResult={
                    routeResult
                  }

                  setRouteResult={
                    setRouteResult
                  }

                   setAnimationRouteResult={
                      setAnimationRouteResult
                    }


            />

          );


        // ======================================================
        // STEP 3
        // Dynamic network / road closure / weighted routing
        // ======================================================

         

        // ======================================================
        // STEP 4
        // Compare algorithms
        // ======================================================

        case 2:

          return (

            <Step4Compare

              language={
                language
              }

              selectedAlgorithm={
                selectedAlgorithm
              }

              edgeWeightMode={
                edgeWeightMode
              }

               routeResult={
                animationRouteResult ??
                routeResult
              }

              routingGraphMetadata={
                routingGraph?.metadata
              }

            />

          );


        default:

          return null;

      }

    };


  // ============================================================
  // Render page
  // ============================================================

  return (

    <main
      className="
        w-full
        bg-white
        px-3
        py-3
      "
    >

      {/* ======================================================
          Header
      ====================================================== */}

      <section
        className="
          grid
          grid-cols-[minmax(0,1fr)_120px]
          gap-2
        "
      >

        {/* Course title */}

        <div
          className="
            flex
            items-center
            justify-center
            border
            border-sky-400
            px-3
            py-2
          "
        >

          <h2
            dir={
              textDirection
            }
            className="
              text-center
              text-2xl
              font-semibold
              text-slate-900
            "
          >

            {
              t.courseTitle
            }

          </h2>

        </div>


        {/* Language */}

        <div
          className="
            flex
            flex-col
            justify-center
            border
            border-sky-400
            px-2
            py-1
          "
        >

          <label
            htmlFor="navigation-language"
            className="
              mb-1
              text-xs
              text-slate-500
            "
          >

            {
              t.language
            }

          </label>


          <select

            id="navigation-language"

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
              rounded
              border
              border-slate-300
              bg-white
              px-2
              py-1
              text-sm
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

        </div>

      </section>


      {/* ======================================================
          Introduction
      ====================================================== */}

      <section
        className="
          mt-2
          border
          border-sky-400
          px-3
          py-2
        "
      >

        <p
          dir={
            textDirection
          }
          className="
            text-center
            text-sm
            leading-5
            text-slate-700
          "
        >

          {
            t.introduction
          }

        </p>

      </section>


      {/* ======================================================
          Workflow progress
      ====================================================== */}
      <section
          className="
            border-t
            border-slate-200
            px-2
            py-2
          "
        >

          <div
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  p-3
                "
              >

                <div
                  className="
                    grid
                    w-full
                    grid-cols-2
                    gap-3

                    lg:grid-cols-[auto_minmax(0,1fr)_auto]
                    lg:items-center
                  "
                >

                  {/* ==================================================
                      Workflow Progress

                      Mobile:
                      occupies the entire first row

                      Desktop:
                      occupies the middle column
                  ================================================== */}

                  <div
                    className="
                      col-span-2
                      min-w-0
                      w-full

                      lg:col-span-1
                      lg:col-start-2
                      lg:row-start-1
                    "
                  >

                    <WorkflowProgress
                      currentStep={
                        currentStep
                      }

                      steps={
                        workflowSteps
                      }

                      language={
                        language
                      }
                    />

                  </div>


                  {/* ==================================================
                      Previous Step
                  ================================================== */}

                  <button
                    type="button"

                    onClick={
                      goPrevious
                    }

                    disabled={
                      currentStep === 1
                    }

                    className="
                      col-start-1
                      row-start-2
                      w-full
                      whitespace-nowrap
                      rounded
                      border
                      border-slate-300
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-slate-700
                      transition

                      hover:bg-slate-50

                      disabled:cursor-not-allowed
                      disabled:opacity-40

                      lg:col-start-1
                      lg:row-start-1
                      lg:w-auto
                    "
                  >

                    ← {t.previous}

                  </button>


                  {/* ==================================================
                      Next Step
                  ================================================== */}

                  <button
                    type="button"

                    onClick={
                      goNext
                    }

                    disabled={
                      currentStep ===
                      totalSteps
                    }

                    className="
                      col-start-2
                      row-start-2
                      w-full
                      whitespace-nowrap
                      rounded
                      bg-sky-600
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-white
                      transition

                      hover:bg-sky-700

                      disabled:cursor-not-allowed
                      disabled:opacity-40

                      lg:col-start-3
                      lg:row-start-1
                      lg:w-auto
                    "
                  >

                    {t.next} →

                  </button>

                </div>

              </div>

        </section>
      


      {/* ======================================================
    Main learning interface

    Desktop:
    ~45% control panel
    ~55% Leaflet map

    Mobile:
    stacked vertically
====================================================== */}

      <section
        className="
          mt-2
          grid
          grid-cols-1
          gap-2
          lg:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.1fr)]
        "
      >

        {/* ====================================================
            Step control panel
        ===================================================== */}

        <aside
          className="
            flex
            h-[620px]
            flex-col
            overflow-hidden
            border
            border-sky-400
            bg-white
          "
        >

          {/* Current step content */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
            "
          >

            { 
         
              renderStep()
            }

          </div>


          

        </aside>


        {/* ====================================================
            Shared persistent Leaflet map
        ===================================================== */}

          <div
            className="
              flex
              h-[620px]
              min-w-0
              flex-col
              overflow-hidden
              border
              border-sky-400
              bg-white
            "
          >

          {/* Map header */}

          <div
            className="
              shrink-0
              border-b
              border-slate-200
              px-3
              py-2
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <h4
                dir={
                  textDirection
                }
                className="
                  text-base
                  font-semibold
                  text-slate-900
                "
              >

                {
                  t.mapTitle
                }

              </h4>


              {/* Optional network stats */}

              <div
                className="
                  text-xs
                  text-slate-500
                "
              >

                {
                  routingGraph
                    ?.metadata
                    ?.node_count ??
                  "—"
                }

                {" nodes · "}

                {
                  routingGraph
                    ?.metadata
                    ?.edge_count ??
                  "—"
                }

                {" directed edges"}

              </div>

            </div>

          </div>


          {/* Leaflet */}

          <div
            className="
              min-h-0
              flex-1
            "
          >

            <RoutingMap

              // ---------------------------------------------
              // Geographic display data
              // ---------------------------------------------

              roadNodes={
                roadNodes
              }

              roadEdges={
                roadEdges
              }

              



              // ---------------------------------------------
              // Routing graph
              // ---------------------------------------------

              routingGraph={
                routingGraph
              }


              // ---------------------------------------------
              // Current workflow
              // ---------------------------------------------

              currentStep={
                currentStep
              }


              // ---------------------------------------------
              // OD geographic coordinates
              // ---------------------------------------------

              origin={
                origin
              }

              destination={
                destination
              }

              setOrigin={
                setOrigin
              }

              setDestination={
                setDestination
              }


              // ---------------------------------------------
              // OD routing IDs
              // ---------------------------------------------

              originNodeId={
                originNodeId
              }

              destinationNodeId={
                destinationNodeId
              }

              setOriginNodeId={
                setOriginNodeId
              }

              setDestinationNodeId={
                setDestinationNodeId
              }


              // ---------------------------------------------
              // Step 2
              // ---------------------------------------------

              waypoints={
                waypoints
              }

              setWaypoints={
                setWaypoints
              }


              // ---------------------------------------------
              // Search visualization
              // ---------------------------------------------

              searchState={
                searchState
              }


              // ---------------------------------------------
              // Final route
              // ---------------------------------------------
              /*
              routeResult={
                routeResult
              }
                */

              routeResult={
                animationRouteResult ??
                routeResult
              }


              // ---------------------------------------------
              // Step 3
              // ---------------------------------------------

              closedEdgeIds={
                closedEdgeIds
              }

            />

          </div>

        </div>

      </section>

    </main>

  );

}