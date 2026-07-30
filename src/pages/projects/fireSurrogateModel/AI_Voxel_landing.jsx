import React from "react";
import { Link } from "react-router-dom";

/**
 * ProjectDetail.jsx — a reusable, responsive detail page for an individual project
 *
 * ✅ Keeps your existing site chrome: drop it into a route and place <Navbar/> above
 * ✅ First row: single or double column media (video / image / GIF / YouTube)
 * ✅ Second row: centered title + subtitle + sponsor/funder logos
 * ✅ Third row: single or double column intro/illustration copy
 * ✅ Fourth row: related links (webpages, media, awards, etc.)
 * ✅ Fifth row: publications list (citations with links)
 *
 * Tailwind only, no external UI deps. Works with Vite/React Router.
 */

// ---------- Types ----------
/**
 * @typedef {Object} MediaItem
 * @property {"image"|"video"|"youtube"|"gif"} kind
 * @property {string} src          // url or local path
 * @property {string} [poster]     // for <video>
 * @property {string} [alt]
 * @property {boolean} [autoplay]
 * @property {boolean} [loop]
 * @property {boolean} [muted]
 * @property {boolean} [controls]
 * @property {string} [title]      // for YouTube iframe title
 *
 * @typedef {Object} LogoItem
 * @property {string} src
 * @property {string} alt
 * @property {string} [href]
 * @property {string} [title]
 *
 * @typedef {Object} LinkItem
 * @property {string} label
 * @property {string} href
 * @property {string} [desc]
 * @property {string} [tag]        // e.g., "video", "demo", "press", "award"
 *
 * @typedef {Object} Publication
 * @property {string} title
 * @property {string} [authors]
 * @property {string} [venue]
 * @property {string} [year]
 * @property {string} [doi]
 * @property {string} [url]
 * @property {string[]} [badges]
 */



// ---------- Small helpers ----------
function SectionTitle({ children }) {
  return (
    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

function External({ href, children, className = "" }) {
  const base =
    "inline-flex items-center gap-1 hover:text-blue-700 transition-colors";
  return (
    <a
      className={`${base} ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4 opacity-70"
      >
        <path d="M13 3h8v8h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H13V3z" />
        <path d="M5 5h6v2H7v10h10v-4h2v6H5V5z" />
      </svg>
    </a>
  );
}

// ---------- Media renderer ----------
function ProjectMedia({ items = [], columns = 2 }) {
  const gridCols =
    columns === 1
      ? "grid-cols-1"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <div
      className={`grid ${gridCols} gap-4`}
      aria-label="Project media gallery"
    >
      {items.map((m, idx) => {
        const isFullWidth = columns === 1 || m.wpercentage === 100;

        return (
          <figure
            key={idx}
            className={[
              "rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm",
              isFullWidth ? "md:col-span-2" : "md:col-span-1",
            ].join(" ")}
          >
            {/* Media box */}
            <div className="overflow-hidden rounded-t-2xl bg-slate-100">
              {(m.kind === "image" || m.kind === "gif") && (
                <img
                  src={m.src}
                  alt={m.alt || "Project media"}
                  loading="lazy"
                  className="block w-full h-auto"
                />
              )}

              {m.kind === "video" && (
                <video
                  className="h-full w-full object-cover"
                  poster={m.poster}
                  autoPlay={m.autoPlay ?? false}
                  loop={m.loop ?? true}
                  muted={m.muted ?? true}
                  playsInline
                  controls={m.controls ?? true}
                >
                  <source src={m.src} />
                </video>
              )}

              {m.kind === "youtube" && (
                <iframe
                  className="h-full w-full"
                  src={m.src}
                  title={m.title || "YouTube video"}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              )}
            </div>

            {m.caption && (
              <figcaption className="px-4 py-3">
                <p className="text-sm leading-6 text-slate-700">
                  {m.caption}
                </p>
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}


// ---------- Logo strip ----------
function LogoStrip({ logos = [] }) {
  if (!logos.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      {logos.map((l, i) => (
        l.href ? (
          <a key={i} href={l.href} target="_blank" rel="noopener noreferrer"
             className="opacity-80 hover:opacity-100 transition">
            <img src={l.src} alt={l.alt} className="h-8 sm:h-10 object-contain" />
          </a>
        ) : (
          <img key={i} src={l.src} alt={l.alt} className="h-8 sm:h-10 opacity-80 object-contain" />
        )
      ))}
    </div>
  );
}

// ---------- Links / Awards list ----------
function BulletList({ items = [], empty = "—" }) {
  if (!items.length) return <p className="text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1.5 size-2 rounded-full bg-slate-300" />
          {typeof it === "string" ? (
            <span className="text-slate-700">{it}</span>
          ) : (
            <div className="-mt-0.5">
              <External href={it.href}>
                <span className="font-medium">{it.label}</span>
              </External>
              {it.desc && (
                <p className="text-sm text-slate-600">{it.desc}</p>
              )}
              {it.tag && (
                <span className="mt-1 inline-block text-[10px] uppercase tracking-wide bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ring-1 ring-inset ring-slate-200">
                  {it.tag}
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// ---------- Publications list ----------
function Publications({ items = [] }) {
  if (!items.length) return <p className="text-slate-500">—</p>;
  return (
    <ol className="space-y-4 list-decimal pl-5">
      {items.map((p, i) => (
        <li key={i} className="text-slate-800">
          <div>
            {p.authors && <span className="text-slate-700">{p.authors}. </span>}
            <span className="font-medium">{p.title}</span>
            {p.venue && <span className="text-slate-700">, {p.venue}</span>}
            {p.year && <span className="text-slate-700">, {p.year}</span>}
            {(p.doi || p.url) && (
              <>
                {". "}
                <External href={p.url || `${p.doi}`}>
                  {p.doi ? `${p.doi}` : "Link"}
                </External>
              </>
            )}
          </div>
          {p.badges?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {p.badges.map((b, j) => (
                <span key={j} className="text-[11px] rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

// ---------- Main component ----------
export default function ProjectDetail9({
  // First row (media)
  media = /** @type {MediaItem[]} */ ([]),
  mediaColumns = 2, // 1 or 2

  // Second row (header + logos)
  title,
  subtitle,
  sponsor_logos = /** @type {LogoItem[]} */ ([]),

  // Third row (intro / illustration)
  introLeft, // string | ReactNode
  introRight, // string | ReactNode
  introColumns = 2, // 1 or 2

  // Fourth row (links & awards)
  relatedLinks = /** @type {LinkItem[]} */ ([]),
  awards = /** @type {LinkItem[]|string[]} */ ([]),

  // Fifth row (publications)
  publications = /** @type {Publication[]} */ ([]),
}) {
  const introGrid = introColumns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="w-full">
      {/* Keep your global navbar above this component in the route layout */}
      <main className="w-full !max-w-none min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-[1200px] mx-auto px-2 sm:px-3 lg:px-4 py-2">
          
         

          {/* 2) Header + Logos (compact) */}
          <section className="mt-4 grid grid-cols-1 md:grid-cols-[80%_20%] items-center gap-2 text-center md:text-left">
          {/* Left: Title + Subtitle */}
          <div className="m-0 p-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 m-0 p-0">
              {title}
            </h2>
            {subtitle && (
              <h5 className="mt-2 text-slate-600 max-w-3xl mx-auto md:mx-0 text-sm leading-snug">
                {subtitle}
              </h5>
            )}
          </div>
          {/* Right: Sponsor label + Logos */}
          <div className="flex flex-col items-center md:items-end m-0 p-0">
            <h6 className="text-[12px] font-semibold items-center uppercase tracking-wide text-slate-500 mb-1">
              Sponsors:
            </h6>
            <div className="flex justify-center md:justify-end [&_img]:h-12 [&_img]:sm:h-14 [&_img]:md:h-16">
              <LogoStrip logos={sponsor_logos} />
            </div>
          </div>
        </section>
            <br></br>
         {/* 1) Media Row */}
          <section className="m-0 p-0">
            <ProjectMedia items={media} columns={mediaColumns} />
          </section>

          {/* 3) Intro / Illustration */} 
          {(introLeft || introRight) && (
            <section className="mt-4">
              <div
                className={`grid ${
                  introLeft && introRight
                    ? "grid-cols-1 md:grid-cols-2 gap-2"
                    : "grid-cols-1"
                }`}
              >
                {introLeft && (
                  <div className="rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2 text-slate-700 leading-snug">
                    <SectionTitle><h3>Intro</h3></SectionTitle>
                    {typeof introLeft === "string" ? <p className="m-0">{introLeft}</p> : introLeft}
                  </div>
                )}

                {introRight && (
                  <div className="rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2 text-slate-700 leading-snug">
                    <SectionTitle><h3>Features</h3></SectionTitle>
                    {typeof introRight === "string" ? <p className="m-0">{introRight}</p> : introRight}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 4) Related Links & Awards — two-column, hide empty columns */}
          {(relatedLinks?.length > 0 || awards?.length > 0) && (
            <section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Related Links column */}
              {relatedLinks?.length > 0 && (
                <div>
                  <SectionTitle> <h3>Related webpages & media</h3></SectionTitle>
                  <div className="mt-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2">
                    <BulletList items={relatedLinks} />
                  </div>
                </div>
              )}

              {/* Awards column */}
              {awards?.length > 0 && (
                <div>
                  <SectionTitle> <h3>Awards & recognition</h3></SectionTitle>
                  <div className="mt-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2">
                    <BulletList items={awards} />
                  </div>
                </div>
              )}
            </section>
          )}


          {/* 5) Publications */}
          <section className="mt-4">
            <SectionTitle>  <h3>Publications</h3>  </SectionTitle>
            <div className="mt-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2">
              <Publications items={publications} />
            </div>
          </section>

          {/* Back link */}
          <div className="mt-4">
            <Link
              to="/portfolio/"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M10 19l-7-7 7-7v4h8v6h-8v4z" />
              </svg>
              Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- Example usage (remove in production) ----------
// You can render this in a route like: <Route path="/projects/voxel-fire" element={<VoxelFireDetail/>} />

// ${import.meta.env.BASE_URL}${p.image}`
 

export function VoxelAISurrogateModel() {
  return (
    <ProjectDetail9
      mediaColumns={2}
      media={[
         {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/voxel_ai_fire_sim/voxel_vt_simulate_AI.mp4`,
          alt: "VoxelFire",
          title: "Demo",
          autoPlay:true,
          caption: "AI-predicted 3D wildfire spread using a patch-based Transformer surrogate model.",
           wpercentage: 50
        },
        {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/voxel_ai_fire_sim/voxel_vt_simulate_GroundTruth.mp4`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "Benchmark  3D wildfire spread generated by the physics-based voxel simulator.",
           wpercentage: 50
        },
         
         
        {
          kind: "image",
          src: `${import.meta.env.BASE_URL}/landing/voxel_ai_fire_sim/AI_model_architecture.png`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "Proposed 3D patch-based Transformer surrogate model, integrating voxel feature engineering with encoder–decoder attention mechanisms for predicting spatiotemporal fire dynamics.",
           wpercentage: 100
        },  
        {
          kind: "image",
          src: `${import.meta.env.BASE_URL}/landing/voxel_ai_fire_sim/result_output.png`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: `Overview and evaluation of the generative AI surrogate model for 3D wildfire simulation. (a) Model configuration
                  and example prediction showing close agreement with ground truth. (b) Distributions of inference accuracy and inference time,
                  indicating high accuracy and efficiency. (c) Temporal comparison of AI-predicted (top) and ground-truth (bottom) fire spread at
                  selected timesteps (T=15, 45, 75, 105, 135), demonstrating consistent agreement in propagation patterns.
                  Transformer`,
           wpercentage: 100
        },   
      ]}

      title="Transformer-based Generative AI Surrogate Modeling for 3D Voxel Simulation"
      subtitle="An AI-enabled voxel simulation framework for real-time prediction of complex environmental processes using physics-informed surrogate models."
      sponsor_logos={[
        { src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/unsw_logo.png`, alt: "UNSW" },
       // { src: "/img/logos/doe.svg", alt: "U.S. DOE", href: "https://www.energy.gov/" },
        { src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/nswfr_logo.png`, alt: "NSW Fire & Rescue" },
      ]}
      introColumns={2}
      introLeft={
          <>
            <p>
              This research is conducted within the <strong>UNSW Geospatial Research Innovation Development (GRID)</strong> project, advancing AI-enabled voxel-based digital twins for high-performance environmental simulation.
            </p>

            <p className="mt-3">
              The <strong>Voxel Wildfire Simulator</strong> is a GPU-accelerated, Python-based framework for high-resolution 3D wildfire simulation. Built on the <strong>Taichi</strong> parallel computing engine, it integrates <strong>LiDAR</strong>, <strong>GIS</strong>, and physics-based heat transfer to simulate fire propagation through 3D voxel environments for urban digital twins and emergency planning.
            </p>

            <p className="mt-3">
              A <strong>generative AI surrogate model</strong> based on a <strong>patch-based 3D Transformer</strong> learns fire dynamics from physics-generated simulations, achieving up to <strong>92% median voxel-wise accuracy</strong> while enabling near real-time prediction for large-scale 3D environmental simulation and digital twin applications.
            </p>
          </>
        }
      
      introRight={
        <ul className="list-disc list-inside text-slate-700">
              <li>
                High-resolution <strong>3D voxel-based wildfire simulation</strong> using
                LiDAR-derived urban environments and physics-informed heat transfer.
              </li>

              <li>
                Multi-channel environmental inputs including <strong>fuel properties</strong>,
                <strong> wind</strong>, terrain, and combustion states.
              </li>

              <li>
                GPU-accelerated simulation using <strong>Python</strong>,{" "}
                <strong>Taichi</strong>, and high-performance parallel computing.
              </li>

              <li>
                <strong>Patch-based 3D Transformer</strong> surrogate model for rapid
                spatiotemporal fire prediction from physics-generated simulation data.
              </li>

              <li>
                Supports scalable <strong>AI-enabled digital twins</strong>, scenario
                analysis, emergency response, and environmental simulation.
              </li>

              <li>
                Browser-based interactive 3D visualization for exploring and sharing
                simulation results.
              </li>
            </ul>
      }
      relatedLinks={[
        /*
        { label: "Live demo (viewer)", href: "https://yourlink.example/voxel-viewer", tag: "demo" },
        { label: "CTwin platform", href: "https://yourlink.example/ctwin", tag: "platform" },
        { label: "Press coverage", href: "https://yourlink.example/press", tag: "press" },
         */
      ]}
      awards={
          [ /*
             { label: "Best Poster — IEEE MASS 2022", href: "https://yourlink.example/award" },
            "UNSW BE Research Showcase Finalist",
            */
          ]
    }
      publications={[
        {
          authors: "Xu, H., et al.",
          title: "An Exploratory Study of Transformer-based Generative AI Surrogate Modeling for 3D Wildfire Spread Simulation in Voxelized City",
          venue: "ISPRS Annals of the Photogrammetry, Remote Sensing and Spatial Information Sciences (Accepted)",
          year: "2026",
          doi: "https://papers.ssrn.com/sol3/Delivery.cfm/6572079.pdf?abstractid=6572079&mirid=1",
          badges: ["Open Access", "Conference Paper"],
        },
         
      
      ]}
    />
  );
}
