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
    <span className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
      {children}
    </span>
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
function ProjectMedia({ items = [], columns = 1, rowHeightPx = 200 }) {
  const twoCustomCols = columns === 2 && items.length === 2;
  const singleItem = items.length === 1;

  // --- SINGLE ITEM ---
  if (singleItem) {
    const m = items[0];
    return (
      <div
        className="w-full"
        aria-label="Project media (single item)"
        style={{ "--rowH": `${rowHeightPx}px` }}
      >
        <figure className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
          <div className="w-full flex items-center justify-center bg-slate-100">
            {(m.kind === "image" || m.kind === "gif") && (
              <img
                src={m.src}
                alt={m.alt || "Project media"}
                loading="lazy"
                className="block w-full max-w-full h-auto object-contain"
              />
            )}

            {m.kind === "video" && (
              <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100">
                <video
                  className="block w-full h-auto object-contain"
                  poster={m.poster}
                  autoPlay={m.autoplay}
                  loop={m.loop}
                  muted={m.muted ?? true}
                  playsInline
                  controls={m.controls ?? true}
                  preload="auto"
                >
                  <source src={m.src} type="video/mp4" />
                </video>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="rounded-md bg-black/50 px-3 py-1 text-xs text-white">
                    Click the video to play
                  </span>
                </div>
              </div>
            )}

            {m.kind === "youtube" && (
              <div className="w-full aspect-video">
                <iframe
                  className="w-full h-full"
                  src={m.src}
                  title={m.title || "YouTube video"}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {m.caption && (
            <figcaption className="px-2 py-2 text-xs text-center text-slate-600 leading-snug">
              {m.caption}
            </figcaption>
          )}
        </figure>
      </div>
    );
  }

  // --- TWO CUSTOM COLS ---
  if (twoCustomCols) {
    return (
      <div
        className="md:flex md:items-stretch md:gap-4"
        aria-label="Project media gallery"
        style={{ "--rowH": `${rowHeightPx}px` }}
      >
        {items.map((m, idx) => (
          <div key={idx}>
            <figure className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-100 md:h-[var(--rowH)] md:w-auto flex items-center justify-center">
                {(m.kind === "image" || m.kind === "gif") && (
                  <img
                    src={m.src}
                    alt={m.alt || "Project media"}
                    loading="lazy"
                    className="h-full w-auto max-w-none object-contain"
                  />
                )}

                {m.kind === "video" && (
                  <video
                    className="h-full w-auto max-w-none object-contain"
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
                  <div
                    className="h-full w-auto"
                    style={{
                      aspectRatio: m.aspect || "16 / 9",
                    }}
                  >
                    <iframe
                      className="h-full w-auto"
                      src={m.src}
                      title={m.title || "YouTube video"}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {m.caption && (
                <figcaption className="px-2 py-2 text-xs text-center text-slate-600 leading-snug">
                  {m.caption}
                </figcaption>
              )}
            </figure>
          </div>
        ))}
      </div>
    );
  }

  // --- FALLBACK GRID ---
  const gridCols = columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  return (
    <div className={`grid ${gridCols} gap-4`} aria-label="Project media gallery">
      {items.map((m, idx) => (
        <figure
          key={idx}
          className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden"
        >
          <div className="w-full overflow-hidden rounded-2xl flex items-center justify-center bg-slate-100">
            {(m.kind === "image" || m.kind === "gif") && (
              <img
                src={m.src}
                alt={m.alt || "Project media"}
                loading="lazy"
                className="block w-full max-w-full h-auto object-contain"
              />
            )}

            {m.kind === "video" && (
              <video
                className="block w-full h-auto object-contain"
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
              <div className="w-full aspect-video">
                <iframe
                  className="w-full h-full"
                  src={m.src}
                  title={m.title || "YouTube video"}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {m.caption && (
            <figcaption className="px-2 py-2 text-xs text-center text-slate-600 leading-snug">
              {m.caption}
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
export default function ProjectDetail10 ({
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
            <div className="flex justify-center md:justify-end [&_img]:h-20 [&_img]:sm:h-20 [&_img]:md:h-30">
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
                  <SectionTitle><h3>Related Webpages & Media</h3></SectionTitle>
                  <div className="mt-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2">
                    <BulletList items={relatedLinks} />
                  </div>
                </div>
              )}

              {/* Awards column */}
              {awards?.length > 0 && (
                <div>
                  <SectionTitle><h3>Awards & Recognition</h3></SectionTitle>
                  <div className="mt-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2">
                    <BulletList items={awards} />
                  </div>
                </div>
              )}
            </section>
          )}


          {/* 5) Publications */}
          <section className="mt-4">
            <SectionTitle><h3>Publications</h3></SectionTitle>
            <div className="mt-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-2">
              <Publications items={publications} />
            </div>
          </section>

          {/* Back link */}
          <div className="mt-4">
            <Link
              to="/portfolio"
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
 
export function VoxelMine() {
  return (
    <ProjectDetail10

      /* =========================================================
         Project Media
         ========================================================= */

      mediaColumns={1}

      media={[
        {
          kind: "video",

          // KEEP VIDEO UNCHANGED
          src: `${import.meta.env.BASE_URL}/landing/voxelMine/Bengalla_Mining_Open_cut_5m_Voxels.mp4`,

          alt:
            "5-meter voxel-based 3D world model of Bengalla Mine generated from open geospatial datasets",

          caption:
            "5 m resolution voxel-based 3D world model of the Bengalla Mine environment in New South Wales, generated through an automated geospatial data integration and voxelization workflow.",

          wpercentage: 100,
        },
      ]}


      /* =========================================================
         Project Header
         ========================================================= */

      title="Voxel-Based 3D World Model Generation from Open Geospatial Data"

      subtitle="An automated pipeline for integrating LiDAR, terrain, land-cover, and geospatial datasets into simulation-ready 3D voxel environments for environmental, urban, and industrial applications"


      /* =========================================================
         Sponsors / Logos
         ========================================================= */

      // KEEP LOGO SECTION UNCHANGED
      sponsor_logos={[
        /*{
          src: `${import.meta.env.BASE_URL}/landing/voxelMine/BHP.jpg`,
          alt: "BHP",
        },*/

        // Example:
        // {
        //   src: `${import.meta.env.BASE_URL}/img/logos/doe.svg`,
        //   alt: "U.S. Department of Energy",
        //   href: "https://www.energy.gov/",
        // },
      ]}


      /* =========================================================
         Project Introduction
         ========================================================= */

      introColumns={2}

      introLeft={
        <>
          <p>
            This project demonstrates an automated pipeline for generating
            <strong> voxel-based 3D world models</strong> from open
            geospatial datasets. The Bengalla Mine in New South Wales is
            used as a demonstration environment, where LiDAR and elevation
            data, land-cover information, terrain, and other spatial
            datasets are automatically processed, spatially integrated,
            and converted into a structured
            <strong> 5 m resolution volumetric voxel model</strong>.
          </p>

          <p className="mt-3">
            Rather than treating the resulting environment only as a
            three-dimensional visualization, the project uses voxels as a
            <strong> structured spatial data model</strong>. Each voxel can
            store environmental, physical, urban, infrastructure, and
            operational attributes within a common volumetric coordinate
            system. This creates a unified representation through which
            heterogeneous geospatial information can be queried, analyzed,
            updated, and coupled with computational models.
          </p>

          <p className="mt-3">
            The resulting voxel environment therefore acts as a
            <strong> 3D computational world model</strong>: it represents
            not only the geometry and semantic characteristics of the
            physical environment, but also provides the spatial structure
            required to simulate environmental processes through space and
            time. Examples include heat transfer, gas and pollutant
            dispersion, airflow, mass transport, wildfire propagation,
            flooding, and other spatially distributed physical processes.
          </p>

          <p className="mt-3">
            Because the workflow relies primarily on open and broadly
            available Australian and global geospatial datasets, the same
            pipeline can be applied beyond the Bengalla case study to
            generate simulation-ready 3D environments across Australia for
            mining, transportation, urban systems, infrastructure,
            environmental modeling, and digital-twin applications.
          </p>
        </>
      }


      /* =========================================================
         Technical Features
         ========================================================= */

      introRight={
        <ul className="list-inside list-disc space-y-2 text-slate-700">

          <li>
            Developed an automated
            <strong> geospatial-to-voxel processing pipeline</strong> for
            constructing large-scale 3D environments from heterogeneous
            spatial datasets.
          </li>

          <li>
            Integrated open
            <strong> LiDAR, elevation, terrain, and land-cover datasets</strong>
            into a unified three-dimensional spatial representation.
          </li>

          <li>
            Incorporated
            <strong> ESA WorldCover land-cover information</strong> to
            characterize vegetation, built-up areas, bare surfaces,
            water, and other environmental classes.
          </li>

          <li>
            Generated a
            <strong> 5 m resolution voxel model</strong> of the Bengalla
            Mine and its surrounding environmental and industrial landscape.
          </li>

          <li>
            Used voxels as a
            <strong> structured volumetric data format</strong> rather than
            only as a visualization representation.
          </li>

          <li>
            Enabled individual voxels to carry
            <strong> semantic, environmental, physical, infrastructure,
            and operational attributes</strong>.
          </li>

          <li>
            Created a common 3D spatial framework for integrating
            heterogeneous GIS, remote sensing, terrain, infrastructure,
            and industry-related datasets.
          </li>

          <li>
            Designed the voxel environment as a
            <strong> simulation-ready computational domain</strong> for
            physics-based and data-driven environmental modeling.
          </li>

          <li>
            Supports volumetric simulation of processes such as
            <strong> heat transfer, mass transport, gas dispersion,
            airflow, wildfire propagation, and other environmental dynamics</strong>.
          </li>

          <li>
            Provides a foundation for
            <strong> 3D digital twins and world models</strong> in which
            geometry, semantics, physical state, and simulation variables
            coexist within the same spatial representation.
          </li>

          <li>
            Uses broadly available geospatial datasets so the workflow can
            be transferred to
            <strong> other locations throughout Australia</strong>.
          </li>

          <li>
            Designed for applications across
            <strong> mining, transportation, urban environments,
            infrastructure, natural hazards, and environmental systems</strong>.
          </li>

        </ul>
      }


      /* =========================================================
         Related Resources
         ========================================================= */

      relatedLinks={[
        {
          label:
            "Bengalla Mining Company",

          href:
            "https://newhopegroup.com.au/bengalla-mining-company/",

          desc:
            "Bengalla Mine in New South Wales is used as the demonstration environment for the 5 m resolution voxel-based 3D world model.",

          tag: "case study",
        },

        {
          label:
            "ESA WorldCover",

          href:
            "https://esa-worldcover.org/en",

          desc:
            "Global land-cover dataset used to provide semantic characterization of vegetation, built-up areas, water, bare land, and other surface classes.",

          tag: "open data",
        },

        {
          label:
            "Australian Elevation and Depth Data — ELVIS",

          href:
            "https://elevation.fsdf.org.au/",

          desc:
            "Australian platform for discovering and accessing elevation, terrain, and related geospatial datasets used to support 3D environmental reconstruction.",

          tag: "open data",
        },
      ]}


      /* =========================================================
         Awards
         ========================================================= */

      awards={[]}


      /* =========================================================
         Publications
         ========================================================= */

      publications={[]}

    />
  );
}
