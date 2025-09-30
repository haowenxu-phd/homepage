import { useState } from "react";
import { Link } from "react-router-dom";
import publications from "../../data/pub.json"; // adjust path
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Home() {
  // Track which award is open in the modal
  const [selectedAward, setSelectedAward] = useState(null);

  // List of awards (update with your actual image file paths)
  const awards = [
    
    { id: 1, src: "/img/awards/IEEE_MASS_2022.png", alt: "Award 1", 
      caption: "Best Paper Award – IEEE MASS Conference 2022"  },
    { id: 2, src: "/img/awards/IPBSA_2022.png", alt: "Award 2", 
      caption: "Best Demonstration Award - IBPSA 2022"  },
    { id: 3, src: "/img/awards/ORNL_DOE_Significant_event_award_2020.png", alt: "Award 3", 
      caption: "US Government (ORNL) Significant Event Award 2020" },
    { id: 4, src: "/img/awards/AWRA_best_presentation_award.jpg", alt: "Award 4", 
      caption: "Best Presentation - AWRA 2016" },
    { id: 5, src: "/img/awards/CIE_2024.jpeg", alt: "Award 5", 
      caption: "Best Paper Award - CIE 2024"  },
    // Add more awards here...
  ];
  const [isOpen_award, setIsOpen_award] = useState(true);
  const [isOpen_pub, setIsOpen_pub] = useState(false);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl m-0 p-0">
        {/* Card */}
        <section className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-8 p-6">
          {/* Photos (stacked) */}
          <div className="flex flex-col items-center xs:items-start gap-6">
            {/* Photo 1 */}         
            <div className="flex flex-col items-center">
              <div className="relative w-48 sm:w-56 md:w-64 aspect-square overflow-hidden rounded-2xl shadow-md ring-1 ring-black/10">
                <img
                  src="/img/haowen_xu_nas.jpg"
                  alt="Profile 1"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/60" />
              </div>
              <p className="mt-2 text-sm text-slate-600">Invited Talk — Virtual Reality and Digital Twin, U.S. National Academy of Sciences (NAS)  </p>
            </div>

            {/* Photo 2 */}
            <div className="flex flex-col items-center">
              <div className="relative w-48 sm:w-56 md:w-64 overflow-hidden rounded-2xl shadow-md ring-1 ring-black/10">
                <img
                  src="/img/haowen_nl.jpg"
                  alt="Profile 2"
                  className="w-full h-auto object-cover rounded-2xl"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/60" />
              </div>
              <p className="mt-2 text-sm text-slate-600"> Led and contributed to numerous U.S. Department of Energy–funded projects as a federal government scientist</p>
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col justify-start">
            <h4 className="text-3xl font-bold tracking-tight text-slate-700 sm:text-4xl">
              Dr. Haowen Xu
            </h4>

            <p className="text-slate-600 leading-relaxed">
                Currently an <strong>Urban AI Research Fellow (Level B/Lecture)</strong> at{" "}
                <strong>UNSW Sydney</strong>.
              </p>

              <ul className="text-slate-600 leading-relaxed list-disc list-inside space-y-2">
              <li>
                <strong>5.5 years</strong> of post-PhD experience as an
                award-winning <strong>Staff Research Scientist</strong> at the
                <strong> U.S. Department of Energy’s Oak Ridge National Laboratory (ORNL)</strong>,
                and <strong>Adjunct Associate Professor</strong> at the
                <strong> University of Tennessee, Knoxville (UTK)</strong>.
              </li>
              <li>
                Author of <strong>25+ peer-reviewed journal articles</strong> and{" "}
                <strong>35+ conference papers</strong> in prestigious scientific venues.
              </li>
              <li className="leading-relaxed">
                Holder of <strong>two U.S. patent applications</strong>:
                <ul className="mt-1 ml-8 list-[square] text-slate-600">
                  <li>
                          <a
                            href="https://patents.google.com/patent/US20250128708A1/en"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            US20250128708A1
                          </a>{" "}
                          and{" "}
                          <a
                            href="https://patents.google.com/patent/US20250131819A1/en"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            US20250131819A1
                          </a>
                        </li>
                </ul>
              </li>

              <li>
                Recipient of <strong>multiple research awards</strong> from the{" "}
                <strong>U.S. government</strong> and international professional
                associations including <strong>IEEE (Institute of Electrical and Electronics Engineers)</strong>, <strong>CIE (The 51st International Conference on Computers & Industrial Engineering)</strong>,
                and <strong>IBPSA (International Building Performance Simulation Association)</strong>.
              </li>
              <li>
                Served as a <strong>Co-Investigator</strong> on multiple nationally
                funded research projects supported by the U.S. Department of Energy.
              </li>
              <li>
                <strong>Over 930 citations</strong> with an h-index of 17 on {" "}
                <a 
                    href="https://scholar.google.com/citations?user=WdKOUGcAAAAJ&hl=en"
                    target="_blank"                   
                    className="text-blue-600 hover:underline"
                >Google
                Scholar</a>. 
              </li>
              <li>
                Holds <strong>Permanent Residency</strong> in Australia; eligible to work without visa sponsorship
              </li>
            </ul>

            {/* Quick stats / tags */}
            <ul className="mt-2 flex flex-wrap gap-2 text-xs">
              <li className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                Urban Digital Twins
              </li>
              <li className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                LLM Apps
              </li>
              <li className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                Agentic AI
              </li>
              <li className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                HPC & Edge Computing
              </li>
              <li className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                Visual Analytics
              </li>
              <li className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                3D Voxels
              </li>
              <li className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                VR & AR & Serious Gaming
              </li>
            </ul>

            {/* Actions 
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-slate-800 active:translate-y-[1px] transition"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition"
              >
                Contact
              </Link>
              <a
                href="/HaowenXu_CV.pdf"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700 transition"
              >
                CV
              </a>
            </div>*/}
          </div>
        </section>

        {/* 🎖️ Awards Section */}
        <section className="mt-10">
              {/* Collapsible header */}
              <button
                onClick={() => setIsOpen_award(!isOpen_award)}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-xl font-bold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                <span>🏆 Professional Awards</span>
                {/* Use lucide icons if installed, otherwise fallback arrows */}
                {/* <span>{isOpen_award ? "+" : "-"}</span>*/}
                {isOpen_award ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                {/* {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/> } */}
              </button>

              {/* Collapsible content */}
              {isOpen_award && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-[40%_55%] gap-6">
                  <div className="grid grid-cols-1 gap-6 cc1">
                    {[awards[4]].map((award) => (
                      <div
                        key={award.id}
                        className="rounded-xl overflow-hidden shadow ring-1 ring-slate-200 hover:ring-blue-400 transition bg-white"
                        onClick={() => setSelectedAward(award)}
                      >
                        <img
                          src={award.src}
                          alt={award.alt}
                          className="w-full h-auto object-contain"
                        />
                        <div className="px-3 py-2 text-center">
                          <p className="text-sm font-medium text-slate-700">
                            {award.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cc2">
                    {awards.slice(0, 4).map((award) => (
                      <div
                        key={award.id}
                        className="rounded-xl overflow-hidden shadow ring-1 ring-slate-200 hover:ring-blue-400 transition bg-white"
                        onClick={() => setSelectedAward(award)}
                      >
                        <img
                          src={award.src}
                          alt={award.alt}
                          className="w-full h-auto object-contain"
                        />
                        <div className="px-3 py-2 text-center">
                          <p className="text-sm font-medium text-slate-700">
                            {award.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>


        {/* Modal for enlarged award */}
        {selectedAward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative bg-white rounded-xl shadow-lg max-w-3xl w-[90%] h-[90vh] p-4 flex flex-col">
              <button
                onClick={() => setSelectedAward(null)}
                className="absolute top-2 right-2 rounded-full bg-slate-100 hover:bg-slate-200 p-2"
              >
                <strong> Close </strong>
              </button>

              <img
                src={selectedAward.src}
                alt={selectedAward.alt}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
          </div>
        )}


        {/* Publication */}
        <section className="mt-10">
        <button
          className="flex items-center justify-between w-full px-4 py-2 text-left text-xl font-bold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200"
          onClick={() => setIsOpen_pub(!isOpen_pub)}
        >
          <span>📚 Journal Publications ({publications.length})</span>
          {isOpen_pub ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isOpen_pub && (
          <ul className="mt-4 space-y-3 list-decimal list-inside text-slate-700 text-sm">
            {publications.map((pub, idx) => {
              const highlighted = pub["name"].replace(
                /Xu,\s*H/g,
                '<strong class="font-bold">Xu, H</strong>'
              );
              const html = `
                ${highlighted}
                <a 
                  href="${pub["url"]}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="ml-2 text-blue-600 hover:underline"
                >
                  READ
                </a>
              `;
              return (
                <li
                  key={idx}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            })}
          </ul>
        )}
      </section>

        

        {/* Highlights */}
        {/*
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white/70 p-5 ring-1 ring-black/5">
            <h3 className="text-sm font-semibold text-slate-900">
              Digital Twin Platforms
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Real-time situational awareness, control, and analytics for smart
              mobility and energy.
            </p>
          </div>
          <div className="rounded-2xl border bg-white/70 p-5 ring-1 ring-black/5">
            <h3 className="text-sm font-semibold text-slate-900">
              Voxel Wildfire Simulator
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Multi-kernel heat transfer (convection, radiation, conduction,
              wind) at scale.
            </p>
          </div>
        </section>*/}
      </div>
    </main>
  );
}
