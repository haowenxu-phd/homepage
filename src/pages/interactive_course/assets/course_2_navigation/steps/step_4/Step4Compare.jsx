// Step4Compare.jsx

import React from "react";

/**
 * Step 4
 * Compare navigation algorithms
 *
 * This component compares four classical graph-search algorithms:
 * Dijkstra, A*, Bidirectional Dijkstra, and BFS.
 */

const algorithms = [
  {
    name: "Dijkstra",
    category: "Weighted Shortest Path",
    objective: "Find the minimum-cost path",
    heuristic: "No",
    weighted: "Yes",
    optimal: "Yes",
    complexity: "O((V + E) log V)",
    suitableFor: "Weighted road networks with non-negative edge costs",
  },

  {
    name: "A*",
    category: "Heuristic Shortest Path",
    objective: "Find the minimum-cost path while guiding search toward the destination",
    heuristic: "Yes",
    weighted: "Yes",
    optimal: "Yes*",
    complexity: "Depends on heuristic",
    suitableFor: "Efficient point-to-point road navigation",
  },

  {
    name: "Bidirectional Dijkstra",
    category: "Weighted Shortest Path",
    objective: "Search simultaneously from origin and destination",
    heuristic: "No",
    weighted: "Yes",
    optimal: "Yes",
    complexity: "O((V + E) log V)",
    suitableFor: "Long-distance point-to-point routing on large networks",
  },

  {
    name: "BFS",
    category: "Unweighted Graph Search",
    objective: "Find the path with the fewest number of edges",
    heuristic: "No",
    weighted: "No",
    optimal: "Yes**",
    complexity: "O(V + E)",
    suitableFor: "Unweighted graphs or networks where all edges have equal cost",
  },
];

export default function Step4Compare() {
  return (
    <section className="w-full">

      {/* ------------------------------------------------------ */}
      {/* Header                                                 */}
      {/* ------------------------------------------------------ */}

      <div className=" border-b
          border-slate-200
          p-3">
        <p className="text-xs
            font-semibold
            uppercase
            tracking-wide
            text-sky-600">
          Step 2
        </p>

        <h4 className="mt-1
            text-lg
            font-semibold
            text-slate-900">
          Compare Navigation Algorithms
        </h4>

        <p className="mt-2 max-w-4xl text-slate-600">
          The four algorithms introduced in this course can all search a
          transportation network, but they explore the graph in very different
          ways. Compare how Dijkstra, A*, Bidirectional Dijkstra, and BFS search
          the same road network and how these differences affect routing
          efficiency and path quality.
        </p>
      </div>

      {/* ------------------------------------------------------ */}
      {/* Main comparison table                                  */}
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
                Search strategy
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Heuristic
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Weighted edges
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
                  {algorithm.weighted}
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
      {/* Concept summary                                        */}
      {/* ------------------------------------------------------ */}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Dijkstra */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Dijkstra
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Dijkstra&apos;s algorithm expands the node with the smallest
            accumulated travel cost from the origin. Because it has no
            knowledge of the destination direction, it may explore a large
            portion of the network before reaching the destination.
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-700">
            priority(n) = g(n)
          </div>

          <p className="mt-3 text-xs text-slate-500">
            g(n): accumulated cost from the origin to node n
          </p>
        </div>


        {/* A* */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            A*
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            A* extends Dijkstra by estimating the remaining cost from each
            candidate node to the destination. This heuristic guides the
            search toward the destination and can greatly reduce unnecessary
            exploration.
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-700">
            priority(n) = g(n) + h(n)
          </div>

          <p className="mt-3 text-xs text-slate-500">
            h(n): estimated remaining cost from node n to the destination
          </p>
        </div>


        {/* Bidirectional Dijkstra */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Bidirectional Dijkstra
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Bidirectional Dijkstra performs two shortest-path searches at the
            same time: one forward from the origin and one backward from the
            destination. The search stops when the two search frontiers meet
            and a shortest path can be reconstructed.
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-700">
            Origin → → → meeting point ← ← ← Destination
          </div>

          <p className="mt-3 text-xs text-slate-500">
            The backward search requires access to incoming or reverse graph
            connectivity.
          </p>
        </div>


        {/* BFS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Breadth-First Search (BFS)
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            BFS explores the graph level by level using a first-in, first-out
            queue. It does not consider distance, travel time, or other edge
            weights, so it finds the path containing the fewest graph edges
            rather than the minimum-distance or minimum-time route.
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-700">
            depth 0 → depth 1 → depth 2 → depth 3 → ...
          </div>

          <p className="mt-3 text-xs text-slate-500">
            BFS is shortest-path optimal only when every edge has equal cost.
          </p>
        </div>

      </div>


      {/* ------------------------------------------------------ */}
      {/* Search strategy comparison                             */}
      {/* ------------------------------------------------------ */}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">

        <h3 className="text-lg font-semibold text-slate-900">
          How does each algorithm explore the road network?
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              Dijkstra
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Expands outward from the origin based on accumulated travel cost.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              A*
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Expands toward the destination using both travel cost and a
              spatial heuristic.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              Bidirectional Dijkstra
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Expands simultaneously from both the origin and destination.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              BFS
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Expands uniformly by graph depth without considering edge cost.
            </p>
          </div>

        </div>
      </div>


      {/* ------------------------------------------------------ */}
      {/* Teaching takeaway                                      */}
      {/* ------------------------------------------------------ */}

      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">

        <h3 className="font-semibold text-slate-900">
          Key takeaway
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Dijkstra, A*, and Bidirectional Dijkstra can all solve weighted
          shortest-path problems, but they differ in how they explore the
          network. Dijkstra searches outward from the origin, A* uses a
          heuristic to focus the search toward the destination, and
          Bidirectional Dijkstra searches from both ends simultaneously.
          BFS is fundamentally different because it ignores edge weights and
          instead finds the route with the fewest number of edges.
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          When comparing the algorithms in the interactive simulation, pay
          attention not only to the final route, but also to the
          <strong> number of visited nodes</strong>,
          <strong> number of explored edges</strong>,
          <strong> runtime</strong>, and
          <strong> final route cost</strong>.
        </p>

      </div>


      {/* ------------------------------------------------------ */}
      {/* Notes                                                   */}
      {/* ------------------------------------------------------ */}

      <div className="mt-4 space-y-1 text-xs text-slate-500">

        <p>
          * A* is optimal when the heuristic is admissible and does not
          overestimate the true remaining cost.
        </p>

        <p>
          ** BFS is shortest-path optimal only for unweighted graphs or when
          all edges have equal cost.
        </p>

      </div>

    </section>
  );
}