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
        title: "LLM & Agentic AI for Intermodal Freight Transport Optimization",
        image: "/img/thumbnail/tn_agentic_ai.png",
        blurb:
          "Agentic AI assistants orchestrating tools for planning, querying, and reporting.",
        href: "/homepage/portfolio/agentic_ai_dt",
        badges: ["LLM", "Agents", "RAG", "Optimization Solver"],
      },      
      {
        id: 2,
        title: "V2I-Based Intelligent Speed Advisory System",
        image: "/img/thumbnail/tn_mobile_ad.png",
        blurb:
          "V2I-based intelligent speed advisory to smooth stop-and-go traffic and reduce fuel consumptuon.",
        href: "/homepage/portfolio/mobile_app_smart_speed",
        badges: ["V2I", "Mobile", "Optimization"],
      },
      {
        id: 3,
        title: "Cloud-based Chattanooga Digital Twin (CTwin) for Smart Mobility",
        image: "/img/thumbnail/tn_ctwin.png",
        blurb:
          "Real-Time Mobility Simulation & Energy Analytics with Cyber-Physical Control of Traffic Control for Congestion Reduction in Chattanooga, TN",
        href: "/homepage/portfolio/ctwin",
        badges: ["Cloud-based","Digital Twin", "HPC", "Cyber-physical System"],
      },
      {
        id: 4,
        title: "Realistic 3D Digital Twins Generation Pipeline for Autonomous Vehicles",
        image: "/img/thumbnail/tn_photorealistic_dt.png",
        blurb:
          "VR Digital Twins & Vehicle/Driving Simulator",
        href: "/homepage/portfolio/vr_digital_twins",
        badges: ["Digital Twin", "HPC", "Edge"],
      },
      {
        id: 41,
        title: "Online Platform for Traffic Simulation Sharing & Visualization",
        image: "/img/thumbnail/tn_rtmcs.png",
        blurb:
          "Interactive cyberinfrastructure for managing, exploring, and comparing VISSIM and SUMO simulation outputs",
        href: "/homepage/portfolio/rtmcs",
        badges: ["Traffic Simulation", "Cyberinfrastructure", "VISSIM", "SUMO"],
      },
      {
        id: 5,
        title: "GPU-accelerated 3D Gas Dispersion and Aerosol Transport Simulator",
        image: "/img/thumbnail/tn_gas_dispersion.png",
        blurb:
          "Simulating hazardous gas leaks and airborne contaminant transport for emergency response and digital twins.",
        href: "/homepage/portfolio/3d_gas_dispersion",
        badges: ["Voxels", "3D Simulation", "Aerosol Transport"],
      },
      {
        id: 6,
        title: "Agentic AI for 2D and 3D Wildfire Simulation",
        image: "/img/thumbnail/tn_wildfire_agentic_ai.png",
        blurb:
          "AI-powered 2D and 3D wildfire simulation with voxel-based fire propagation, interactive visualization, and conversational scenario planning.",
        href: "/homepage/portfolio/agenticAIFire",
        badges: ["Agentic AI", "3D Wildfire", "Voxels"],
      },
      
      {
          id: 7,
          title: "Generative AI Surrogate Modeling for 3D Wildfire Simulation",
          image: "/img/thumbnail/tn_fire_ai.png",
          blurb:
            "Physics-informed Transformer surrogate models for real-time 3D wildfire prediction in voxel-based digital twins.",
          href: "/homepage/portfolio/AIFireSurrogateModel",
          badges: [
            "Generative AI",
            "3D Transformer",
            "Scientific AI",
            "Voxel Simulation",
          ],
        },

      {
        id: 8,
        title: "GPU-accelerated 3D Wildfire Simulator using Voxels",
        image: "/img/thumbnail/tn_wildfire.png",
        blurb:
          "Multi-kernel heat transfer (convection, radiation, conduction, wind) through 3D voxel City.",
        href: "/homepage/portfolio/bushfire_sim",
        badges: ["Voxels", "3D Fire Spread Simulation", "AI Surrogates"],
      },

      
      {
        id: 9,
        title: "Multivariate Time-Series Pattern Analysis with Transformers and VAEs",
        image: "/img/thumbnail/tn_xai_gsle.png",
        blurb:
          "Enhancing Smart Grid Operations with Explainable AI",
        href: "/homepage/portfolio/gsl",
        badges: ["Explainable AI", "Temporal Fusion Transformer", "Variational Autoencoder", "Latent Space"],
      },

      {
        id: 10,
        title: "Mobile Augmented Reality (AR) App for Building Operations (Coming Soon)",
        image: "/img/thumbnail/MAR_HVAC_control.jpg",
        blurb:
          "Smartphone AR for Real-Time Data Visualization and Fault Diagnosis",
        href: "",
        NA: true,
        badges: ["Mobile Augumented Reality", ],
      },
      {
        id: 11,
        title: "Visual Analytics for Ensemble COVID-19 Prediction Analysis (Coming Soon)",
        image: "/img/thumbnail/tn_va_epi.png",
        blurb:
          "Analyzing Uncertainty in COVID-19 Prediction Models through Interactive Visual Analysis and Encoding",
        href: "",
        NA: true,
        badges: ["Visual Analytics", "Geo-Visualization", ],
      },
      
      
      
      // add more…
    ],
    []
  );

  return (
    <div className="mx-auto max-w-9xl">
    <main className="w-full !max-w-none min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">

      <div className="max-w-[2500px] mx-auto">  {/* or w-full for no cap */}
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
          <p> <strong>Email:</strong> haowen.xu.phd@gmail.com</p>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {projects.map((p) => (
            <a
              key={p.id}
              href={p.NA ? undefined : p.href}
              target={p.NA ? undefined : "_blank"}
              rel={p.NA ? undefined : "noopener noreferrer"}
              onClick={(e) => p.NA && e.preventDefault()}
              className={`group relative rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm transition
                ${p.NA ? "cursor-not-allowed" : "hover:ring-blue-400 hover:shadow"}`}
            >
              {/* Thumbnail (always vivid) */}
              <div className="aspect-video overflow-hidden bg-slate-100">
                <img
                  src={`${import.meta.env.BASE_URL}${p.image}`}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>

              {/* Text block (greyed out if NA) */}
              <div className={`p-4 ${p.NA ? "opacity-50" : ""}`}>
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

              {/* Hover overlay (only when active) */}
              {!p.NA && (
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-b from-transparent via-transparent to-black/20" />
              )}
            </a>
          ))}
        </div>
        </section>
      </div>
    </main>
    </div>
  );
}
