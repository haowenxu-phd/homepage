import React from "react";


// ============================================================
// Workflow Progress
//
// Displays the four learning stages as a connected
// bubble workflow.
//
// Props:
//
// currentStep : currently active step ID
// steps       : [{ id, title }, ...]
// language    : en | zh | fa
// onStepChange: optional callback for clicking a step
// ============================================================

export default function WorkflowProgress({
  currentStep,
  steps = [],
  language = "en",
  onStepChange,
}) {

  const isRTL =
    language === "fa";


  return (

    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="
        mt-2
        w-full
        border
        border-sky-400
        bg-white
        px-3
        py-3
      "
    >

      {/* ======================================================
          Workflow
      ====================================================== */}

      <div
        className="
          flex
          w-full
          items-start
          justify-center
        "
      >

        {steps.map(
          (
            step,
            index
          ) => {

            const isActive =
              step.id ===
              currentStep;


            const isCompleted =
              step.id <
              currentStep;


            return (

              <React.Fragment
                key={step.id}
              >

                {/* ============================================
                    Step
                ============================================ */}

                <div
                  className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    items-center
                  "
                >

                  {/* ------------------------------------------
                      Bubble
                  ------------------------------------------ */}

                  <button

                    type="button"

                    onClick={() => {

                      if (
                        onStepChange
                      ) {

                        onStepChange(
                          step.id
                        );

                      }

                    }}

                    disabled={
                      !onStepChange
                    }

                    aria-current={
                      isActive
                        ? "step"
                        : undefined
                    }

                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      text-sm
                      font-bold
                      transition-all
                      duration-200

                      ${
                        isActive

                          ? `
                              scale-110
                              border-sky-600
                              bg-sky-600
                              text-white
                              shadow-md
                            `

                          : isCompleted

                          ? `
                              border-emerald-500
                              bg-emerald-500
                              text-white
                            `

                          : `
                              border-slate-300
                              bg-white
                              text-slate-500
                            `
                      }

                      ${
                        onStepChange

                          ? `
                              cursor-pointer
                              hover:scale-110
                            `

                          : `
                              cursor-default
                            `
                      }
                    `}
                  >

                    {
                      isCompleted
                        ? "✓"
                        : step.id
                    }

                  </button>


                  {/* ------------------------------------------
                      Step title
                  ------------------------------------------ */}

                  <div
                    className={`
                      mt-2
                      max-w-[150px]
                      text-center
                      text-xs
                      leading-4

                      ${
                        isActive

                          ? `
                              font-semibold
                              text-sky-700
                            `

                          : isCompleted

                          ? `
                              font-medium
                              text-emerald-700
                            `

                          : `
                              font-medium
                              text-slate-500
                            `
                      }
                    `}
                  >

                    {
                      step.title
                    }

                  </div>

                </div>


                {/* ============================================
                    Connector
                ============================================ */}

                {
                  index <
                    steps.length - 1 && (

                    <div
                      className="
                        mt-[19px]
                        flex
                        min-w-[30px]
                        flex-1
                        items-center
                      "
                    >

                      <div
                        className={`
                          h-[2px]
                          w-full
                          transition-all
                          duration-300

                          ${
                            step.id <
                            currentStep

                              ? "bg-emerald-500"

                              : "bg-slate-300"
                          }
                        `}
                      />

                    </div>

                  )
                }

              </React.Fragment>

            );

          }
        )}

      </div>

    </section>

  );

}