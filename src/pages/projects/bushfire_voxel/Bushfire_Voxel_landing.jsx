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
  const gridCols = columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  return (
    <div className={`grid ${gridCols} gap-4`} aria-label="Project media gallery">
      {items.map((m, idx) => (
        <figure
          key={idx}
          className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm"
        >
          {/* Media box (square container) */}
          <div className="aspect-square overflow-hidden rounded-2xl flex items-center justify-center bg-slate-100">
            {(m.kind === "image" || m.kind === "gif") && (
              <img
                src={m.src}
                alt={m.alt || "Project media"}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            )}

            {m.kind === "video" && (
              <video
                className="w-full h-full object-cover"
                poster={m.poster}
                autoPlay={m.autoplay}
                loop={m.loop}
                muted={m.muted ?? true}
                playsInline
                controls={m.controls ?? true}
              >
                <source src={m.src} />
              </video>
            )}

            {m.kind === "youtube" && (
              <iframe
                className="w-full h-full object-cover"
                src={m.src}
                title={m.title || "YouTube video"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}
          </div>

          {/* Caption */}
          {m.caption && (
            <figcaption >
              <h6>{m.caption}</h6>
            </figcaption>
          )}
        </figure>
      ))}
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
export default function ProjectDetail({
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
 

export function VoxelFireDetail() {
  return (
    <ProjectDetail
      mediaColumns={2}
      media={[
        {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/liverpool_voxel.mp4`,
          alt: "VoxelFire",
          title: "Demo",
          autoPlay:true,
          caption: "Creating a 3D voxel model of Liverpool (NSW) that integrates city features and fuel type classification from LiDAR and GIS data."
        },
        {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/firespread_voxel.mp4`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "3D simulation of heat transer and fire spread across millions of voxels, capturing turbulent wind dynamics in a complex urban environment."
        },
        {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/voxel_fire_sim_scenario_1.mp4`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "Fire spread simulation scenario showing propagation under a north wind of 5 m/s across a residential area."
        },
        {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/voxel_fire_sim_scenario_2.mp4`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "Fire spread simulation scenario under no-wind conditions, with the ignition point located in a high-rise building."
        },
        {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/SA_1000x1000x100_1_1_1_s3_short.mp4`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "Fire spread simulation scenario in residential area in South Australia.",
           wpercentage: 100
        },
        {
          kind: "image",
          src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/flowchart.png`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "Agentic AI workflow for autormating fire simulation through AI agents.",
           wpercentage: 50
        },  
        /*    
        {
          kind: "image",
          src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/3D_hologram.png`,
          alt: "VoxelFire",
          autoPlay:true,
          caption: "Mixed-reality visualization of 3D fire simulations on holographic display tables (implemented) and a mobile augmented reality interface (under development).",
           wpercentage: 50
        }*/
         

        
      ]}

      title="Simulating Fire Spread in Urban Environments using 3D Voxels and High-performance Parallel Programing"
      subtitle="City-scale identification of wildland–urban interface (WUI) fire spread paths using real-world GIS data for real-time decision support"
      sponsor_logos={[
        { src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/unsw_logo.png`, alt: "UNSW" },
       // { src: "/img/logos/doe.svg", alt: "U.S. DOE", href: "https://www.energy.gov/" },
        { src: `${import.meta.env.BASE_URL}/landing/voxel_fire_sim/nswfr_logo.png`, alt: "NSW Fire & Rescue" },
      ]}
      introColumns={2}
      introLeft={
        <>
        <p>
          This research is conducted as part of the <strong>UNSW Geospatial Research Innovation Development (GRID) project</strong>, which advances cutting-edge geospatial science, digital twin technologies, and high-performance environmental simulation for resilient cities and infrastructure.
        </p>
          <p>
          
           The <strong>Voxel Wildfire Simulator</strong> is a lightweight, <strong>Python-based 3D modeling framework</strong> for simulating wildfire propagation across complex <strong>urban and natural environments</strong>. Built on the <strong>Taichi parallel computing engine</strong>, it integrates <strong>LiDAR-derived voxel models</strong>, <strong>GIS-based fuel classifications</strong>, and <strong>physics-informed heat-transfer equations</strong> to capture dynamic fire behavior in both vertical and horizontal dimensions. The simulator models <strong>convection</strong>, <strong>radiation</strong>, and <strong>conduction</strong> across 3D voxel grids, enabling realistic visualization of surface and crown fires at <strong>meter-level resolution</strong>. Designed for <strong>modularity and scalability</strong>, it supports <strong>high-performance execution</strong> on CPUs and GPUs, <strong>real-time visualization</strong> in Blender and Unity, and seamless integration with <strong>urban digital twins</strong> and <strong>environmental simulation platforms</strong>. A <strong>case study in Newcastle, Australia</strong> demonstrates how detailed LiDAR data and voxelized urban topography reveal critical fire-spread pathways—providing <strong>actionable insights</strong> for firefighting, hazard reduction, and emergency response planning.
          </p>
          <p className="mt-3">
            The <strong>AI surrogate model</strong>, built using <strong>generative AI</strong> and a <strong>3D Transformer</strong> architecture, is trained on simulator-generated data to predict next-step fire states <strong>10–100× faster</strong> than the physical model, enabling near-real-time decision support for <strong>urban fire management</strong>. Within six months at UNSW, I delivered a <strong>physics-based voxel fire spread simulator</strong> powered by <strong>parallel computing</strong>, and a <strong>transformer-based surrogate model</strong> for rapid 3D fire spread inference. The model is currently being <strong>trained and optimized on UNSW’s Katana HPC system</strong>, advancing AI-accelerated fire prediction for <strong>digital twin</strong> and <strong>urban resilience</strong> applications.
            
            </p>
        </>
      }
      
      introRight={
        <ul className="list-disc list-inside text-slate-700">
          <li>Voxel resolution: 1–5 m; neighborhood model: 26-connectivity</li>
          <li>Input parameters: wind, fuel type, moisture, and topography</li>
          <li>Output states: heating, igniting, burning, and burned phases</li>
          <li>
            Technologies used: Python <strong>Taichi</strong> framework for large-scale, 
            parallel fire spread simulation; and <strong>VTK</strong> for high-performance 
            3D visualization of urban fire dynamics across millions of voxels
          </li>
           <li>
            The fire spread simulation framework is fully generalizable and can be 
            extended to any region in Australia with voxel-based datasets containing 
            fuel type classification, which can be derived from <strong>LiDAR</strong>, 
            <strong>BIM</strong>, and land-use data sources.
          </li>
          <li>
            Fire spread visualization is rendered directly in the browser and can be 
            interactively played, explored, and shared online for collaborative analysis 
            and decision support.
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
          title: "Generative AI as a Pillar for Predicting 2D and 3D Wildfire Spread: Beyond Physics-Based Models and Traditional Deep Learning",
          venue: "Fire",
          year: "2025",
          doi: "https://www.mdpi.com/2571-6255/8/8/293",
          badges: ["Open Access", "Journal Paper"],
        },
        {
          authors: "Xu, H., et al.",
          title: "A Modular Light-weight Voxel-Based 3D Wildfire Propagation Simulator in Python Using LiDAR Data, High-Performance Computing (HPC), and Immersive Scientific Visualization",
          venue: "ISPRS Annals of the Photogrammetry, Remote Sensing and Spatial Information Sciences",
          year: "2026",
          doi: "https://isprs-annals.copernicus.org/articles/X-3-W3-2025/127/2026/isprs-annals-X-3-W3-2025-127-2026.html",
          badges: ["Conference Paper", "Journal Paper"],
        },
        {
          authors: "Xu, H., et al.",
          title: "Collaborative Fire Management for Community Wildfire Prevention Using Agentic AI, Simulation, and Mixed-Reality Visualization",
          venue: " ISPRS Congress",
          year: "2026",
          doi: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5762363",
          badges: ["Conference Paper"],
        },
      
      ]}
    />
  );
}
