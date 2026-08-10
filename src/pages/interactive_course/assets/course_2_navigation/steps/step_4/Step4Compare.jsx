// Step4Compare.jsx

import React from "react";

/**
 * Step 4
 * Compare navigation algorithms
 *
 * This component provides a summary comparison of the routing and
 * optimisation algorithms introduced in the course.
 */

const algorithms = [
  {
    name: "Dijkstra",
    category: "Shortest Path",
    objective: "Find the minimum-cost path",
    heuristic: "No",
    optimal: "Yes",
    complexity: "O((V + E) log V)",
    suitableFor: "Shortest-distance or fastest-time routing",
  },
  {
    name: "A*",
    category: "Shortest Path",
    objective: "Find the minimum-cost path using a heuristic",
    heuristic: "Yes",
    optimal: "Yes*",
    complexity: "Depends on heuristic",
    suitableFor: "Point-to-point road navigation",
  },
  {
    name: "Ant Colony Optimization",
    category: "Metaheuristic",
    objective: "Search for near-optimal solutions",
    heuristic: "Probabilistic",
    optimal: "Not guaranteed",
    complexity: "Problem dependent",
    suitableFor: "Complex routing and combinatorial optimisation",
  },
  {
    name: "Simulated Annealing",
    category: "Metaheuristic",
    objective: "Search large solution spaces",
    heuristic: "Probabilistic",
    optimal: "Not guaranteed",
    complexity: "Problem dependent",
    suitableFor: "TSP and route-sequence optimisation",
  },
];

export default function Step4Compare() {
  return (
    <section className="w-full">
      {/* ------------------------------------------------------ */}
      {/* Header                                                 */}
      {/* ------------------------------------------------------ */}

      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Step 4
        </p>

        <h2 className="text-2xl font-bold text-slate-900">
          Compare Navigation Algorithms
        </h2>

        <p className="mt-2 max-w-4xl text-slate-600">
          Different navigation problems require different algorithms.
          Compare how shortest-path algorithms and optimisation algorithms
          search a transportation network and when each approach is most
          appropriate.
        </p>
      </div>

      {/* ------------------------------------------------------ */}
      {/* Main comparison table                                 */}
      {/* ------------------------------------------------------ */}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Algorithm
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Type
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Objective
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Heuristic
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Optimal
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Complexity
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Best suited for
              </th>
            </tr>
          </thead>

          <tbody>
            {algorithms.map((algorithm) => (
              <tr
                key={algorithm.name}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-900">
                  {algorithm.name}
                </td>

                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {algorithm.category}
                </td>

                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {algorithm.objective}
                </td>

                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {algorithm.heuristic}
                </td>

                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {algorithm.optimal}
                </td>

                <td className="border-b border-slate-100 px-4 py-4 font-mono text-sm text-slate-700">
                  {algorithm.complexity}
                </td>

                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {algorithm.suitableFor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------ */}
      {/* Concept summary                                       */}
      {/* ------------------------------------------------------ */}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Dijkstra */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Dijkstra
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Dijkstra&apos;s algorithm systematically expands the node with
            the smallest accumulated cost. It does not know where the
            destination is located and therefore may explore a relatively
            large portion of the network.
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-700">
            priority(n) = g(n)
          </div>
        </div>

        {/* A* */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            A*
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            A* extends Dijkstra by estimating the remaining cost from each
            candidate node to the destination. A good heuristic can
            substantially reduce the number of explored nodes.
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-700">
            priority(n) = g(n) + h(n)
          </div>
        </div>

        {/* ACO */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Ant Colony Optimization
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            ACO uses a population of artificial ants to explore candidate
            solutions. Successful solutions reinforce virtual pheromone
            trails, gradually biasing subsequent searches toward promising
            routes.
          </p>
        </div>

        {/* SA */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Simulated Annealing
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Simulated annealing explores alternative solutions while
            occasionally accepting worse solutions. This allows the search
            to escape local optima and makes it useful for problems such as
            the Traveling Salesman Problem.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* Teaching takeaway                                     */}
      {/* ------------------------------------------------------ */}

      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-semibold text-slate-900">
          Key takeaway
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          There is no single &quot;best&quot; navigation algorithm.
          Dijkstra and A* are designed to solve shortest-path problems on a
          graph, while ACO and simulated annealing are useful when the
          transportation problem involves a much larger combinatorial
          solution space.
        </p>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        * A* is optimal when an appropriate admissible heuristic is used.
      </p>
    </section>
  );
}