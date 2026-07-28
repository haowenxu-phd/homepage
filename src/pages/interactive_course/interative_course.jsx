import { useMemo } from "react";
import { Link } from "react-router-dom";

/**
 * Interactive Learning page
 *
 * Thumbnail images:
 * public/img/learning/<filename>
 *
 * Example routes:
 * /interactive-learning/network-modeling
 * /interactive-learning/routing
 * /interactive-learning/traffic-flow
 */
export default function InteractiveLearning() {
  const courses = useMemo(
    () => [
      {
        id: 1,
        title: "Transport Network and Graph Modelling",
        subtitle: "Learn how road networks become mathematical graphs",
        image: "img/thumbnail_learning/T1_transport_network_graph_model.png",
        description:
          "Explore nodes, links, directions, capacities, travel costs, and connectivity through an interactive road-network editor.",
        href: "/interactive-learning/network-modeling",
        badges: ["Graph Theory", "Road Networks", "Interactive Map"],
        level: "Foundation",
        status: "Available",
      },
      /*
      {
        id: 2,
        title: "Shortest-Path Routing and Navigation",
        subtitle: "Visualise how routing algorithms explore a network",
        image: "img/thumbnail_learning/tn_routing.png",
        description:
          "Select an origin and destination, then compare Dijkstra, A*, and breadth-first search through step-by-step animation.",
        href: "/interactive-learning/routing",
        badges: ["Dijkstra", "A*", "Navigation"],
        level: "Foundation",
        status: "Available",
      },
      {
        id: 3,
        title: "Origin–Destination Demand Modelling",
        subtitle: "Understand how travel demand moves through a city",
        image: "img/thumbnail_learning/tn_od_matrix.png",
        description:
          "Create zones, edit an origin–destination matrix, generate trips, and observe how travel demand is assigned to a network.",
        href: "/interactive-learning/od-demand",
        badges: ["OD Matrix", "Travel Demand", "Assignment"],
        level: "Intermediate",
        status: "Available",
      },
      {
        id: 4,
        title: "Traffic Flow Theory",
        subtitle: "Explore the relationships among flow, speed, and density",
        image: "img/thumbnail_learning/tn_traffic_flow.png",
        description:
          "Interact with fundamental diagrams and observe how congestion, capacity, queues, and shockwaves emerge.",
        href: "/interactive-learning/traffic-flow",
        badges: ["Flow", "Speed", "Density", "Shockwaves"],
        level: "Intermediate",
        status: "Available",
      },
      {
        id: 5,
        title: "Traffic Signal Timing",
        subtitle: "Design and evaluate an urban traffic signal",
        image: "img/thumbnail_learning/tn_signal_timing.png",
        description:
          "Adjust cycle length, green splits, offsets, and traffic demand while observing queues, delays, and signal performance.",
        href: "/interactive-learning/signal-timing",
        badges: ["Signals", "Queues", "Green Time"],
        level: "Intermediate",
        status: "Available",
      },
      {
        id: 6,
        title: "Signal Coordination and Green Waves",
        subtitle: "Create a time–space diagram for a signal corridor",
        image: "img/thumbnail_learning/tn_green_wave.png",
        description:
          "Modify signal offsets and cycle lengths to form progression bands and improve vehicle movement along a corridor.",
        href: "/interactive-learning/green-wave",
        badges: ["Coordination", "Offsets", "Time–Space Diagram"],
        level: "Advanced",
        status: "Available",
      },
      {
        id: 7,
        title: "Agent-Based Traffic Simulation",
        subtitle: "Build traffic behaviour from individual vehicles",
        image: "img/thumbnail_learning/tn_agent_simulation.png",
        description:
          "Experiment with car-following, acceleration, lane changing, route choice, and traffic demand in a browser-based simulation.",
        href: "/interactive-learning/agent-based-simulation",
        badges: ["Agents", "WebGL", "Car Following"],
        level: "Advanced",
        status: "Available",
      },
      {
        id: 8,
        title: "Lane-Based and Non-Lane-Based Traffic",
        subtitle: "Compare different representations of road movement",
        image: "img/thumbnail_learning/tn_lane_models.png",
        description:
          "Compare lane-constrained traffic with continuous lateral movement and investigate how modelling assumptions affect capacity.",
        href: "/interactive-learning/lane-models",
        badges: ["Lane Changing", "2D Movement", "Microsimulation"],
        level: "Advanced",
        status: "Coming Soon",
      },
      {
        id: 9,
        title: "Traffic Network Optimisation",
        subtitle: "Explore optimisation through transportation problems",
        image: "img/thumbnail_learning/tn_optimization.png",
        description:
          "Compare simulated annealing, genetic algorithms, and ant-colony optimisation using routing and signal-control problems.",
        href: "/interactive-learning/optimization",
        badges: ["SA", "GA", "ACO", "Optimisation"],
        level: "Advanced",
        status: "Coming Soon",
      },
      {
        id: 10,
        title: "Connected and Automated Vehicles",
        subtitle: "Explore vehicle–infrastructure cooperation",
        image: "img/thumbnail_learning/tn_cav.png",
        description:
          "Investigate speed advisory, vehicle trajectories, traffic signals, and V2I communication in a connected corridor.",
        href: "/interactive-learning/cav",
        badges: ["CAV", "V2I", "Eco-Driving"],
        level: "Advanced",
        status: "Coming Soon",
      },
      {
        id: 11,
        title: "Urban Mobility Digital Twins",
        subtitle: "Connect networks, sensors, simulation, and visualisation",
        image: "img/thumbnail_learning/tn_digital_twin.png",
        description:
          "Explore how real-time data, traffic models, interactive maps, and AI can be integrated into an urban mobility digital twin.",
        href: "/interactive-learning/digital-twins",
        badges: ["Digital Twin", "IoT", "Visual Analytics"],
        level: "Advanced",
        status: "Coming Soon",
      },
      {
        id: 12,
        title: "AI for Intelligent Transportation Systems",
        subtitle: "Use AI to understand and operate transport systems",
        image: "img/thumbnail_learning/tn_ai_its.png",
        description:
          "Discover applications of machine learning, generative AI, and AI agents in traffic monitoring, prediction, and decision support.",
        href: "/interactive-learning/ai-for-its",
        badges: ["Machine Learning", "LLM", "Agentic AI"],
        level: "Advanced",
        status: "Coming Soon",
      },*/
    ],
    []
  );

  const getLevelStyle = (level) => {
    switch (level) {
      case "Foundation":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";

      case "Intermediate":
        return "bg-blue-50 text-blue-700 ring-blue-200";

      case "Advanced":
        return "bg-purple-50 text-purple-700 ring-purple-200";

      default:
        return "bg-slate-50 text-slate-700 ring-slate-200";
    }
  };

  return (
  <main className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
    <div className="w-full px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      {/* ---------- Introduction ---------- */}
      <section className="w-full">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
          Interactive Transport Engineering Learning Lab
        </span>

        <h1 className="mt-3 max-w-[1600px] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl xl:text-6xl">
          Learn Transport Engineering Through Interactive Exploration
        </h1>

        <div className="mt-3 grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            This learning portfolio presents a collection of interactive
            modules for exploring the theories, algorithms, and technologies
            underlying modern transport engineering.
          </p>

          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            Students can construct road networks, inspect origin–destination
            demand, visualise routing algorithms, experiment with traffic-flow
            models, operate traffic signals, and investigate intelligent
            transportation systems through browser-based simulations and
            visual analytics.
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href="#course-gallery"
            className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Explore Learning Modules
          </a>

          <a
            href="mailto:haowen.xu.phd@gmail.com"
            className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Discuss Teaching Collaboration
          </a>
        </div>
      </section>

      {/* ---------- Learning principles ---------- */}
      <section className="mt-3 grid w-full grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200">
          <h4 className="text-base font-semibold leading-tight text-slate-900">
            Learn by Experimenting
          </h4>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            Change model parameters and immediately observe their effects on
            transport-system behaviour.
          </p>
        </div>

        <div className="rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200">
          <h4 className="text-base font-semibold leading-tight text-slate-900">
            Visualise the Algorithms
          </h4>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            Examine each computational step instead of treating algorithms and
            simulation models as black boxes.
          </p>
        </div>

        <div className="rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200">
          <h4 className="text-base font-semibold leading-tight text-slate-900">
            Connect Theory and Practice
          </h4>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            Apply transport theory to realistic road networks, traffic demand,
            signals, vehicles, and urban digital twins.
          </p>
        </div>
      </section>

      {/* ---------- Course Gallery ---------- */}
      <section
        id="course-gallery"
        className="mt-6 w-full scroll-mt-15"
      >
        <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Course Portfolio
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Select an Interactive Learning Module
            </h2>

            <p className="mt-2 text-slate-600">
              Begin with network fundamentals and progress towards simulation,
              optimisation, CAVs, and AI-enabled transport systems.
            </p>
          </div>

          <p className="shrink-0 text-sm text-slate-500">
            {courses.filter((course) => course.status === "Available").length}{" "}
            modules available
          </p>
        </div>

        <div
          className="
            mt-3 grid w-full grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            2xl:grid-cols-3
            min-[2100px]:grid-cols-4
          "
        >
          {courses.map((course) => {
            const isComingSoon = course.status === "Coming Soon";

            const cardContent = (
              <>
                <div className="relative aspect-[7/5] overflow-hidden bg-slate-100">
                  <img
                    src={`${import.meta.env.BASE_URL}${course.image}`}
                    alt={`${course.title} interactive course thumbnail`}
                    loading="lazy"
                    className={`
                      h-full w-full object-cover transition duration-500
                      ${
                        isComingSoon
                          ? "opacity-75"
                          : "group-hover:scale-[1.04]"
                      }
                    `}
                  />

                  <div className="absolute left-3 top-3">
                    <span
                      className={`
                        rounded-full px-2.5 py-1 text-xs font-semibold
                        ring-1 ring-inset backdrop-blur
                        ${getLevelStyle(course.level)}
                      `}
                    >
                      {course.level}
                    </span>
                  </div>

                  {isComingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 backdrop-blur-[1px]">
                      <span className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 shadow">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`
                    flex min-h-[280px] flex-col p-5
                    ${isComingSoon ? "opacity-70" : ""}
                  `}
                >
                  <div>
                    <h3 className="text-lg font-bold leading-snug text-slate-900">
                      {course.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-blue-700">
                      {course.subtitle}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div
                      className={`
                        flex items-center justify-between border-t pt-4
                        ${
                          isComingSoon
                            ? "border-slate-200 text-slate-400"
                            : "border-slate-200 text-blue-700"
                        }
                      `}
                    >
                      <span className="text-sm font-semibold">
                        {isComingSoon
                          ? "Module under development"
                          : "Launch interactive module"}
                      </span>

                      {!isComingSoon && (
                        <span
                          aria-hidden="true"
                          className="text-lg transition-transform group-hover:translate-x-1"
                        >
                          →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );

            if (isComingSoon) {
              return (
                <article
                  key={course.id}
                  aria-disabled="true"
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                >
                  {cardContent}
                </article>
              );
            }

            return (
              <Link
                key={course.id}
                to={course.href}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  </main>
);
}