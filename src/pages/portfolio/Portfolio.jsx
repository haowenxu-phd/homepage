import { useMemo } from "react";

/**
 * Projects page with:
 *  - CTA section (edit the bullets/text below)
 *  - Responsive grid of project thumbnails
 * Place images under: public/img/projects/<file>
 */
export default function Projects() {
  // 🔧 Replace with your real projects
  const projects = useMemo(
    () => [
      
      {
        id: 1,
        title: "LLM & Agentic AI for Urban Logistic Optimization",
        image: "/img/thumbnail/tn_agentic_ai.png",
        blurb:
          "Agentic AI assistants orchestrating tools for planning, querying, and reporting.",
        href: "/homepage/portfolio/agentic_ai_dt",
        badges: ["LLM", "Agents", "RAG", "Optimization Solver"],
      },
      {
        id: 2,
        title: "HPC-accelerated 3D Wildfire Simulator using Voxels",
        image: "/img/thumbnail/tn_wildfire.png",
        blurb:
          "Multi-kernel heat transfer (convection, radiation, conduction, wind) through 3D voxel City.",
        href: "/homepage/portfolio/bushfire_sim",
        badges: ["3D Voxels", "Simulation", "AI Surrogates"],
      },
      {
        id: 3,
        title: "Speed Advisory Mobile App",
        image: "/img/thumbnail/tn_mobile_ad.png",
        blurb:
          "V2I-based intelligent speed advisory to smooth stop-and-go traffic and reduce fuel.",
        href: "/homepage/portfolio/mobile_app_smart_speed",
        badges: ["V2I", "Mobile", "Optimization"],
      },
      {
        id: 4,
        title: "Urban Digital Twin (CTwin)",
        image: "/img/thumbnail/tn_ctwin.png",
        blurb:
          "Real-time mobility & energy analytics with cyber-physical control and visual analytics.",
        href: "https://yourlink.example/ctwin",
        badges: ["Digital Twin", "HPC", "Edge"],
      },

      {
        id: 4,
        title: "Urban Digital Twin (CTwin)",
        image: "/img/thumbnail/tn_photorealistic_dt.png",
        blurb:
          "VRc Digital Twins",
        href: "https://yourlink.example/ctwin",
        badges: ["Digital Twin", "HPC", "Edge"],
      },

      
      
      // add more…
    ],
    []
  );

  return (
    <div className="w-full">
    <main className="w-full !max-w-none min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">

      <div className="max-w-[1800px] mx-auto">  {/* or w-full for no cap */}
        {/* ---------- CTA Section ---------- */}
        <section className="w-full">
          <h4 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dr. Haowen Xu's Selected Projects 
          </h4>
          <p className="mt-3 text-slate-600">
            I design and build <strong>Urban AI systems</strong> that integrate 
            <strong> digital twins, simulation, visual analytics, IoT devices,
            generative and agentic AI, and large language models (LLMs)</strong>  {" "}
            to advance smart cities and enhance everyday life.  
            Below are representative projects—funded by UNSW and the U.S. government—
            with links to <strong>videos, live demos, publications, and awards</strong>.  
            If you’re interested in collaboration or in exploring applications across {" "}
            <strong>mobility, energy, or environmental systems</strong>, I’d love to connect.
          </p>

          {/* Strong CTA (edit bullets or turn into paragraph) */
          /*
          <ul className="mt-4 list-disc list-inside text-slate-700 space-y-1">
            <li>Discuss AI surrogate modeling and agentic AI system for real-time at scale.</li>
            <li>Partner on ARC / DOE / industry proposals.</li>
          </ul>*/
          }

          {/** 
           * 
           * <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/HaowenXu_CV.pdf"
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-slate-800 transition"
            >
              View CV
            </a>
            <a
              href="mailto:haowen.xu1@unsw.edu.au"
              className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition"
            >
              Contact Me
            </a>
          </div>
          */}
          
        </section>

        {/* ---------- Thumb Grid ---------- */}
        <section className="mt-10">
          <h2 className="sr-only">Project gallery</h2>

          {/* Responsive columns:
              <640px: 1,  >=640px: 2,  >=1024px: 3,  >=1280px: 4  */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
            {projects.map((p) => (
              <a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 hover:ring-blue-400 shadow-sm hover:shadow transition"
              >
                {/* Thumb */}
                <div className="aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={`${import.meta.env.BASE_URL}${p.image}`}  
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Text block */}
                <div className="p-4">
                  <h5 className="text-sm font-semibold text-slate-900 line-clamp-2">
                    {p.title}
                  </h5>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-3">
                    {p.blurb}
                  </p>

                  {/* Badges */}
                  {p.badges?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.badges.map((b, i) => (
                        <span
                          key={i}
                          className="text-[11px] rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 ring-1 ring-inset ring-slate-200"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-b from-transparent via-transparent to-black/20" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
    </div>
  );
}
