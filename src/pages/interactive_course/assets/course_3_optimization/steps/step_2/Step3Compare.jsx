// Step4Compare.jsx

import React from "react";

/**
 * Step 2
 * Compare Ant Colony Optimization (ACO)
 * and Simulated Annealing (SA)
 */

const algorithms = [
  {
    shortName: "ACO",
    icon: "🐜",
    name: "Ant Colony Optimization (ACO)",
    category: "Population-Based Metaheuristic",

    searchStrategy:
      "Multiple ants construct candidate routes using pheromone trails and heuristic information.",

    exploration:
      "Distributed exploration across multiple candidate solutions.",

    memory:
      "Yes — pheromone trails retain information from previous iterations.",

    stochastic: "Yes",

    optimal: "Not guaranteed",

    efficiency: "Moderate",

    efficiencyNote:
      "Evaluates many candidate routes per iteration. Computational cost increases with the number of ants and stops.",

    suitableFor:
      "TSP, routing, vehicle routing, and other combinatorial optimization problems.",
  },

  {
    shortName: "SA",
    icon: "🌡️",
    name: "Simulated Annealing (SA)",
    category: "Single-Solution Metaheuristic",

    searchStrategy:
      "Generates neighboring solutions and probabilistically accepts improvements or temporary worsening moves.",

    exploration:
      "Explores locally around one evolving candidate solution.",

    memory:
      "Limited — primarily maintains the current and best solutions.",

    stochastic: "Yes",

    optimal: "Not guaranteed",

    efficiency: "Usually Faster per Iteration",

    efficiencyNote:
      "Evaluates fewer candidate solutions per iteration, but may require many iterations and careful cooling.",

    suitableFor:
      "TSP, route sequencing, scheduling, and large combinatorial search spaces.",
  },
];


/* =========================================================
   Reusable mobile field
   ========================================================= */

function MobileField({ label, children }) {
  return (
    <div className="border-t border-slate-100 py-2.5 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 break-words text-sm leading-5 text-slate-700">
        {children}
      </div>
    </div>
  );
}


export default function Step4Compare() {
  return (
    <section className="w-full min-w-0 overflow-x-hidden">

      {/* =====================================================
          Header
         ===================================================== */}

      <div className="border-b border-slate-200 px-3 py-3 sm:px-4">

        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-sky-600
          "
        >
          Step 2
        </p>

        <h4
          className="
            mt-1
            break-words
            text-base
            font-semibold
            leading-snug
            text-slate-900
            sm:text-lg
          "
        >
          Compare ACO &amp; Simulated Annealing
        </h4>

        <p
          className="
            mt-2
            max-w-4xl
            break-words
            text-sm
            leading-5
            text-slate-600
            sm:leading-6
          "
        >
          Ant Colony Optimization (ACO) and Simulated Annealing (SA)
          are stochastic metaheuristic algorithms that search large
          combinatorial solution spaces.

          In this course, both algorithms attempt to find a low-cost
          route connecting multiple stops, but they explore possible
          route sequences in fundamentally different ways.
        </p>

      </div>


      {/* =====================================================
          MOBILE COMPARISON
          
          Instead of forcing the large table onto narrow screens,
          display each algorithm as a vertical card.
         ===================================================== */}

      <div className="mt-3 space-y-3 px-2 md:hidden">

        {algorithms.map((algorithm) => (
          <article
            key={algorithm.name}
            className="
              min-w-0
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              p-3
              shadow-sm
            "
          >

            {/* Mobile card header */}

            <div className="flex min-w-0 items-start gap-2">

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                  text-lg
                "
              >
                {algorithm.icon}
              </span>

              <div className="min-w-0">

                <h3
                  className="
                    break-words
                    text-sm
                    font-semibold
                    leading-5
                    text-slate-900
                  "
                >
                  {algorithm.name}
                </h3>

                <p
                  className="
                    mt-0.5
                    break-words
                    text-xs
                    leading-4
                    text-slate-500
                  "
                >
                  {algorithm.category}
                </p>

              </div>

            </div>


            {/* Mobile fields */}

            <div className="mt-3">

              <MobileField label="Search Strategy">
                {algorithm.searchStrategy}
              </MobileField>

              <MobileField label="Exploration">
                {algorithm.exploration}
              </MobileField>

              <MobileField label="Memory">
                {algorithm.memory}
              </MobileField>

              <MobileField label="Stochastic">
                {algorithm.stochastic}
              </MobileField>

              <MobileField label="Global Optimum">
                {algorithm.optimal}
              </MobileField>

              <MobileField label="Efficiency / Speed">

                <span className="font-semibold text-slate-800">
                  {algorithm.efficiency}
                </span>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {algorithm.efficiencyNote}
                </p>

              </MobileField>

              <MobileField label="Best Suited For">
                {algorithm.suitableFor}
              </MobileField>

            </div>

          </article>
        ))}

      </div>


      {/* =====================================================
          DESKTOP / TABLET TABLE
          
          Hidden on narrow screens.
         ===================================================== */}

      <div
        className="
          mt-4
          hidden
          min-w-0
          overflow-x-auto
          rounded-xl
          border
          border-slate-200
          bg-white
          md:block
        "
      >

        <table
          className="
            w-full
            min-w-[1050px]
            border-collapse
            text-left
          "
        >

          <thead className="bg-slate-50">

            <tr>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Algorithm
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Type
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Search Strategy
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Exploration
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Memory
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Stochastic
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Optimal
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Efficiency / Speed
              </th>

              <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold text-slate-900">
                Best Suited For
              </th>

            </tr>

          </thead>


          <tbody>

            {algorithms.map((algorithm) => (
              <tr
                key={algorithm.name}
                className="align-top transition-colors hover:bg-slate-50"
              >

                <td
                  className="
                    max-w-[160px]
                    border-b
                    border-slate-100
                    px-3
                    py-4
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  {algorithm.name}
                </td>

                <td
                  className="
                    max-w-[150px]
                    border-b
                    border-slate-100
                    px-3
                    py-4
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  {algorithm.category}
                </td>

                <td
                  className="
                    max-w-[220px]
                    border-b
                    border-slate-100
                    px-3
                    py-4
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  {algorithm.searchStrategy}
                </td>

                <td
                  className="
                    max-w-[170px]
                    border-b
                    border-slate-100
                    px-3
                    py-4
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  {algorithm.exploration}
                </td>

                <td
                  className="
                    max-w-[170px]
                    border-b
                    border-slate-100
                    px-3
                    py-4
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  {algorithm.memory}
                </td>

                <td className="border-b border-slate-100 px-3 py-4 text-xs text-slate-600">
                  {algorithm.stochastic}
                </td>

                <td className="border-b border-slate-100 px-3 py-4 text-xs text-slate-600">
                  {algorithm.optimal}
                </td>

                <td
                  className="
                    max-w-[200px]
                    border-b
                    border-slate-100
                    px-3
                    py-4
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >

                  <p className="font-semibold text-slate-800">
                    {algorithm.efficiency}
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    {algorithm.efficiencyNote}
                  </p>

                </td>

                <td
                  className="
                    max-w-[190px]
                    border-b
                    border-slate-100
                    px-3
                    py-4
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  {algorithm.suitableFor}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          CORE CONCEPTUAL DIFFERENCE
         ===================================================== */}

      <div
        className="
          mt-5
          grid
          min-w-0
          grid-cols-1
          gap-3
          px-2
          lg:grid-cols-2
        "
      >

        {/* ACO */}

        <div
          className="
            min-w-0
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            p-3
            sm:p-4
            lg:p-5
          "
        >

          <div
            className="
              flex
              min-w-0
              flex-col
              items-start
              gap-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <h3
              className="
                min-w-0
                break-words
                text-base
                font-semibold
                leading-snug
                text-slate-900
                sm:text-lg
              "
            >
              🐜 Ant Colony Optimization
            </h3>

            <span
              className="
                shrink-0
                rounded-full
                bg-sky-50
                px-3
                py-1
                text-xs
                font-semibold
                text-sky-700
              "
            >
              Population-Based
            </span>

          </div>


          <p className="mt-3 break-words text-sm leading-6 text-slate-600">
            ACO maintains a population of artificial ants. During each
            iteration, multiple ants independently construct candidate
            routes through the selected stops.
          </p>

          <p className="mt-3 break-words text-sm leading-6 text-slate-600">
            Better routes deposit stronger virtual{" "}
            <strong>pheromone trails</strong>. These trails influence
            future ants, allowing useful information discovered by
            previous searches to accumulate over time.
          </p>


          <div className="mt-4 overflow-hidden rounded-lg bg-slate-50 p-3 sm:p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Basic idea
            </p>

            <div
              className="
                mt-2
                break-words
                text-center
                font-mono
                text-xs
                leading-6
                text-slate-700
                sm:text-sm
              "
            >
              Many Ants
              <br />
              ↓
              <br />
              Candidate Routes
              <br />
              ↓
              <br />
              Evaluate Cost
              <br />
              ↓
              <br />
              Update Pheromones
              <br />
              ↓
              <br />
              Better Future Routes
            </div>

          </div>

        </div>


        {/* SA */}

        <div
          className="
            min-w-0
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            p-3
            sm:p-4
            lg:p-5
          "
        >

          <div
            className="
              flex
              min-w-0
              flex-col
              items-start
              gap-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <h3
              className="
                min-w-0
                break-words
                text-base
                font-semibold
                leading-snug
                text-slate-900
                sm:text-lg
              "
            >
              🌡️ Simulated Annealing
            </h3>

            <span
              className="
                shrink-0
                rounded-full
                bg-orange-50
                px-3
                py-1
                text-xs
                font-semibold
                text-orange-700
              "
            >
              Single-Solution
            </span>

          </div>


          <p className="mt-3 break-words text-sm leading-6 text-slate-600">
            Simulated Annealing starts with a single candidate route and
            repeatedly creates a nearby solution by modifying its stop
            sequence.
          </p>

          <p className="mt-3 break-words text-sm leading-6 text-slate-600">
            Better solutions are accepted, but SA can also{" "}
            <strong>temporarily accept worse solutions</strong>. This
            allows the search to escape local optima. As temperature
            decreases, worse solutions become progressively less likely
            to be accepted.
          </p>


          <div className="mt-4 overflow-hidden rounded-lg bg-slate-50 p-3 sm:p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Basic idea
            </p>

            <div
              className="
                mt-2
                break-words
                text-center
                font-mono
                text-xs
                leading-6
                text-slate-700
                sm:text-sm
              "
            >
              Current Route
              <br />
              ↓
              <br />
              Generate Neighbor
              <br />
              ↓
              <br />
              Evaluate Cost
              <br />
              ↓
              <br />
              Accept / Reject
              <br />
              ↓
              <br />
              Reduce Temperature
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH STRATEGY
         ===================================================== */}

      <div
        className="
          mx-2
          mt-5
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          p-3
          sm:p-4
          lg:p-5
        "
      >

        <h3
          className="
            break-words
            text-base
            font-semibold
            leading-snug
            text-slate-900
            sm:text-lg
          "
        >
          How do ACO and SA explore the solution space?
        </h3>


        <div
          className="
            mt-4
            grid
            min-w-0
            grid-cols-1
            gap-3
            lg:grid-cols-2
          "
        >

          {/* ACO collective search */}

          <div className="min-w-0 overflow-hidden rounded-lg bg-slate-50 p-3 sm:p-4">

            <p className="break-words font-semibold text-slate-900">
              🐜 ACO: Collective Search
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              Many ants explore different candidate routes during each
              iteration. Information about successful routes is shared
              indirectly through pheromone trails.
            </p>

            <div
              className="
                mt-3
                overflow-hidden
                break-words
                font-mono
                text-xs
                leading-5
                text-slate-500
              "
            >
              ant₁ → route A
              <br />
              ant₂ → route B
              <br />
              ant₃ → route C
              <br />
              ...
              <br />
              ↓
              <br />
              pheromone update
            </div>

          </div>


          {/* SA sequential search */}

          <div className="min-w-0 overflow-hidden rounded-lg bg-slate-50 p-3 sm:p-4">

            <p className="break-words font-semibold text-slate-900">
              🌡️ SA: Sequential Search
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              One solution evolves over time. The algorithm explores
              neighboring routes and uses temperature-controlled
              randomness to balance exploration and exploitation.
            </p>

            <div
              className="
                mt-3
                overflow-hidden
                break-words
                font-mono
                text-xs
                leading-5
                text-slate-500
              "
            >
              route₁
              <br />
              ↓
              <br />
              route₂
              <br />
              ↓
              <br />
              route₃
              <br />
              ↓
              <br />
              ...
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          EXPLORATION VS EXPLOITATION
         ===================================================== */}

      <div
        className="
          mx-2
          mt-5
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          p-3
          sm:p-4
          lg:p-5
        "
      >

        <h3 className="break-words text-base font-semibold text-slate-900 sm:text-lg">
          Exploration vs. Exploitation
        </h3>

        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
          Both algorithms balance exploring new solutions with exploiting
          promising solutions already discovered, but they achieve this
          balance differently.
        </p>


        <div
          className="
            mt-4
            grid
            min-w-0
            grid-cols-1
            gap-3
            lg:grid-cols-2
          "
        >

          <div className="min-w-0 rounded-lg border border-slate-100 p-3 sm:p-4">

            <p className="font-semibold text-slate-900">
              ACO
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              <strong>Exploration:</strong> randomness allows ants to try
              different edges and route combinations.
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              <strong>Exploitation:</strong> stronger pheromone trails make
              previously successful choices more attractive.
            </p>

          </div>


          <div className="min-w-0 rounded-lg border border-slate-100 p-3 sm:p-4">

            <p className="font-semibold text-slate-900">
              Simulated Annealing
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              <strong>Exploration:</strong> high temperature allows worse
              solutions to be accepted more frequently.
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              <strong>Exploitation:</strong> as temperature falls, the
              algorithm increasingly favors improvements.
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          PARAMETERS
         ===================================================== */}

      <div
        className="
          mt-5
          grid
          min-w-0
          grid-cols-1
          gap-3
          px-2
          lg:grid-cols-2
        "
      >

        {/* ACO parameters */}

        <div
          className="
            min-w-0
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            p-3
            sm:p-4
            lg:p-5
          "
        >

          <h3 className="break-words font-semibold text-slate-900">
            🐜 Important ACO Parameters
          </h3>

          <ul
            className="
              mt-3
              list-outside
              list-disc
              space-y-2
              pl-5
              text-sm
              leading-5
              text-slate-600
            "
          >

            <li className="break-words">
              <strong>Number of ants:</strong> candidate solutions generated
              per iteration
            </li>

            <li className="break-words">
              <strong>α (alpha):</strong> importance of pheromone information
            </li>

            <li className="break-words">
              <strong>β (beta):</strong> importance of heuristic information
            </li>

            <li className="break-words">
              <strong>Evaporation rate:</strong> controls how quickly old
              pheromone information disappears
            </li>

            <li className="break-words">
              <strong>Iterations:</strong> number of optimization cycles
            </li>

          </ul>

        </div>


        {/* SA parameters */}

        <div
          className="
            min-w-0
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            p-3
            sm:p-4
            lg:p-5
          "
        >

          <h3 className="break-words font-semibold text-slate-900">
            🌡️ Important SA Parameters
          </h3>

          <ul
            className="
              mt-3
              list-outside
              list-disc
              space-y-2
              pl-5
              text-sm
              leading-5
              text-slate-600
            "
          >

            <li className="break-words">
              <strong>Initial temperature:</strong> controls early exploration
            </li>

            <li className="break-words">
              <strong>Cooling rate:</strong> determines how quickly randomness
              decreases
            </li>

            <li className="break-words">
              <strong>Neighborhood operator:</strong> determines how new
              candidate routes are generated
            </li>

            <li className="break-words">
              <strong>Iterations:</strong> controls the total search duration
            </li>

          </ul>

        </div>

      </div>


      {/* =====================================================
          EFFICIENCY
         ===================================================== */}

      <div
        className="
          mx-2
          mt-5
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          p-3
          sm:p-4
          lg:p-5
        "
      >

        <h3 className="break-words font-semibold text-slate-900">
          ⚡ What about computational efficiency?
        </h3>

        <p className="mt-2 break-words text-sm leading-6 text-slate-700">
          SA is often computationally cheaper{" "}
          <strong>per iteration</strong> because it typically evaluates one
          neighboring solution at a time. ACO usually evaluates multiple
          ants during each iteration and must also update pheromone
          information, making each iteration more computationally expensive.
        </p>

        <p className="mt-3 break-words text-sm leading-6 text-slate-700">
          However, this does not mean that SA is always faster or better.
          Performance depends on problem size, number of iterations, number
          of ants, cooling schedule, parameter settings, and stopping
          criteria.
        </p>

      </div>


      {/* =====================================================
          TAKEAWAY
         ===================================================== */}

      <div
        className="
          mx-2
          mt-5
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-blue-200
          bg-blue-50
          p-3
          sm:p-4
          lg:p-5
        "
      >

        <h3 className="font-semibold text-slate-900">
          Key Takeaway
        </h3>

        <p className="mt-2 break-words text-sm leading-6 text-slate-700">
          ACO and Simulated Annealing can solve the same route-optimization
          problem without exhaustively evaluating every possible route, but
          they search the solution space very differently.
        </p>

        <p className="mt-3 break-words text-sm leading-6 text-slate-700">
          <strong>ACO learns collectively:</strong> many candidate solutions
          explore the network and communicate useful information through
          pheromone trails.
        </p>

        <p className="mt-2 break-words text-sm leading-6 text-slate-700">
          <strong>SA evolves sequentially:</strong> one candidate solution is
          repeatedly modified while temperature-controlled randomness allows
          the search to escape local optima.
        </p>

        <p className="mt-3 break-words text-sm leading-6 text-slate-700">
          In the interactive simulation, compare{" "}
          <strong>current route cost</strong>,{" "}
          <strong>best route cost</strong>,{" "}
          <strong>improvement over iterations</strong>, and{" "}
          <strong>runtime</strong>. Because both algorithms are stochastic,
          run them multiple times and observe whether they converge toward
          similar solutions.
        </p>

      </div>


      {/* =====================================================
          NOTE
         ===================================================== */}

      <p
        className="
          mx-2
          mb-3
          mt-4
          break-words
          text-xs
          leading-5
          text-slate-500
        "
      >
        ACO and SA are metaheuristic optimization algorithms and do not
        generally guarantee the global optimum. Their performance depends
        on algorithm parameters, problem structure, stopping criteria, and
        random initialization.
      </p>

    </section>
  );
}