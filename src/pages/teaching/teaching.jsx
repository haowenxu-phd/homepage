import { useState } from "react";
import { Link } from "react-router-dom";
import publications from "../../data/pub.json"; // adjust path
import { ChevronDown, ChevronUp } from "lucide-react";
import { ArrowRight } from "lucide-react";

export default function Teaching() {
  // Track which award is open in the modal
  const [selectedAward, setSelectedAward] = useState(null);

  // List of awards (update with your actual image file paths)
  const teaching_mentors = [
        {
          id: 1,
          orientation: "portrait",
          src: `${import.meta.env.BASE_URL}/img/teaching_engagement/US_Department_of_Energy_SULI_2023.jpg`,
          alt: "Sidney Ozcan presenting her ORNL SULI research poster",
          name: "Sidney Ozcan",
          title: "Undergraduate Researcher",
          program:
            "2023 USDOE Science Undergraduate Laboratory Internships (SULI)",
          role:
            "Co-advised undergraduate researcher at Oak Ridge National Laboratory.",
          outcome:
            "Earthquake Vulnerability Assessment of California's Petroleum Distribution Network (ORNL SULI Research Poster)."
        },
        {
          id: 2,
          orientation: "landscape",
          src: `${import.meta.env.BASE_URL}/img/teaching_engagement/ARPA-E_UTK_lecturing_advising_2024.jpg`,
          alt: "Graduate student advising and guest lecturing at the University of Tennessee",
          name: "Jose Tupayachi & Aliza Sharmin",
          title: "Graduate Researchers",
          program:
            "University of Tennessee – Graduate Student Advising & Guest Lecturing",
          role:
            "Provided graduate student advising and delivered guest lectures within the Department of Industrial & Systems Engineering at the University of Tennessee, supporting research in intelligent transportation systems, digital twins, optimisation, AI-enabled decision support, and intermodal freight transportation.",
          outcome:
            "Published the peer-reviewed journal paper 'Towards Next-Generation Urban Decision Support Systems through AI-Powered Construction of Scientific Ontology Using Large Language Models—A Case in Optimizing Intermodal Freight Transportation' (Smart Cities, 2024)."
        }
      ];

  const [isOpen_award, setIsOpen_award] = useState(true);
  const [isOpen_pub, setIsOpen_pub] = useState(true);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl m-0 p-0">
        {/* Card */}
        <section className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-8 p-6">
            <div className="flex flex-col justify-start sm:col-span-2">
              <h4 className="text-3xl font-bold tracking-tight text-slate-700 sm:text-4xl">
                Teaching, Mentoring & Student Research
              </h4>

              <p className="mt-4 text-slate-600 leading-relaxed">
                My teaching and mentoring experience spans undergraduate and doctoral
                research across U.S. national laboratory and university environments.
                At the{" "}
                <strong>
                  U.S. Department of Energy’s Oak Ridge National Laboratory (ORNL)
                </strong>
                , I co-advised undergraduate researchers through the{" "}
                <strong>
                  Science Undergraduate Laboratory Internships (SULI) Program
                </strong>{" "}
                and contributed to research mentoring through externally funded
                internship and research programmes.
              </p>

              <p className="mt-4 text-slate-600 leading-relaxed">
              Through my academic appointment as an{" "}
              <strong>Adjunct Associate Professor</strong> at the{" "}
              <strong>University of Tennessee, Knoxville</strong>, I also mentored
              doctoral researchers working on transportation systems, digital twins,
              simulation, optimisation, and AI-enabled decision support. I have also
              delivered invited graduate seminars on intelligent transportation systems,
              including{" "}
              <a
                href="https://calendar.utk.edu/event/ise-graduate-seminar-haowen-xu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Digital Twins toward Smart Mobility and Transportation Management
              </a>
              , organised by the Department of Industrial & Systems Engineering.            
                My mentoring approach is project-based and research-integrated. I support
                students in defining research questions, developing computational
                methods, analysing data, interpreting results, preparing technical
                outputs, and communicating their work through posters, presentations,
                software demonstrations, and scholarly publications.
              </p>
            </div>
          </section>

         

        {/* 🎖️ Awards Section */}
        <section className="">
              {/* Collapsible header */}
              <button
                onClick={() => setIsOpen_award(!isOpen_award)}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-xl font-bold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                <span>🧑‍🏫 Student Mentorship</span>
                {/* Use lucide icons if installed, otherwise fallback arrows */}
                {/* <span>{isOpen_award ? "+" : "-"}</span>*/}
                {isOpen_award ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                {/* {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/> } */}
              </button>

              {/* Collapsible content */}
              {isOpen_award && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-[40%_55%] gap-6">
                   

                  <div className="col-span-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {teaching_mentors.map((mentor) => (
                        <div
                          key={mentor.id}
                          className={`
                            rounded-xl overflow-hidden shadow ring-1 ring-slate-200
                            hover:ring-blue-400 transition bg-white
                            ${mentor.orientation === "landscape"
                              ? "lg:col-span-7"
                              : "lg:col-span-5"}
                          `}
                        >
                          <div className="px-6 py-5">
                            <h3 className="text-2xl font-semibold text-slate-900">
                              {mentor.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {mentor.title}
                            </p>

                            <p className="mt-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
                              {mentor.program}
                            </p>

                            <p className="mt-5 text-sm leading-relaxed text-slate-600">
                              {mentor.role}
                            </p>

                            <div className="mt-5 rounded-lg bg-slate-50 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Student Outcome
                              </p>

                              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                                {mentor.outcome}
                              </p>
                            </div>
                          </div>

                          <img
                            src={mentor.src}
                            alt={mentor.alt}
                            className={
                              mentor.orientation === "landscape"
                                ? "w-full aspect-[16/9] object-cover"
                                : "w-full aspect-[4/5] object-cover object-top"
                            }
                          />
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
