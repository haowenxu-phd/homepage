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
// ---------- Media renderer ----------
function ProjectMedia({ items = [], columns = 1, rowHeightPx = 400 }) {
  const twoCustomCols = columns === 2 && items.length === 2;
  const singleItem = items.length === 1;

  // Single item: force full-width single column
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
                className="w-full h-auto object-contain"
              />
            )}

            {m.kind === "video" && (
              <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100">
                <video
                  className="w-full h-auto object-contain"
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

                {/* Overlay text (doesn't block clicks) */} 
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

  if (twoCustomCols) {
    return (
      <div
        className="md:flex md:items-stretch md:gap-4"
        aria-label="Project media gallery"
        style={{ "--rowH": `${rowHeightPx}px` }}
      >
        {items.map((m, idx) => (
          // wrapper controls equal height; width is auto from aspect ratio
          <div key={idx}>
            <figure className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
              {/* Media box with fixed height; width auto */}
              <div className="bg-slate-100 md:h-[var(--rowH)] md:w-auto flex items-center justify-center">
                {/* ----- Image / GIF: width auto from aspect ratio ----- */}
                {(m.kind === "image" || m.kind === "gif") && (
                  <img
                    src={m.src}
                    alt={m.alt || "Project media"}
                    loading="lazy"
                    className="h-full w-auto max-w-none object-contain"
                  />
                )}

                {/* ----- Video: width auto from aspect ratio ----- */}
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

                {/* ----- YouTube: use aspectRatio + fixed height ----- */}
                {m.kind === "youtube" && (
                  <div
                    className="h-full w-auto"
                    style={{
                      // If you can supply m.aspect like "16 / 9", it will be exact.
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

  // Fallback: normal grid
  const gridCols = columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  return (
    <div className={`grid ${gridCols} gap-4`} aria-label="Project media gallery">
      {items.map((m, idx) => (
        <figure
          key={idx}
          className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden"
        >
          <div
            className={
              m.kind === "image"
                ? "aspect-square overflow-hidden rounded-2xl flex items-center justify-center bg-slate-100"
                : "w-full overflow-hidden rounded-2xl flex items-center justify-center bg-slate-100"
            }
          >
            {(m.kind === "image" || m.kind === "gif") && (
              <img
                src={m.src}
                alt={m.alt || "Project media"}
                loading="lazy"
                className={
                  m.kind === "image"
                    ? "w-full h-full object-cover"
                    : "w-full h-auto object-contain"
                }
              />
            )}

            {m.kind === "video" && (
              <video
                className="w-full h-auto object-contain"
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
} // <-- closes the function




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
export default function ProjectDetail5({
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
 

export function GSLDetail() {
  return (
    <ProjectDetail5
      mediaColumns={1}
      media={[
        
        {
          kind: "video",
          src: `${import.meta.env.BASE_URL}/landing/gsl/tft_vae_dash.mp4`,
          alt: "Demo",
          caption: `The visual analytics dashboard for exploring and analyzing different types of grid signature event (e.g., transformer failure, arcing, fuse blow) 
          through the dimension reduction of complex multivariate timeseries of voltage and current data collected from PMU`,
          wpercentage: 100
        },
        {
          kind: "image",
          src: `${import.meta.env.BASE_URL}/landing/gsl/gsl_ai_architecture.png`,
          alt: "Demo",
          caption: `A generative AI framework integrating Temporal Fusion Transformers (TFT) and Variational Autoencoders (VAEs) for dimensionality reduction and representation learning of multivariate time-series data.`,
          wpercentage: 60
        }
      ]}
      title="Explainable AI for Multivariate Time-Series Analytics"
      subtitle="Latent Space Visual Analytics with Transformers and Autoencoders for Power Grid Event Diagnosis"
      sponsor_logos={[
        { src: `${import.meta.env.BASE_URL}/landing/gsl/combined_logo.png`, alt: "ARPA-E & USDOE" },
       // { src: "/img/logos/doe.svg", alt: "U.S. DOE", href: "https://www.energy.gov/" },
 
      ]}
      introColumns={2}
      introLeft={
        <>
          <p>
             The Chattanooga Digital Twin (CTwin) is a next-generation smart city platform designed to transform urban mobility management. Developed as part of the U.S. Department of Energy’s initiative on real-time data and simulation for regional mobility, CTwin serves as an end-to-end, web-based cyberinfrastructure that integrates multi-domain data from IoT sensors, online repositories, and urban systems across Chattanooga, Tennessee. By combining traffic, weather, safety, and hazard data, the platform enables real-time situational awareness, predictive traffic and energy analytics, and cyber-physical control of traffic signals to reduce congestion, incidents, and fuel consumption. CTwin also provides interactive visual analytics for decision-makers, built on a modular and adaptive architecture that makes it scalable and extensible to other cities. Demonstrated through real-world use cases, CTwin showcases the potential of digital twins to deliver smarter, safer, and more sustainable transportation systems.
             </p>
          <p className="mt-3">
    
          </p>
        </>
      }
      
      introRight={   
         <ul className="list-disc list-inside text-slate-700">
            <li>Proposed a novel visual analytics framework integrating Temporal Fusion Transformers (TFT) and Variational Autoencoders (VAEs) for dimensionality reduction of multivariate time-series data.</li>
            <li>Applied latent space mapping with PCA, t-SNE, and UMAP to reveal correlations, similarities, and dependencies among complex temporal patterns.</li>
            <li>Developed customized visual encodings, including a Multivariate 2D Latent Vector Map and a Hierarchical Multi-label Tree, for interactive exploration of multi-label grid event data.</li>
            <li>Introduced validation workflows combining quantitative metrics, Human-in-the-Loop evaluation, and relative model comparisons to ensure robustness and interpretability.</li>
            <li>Benchmarked TFT against convolutional and LSTM-based VAEs, demonstrating superior scalability, efficiency, and runtime performance across diverse data shapes.</li>
            <li>Demonstrated use cases with DOE’s Grid Event Signature Library (GESL), enabling inter-pattern dependency analysis, fault label imputation, and model parameter tuning for grid event diagnosis.</li>
          </ul>
      }
      relatedLinks={[
        
        /*{ label: "Live demo (viewer)", href: "https://yourlink.example/voxel-viewer", tag: "demo" },
        { label: "CTwin platform", href: "https://yourlink.example/ctwin", tag: "platform" },*/
        { label: "Grid Event Signature Library (GESL)", href: "https://gsl.ornl.gov/", tag: "government report" },

        
      ]}
      awards={
          [ 
             
        
          ]
    }
      publications={[
        {
          authors: "Xu, H., et al.",
          title: "Explainable AI for Multivariate Time Series Pattern Exploration: Latent Space Visual Analytics with Temporal Fusion Transformer and Variational Autoencoders in Power Grid Event Diagnosis",
          venue: "IEEE Access",
          year: "2025",
          doi: "https://ieeexplore.ieee.org/abstract/document/11141392",
          badges: ["Journal Paper"],
        },
              
 
      
      ]}
    />
  );
}
