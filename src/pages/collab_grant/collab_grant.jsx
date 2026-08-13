import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
} from "lucide-react";

export default function CollabGrants() {
  const [selectedItem, setSelectedItem] = useState(null);

  const [openSections, setOpenSections] = useState({
    grants: true,
    industry: true,
    government: true,
  });

  // =========================================================
  // GRANTS
  // =========================================================

  const grants = [
    {
      id: "grant-1",
      type: "grant",

      logo: `${import.meta.env.BASE_URL}/img/funders/unsw.png`,

      agency: "UNSW Arts, Design & Architecture",

      program: "Faculty Research Grant",

      title_s:
        "UNSW ADA FRG",

      title:
        "Development of Competitive External Research Funding Proposals",

      amount: "AUD $7,500",

      role: "Principal Investigator",

      period: "2026",

      pi: "Haowen Xu",

      description:
        "Competitive internal research grant supporting the development of external competitive funding applications.",

      projectUrl: null,

      agencyUrl: "#",
    },

    {
      id: "grant-2",
      type: "grant",

      logo: `${import.meta.env.BASE_URL}/img/funders/usdoe.jpg`,

      agency: "U.S. Department of Energy — ARPA-E",

      program: "Advanced Research Projects Agency–Energy (ARPA-E)",

      title_s:
        "ARPA-E RECOIL",

      title:
        "A Cognitive Freight Transportation Digital Twin for Resiliency and Emission Control Through Optimizing Intermodal Logistics",

      amount: "USD $1,900,000",

      role: "Co-Principal Investigator",

      period: "FY2023–Present",

      pi: "Placeholder PI / Institution",

      description:
        "Placeholder description of the project and your research contribution.",

      projectUrl: "https://recoil.utk.edu/",

      agencyUrl: "https://arpa-e.energy.gov/",
    },

    {
      id: "grant-3",
      type: "grant",

      logo: `${import.meta.env.BASE_URL}/img/funders/usdoe.jpg`,

      agency: "U.S. Department of Energy — NNSA",

      program: "Nuclear Safety Research and Development (NSRD)",

      title_s:
        "NSRD AU 32",
      title:
        "ML-Assisted Atmospheric Hazard Modeling for Effective Geospatial Risk Analysis",

      amount: "USD $500,000",

      role: "Co-Principal Investigator",

      period: "FY2023–Present",

      pi: "Placeholder PI / Institution",

      description:
        "Placeholder description of the project, your technical contribution, and research outcomes.",

      projectUrl: null,

      agencyUrl: "#",
    },

    {
      id: "grant-4",
      type: "grant",

      logo: `${import.meta.env.BASE_URL}/img/funders/usdoe.jpg`,

      agency:
        "U.S. Department of Energy — Vehicle Technologies Office",

      program: "Vehicle Technologies Office",

      title:
        "Scaling up the Realtime Data, Simulation and Artificial Intelligence (AI) and Control for Optimizing Regional Mobility",

      amount: "USD $4,000,000",

      role: "Task Lead — Digital Twin Development",

      period: "FY2021–2023",

      pi: "Placeholder PI / Institution",

      description:
        "Placeholder explanation of your role in developing digital-twin capabilities for regional mobility research.",

      projectUrl:
        "https://www.energy.gov/eere/vehicles/articles/regional-mobility-chattanooga",

      agencyUrl: "#",
    },

    {
      id: "grant-5",
      type: "grant",

      logo: `${import.meta.env.BASE_URL}/img/funders/iowadot.png`,

      agency: "Iowa Department of Transportation",

      program: "Iowa Highway Research Board (IHRB)",

      title:
        "TR-744: Transfer of the Iowa DOT Culverts web-tool prototype to Iowa DOT Mainframe",

      amount: " ",  //"USD $13,428",

      role: "Co-Investigator",

      period: "2020",

      pi: "Placeholder PI / Institution",

      description:
        "Placeholder description of the transportation infrastructure research project.",

      projectUrl: "https://trid.trb.org/View/1715356",

      agencyUrl: "#",
    },
    {
      id: "grant-6",
      type: "grant",

      logo: `${import.meta.env.BASE_URL}/img/funders/iowadot.png`,

      agency: "Iowa Department of Transportation",

      program: "Iowa Highway Research Board (IHRB)",

      title:
        "TR-719: Development of Self-Cleaning Box Culvert Design Phase III",

      amount:  " ", //"USD $ 14,108",

      role: "Co-Investigator",

      period: "2020",

      pi: "Placeholder PI / Institution",

      description:
        "Placeholder description of the transportation infrastructure research project.",

      projectUrl: "https://rosap.ntl.bts.gov/view/dot/79705/dot_79705_DS1.pdf/",

      agencyUrl: "#",
    },
  ];

  // =========================================================
  // INDUSTRY
  // =========================================================

  const industryPartnerships = [
    {
      id: "industry-1",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/collaboration/industry/industry_1.jpg`,

      alt: "Industry collaboration placeholder 1",

      title: "Industry Partnership 1",

      shortCaption: "Industry Research Collaboration",

      role: "Research Lead",

      organization: "Placeholder Company",

      period: "2025–2026",

      description:
        "Placeholder description for an industry collaboration. This can explain the industry problem, your technical contribution, prototype or software development, and translational impact.",

      link: "#",
    },

    {
      id: "industry-2",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/collaboration/industry/industry_2.jpg`,

      alt: "Industry collaboration placeholder 2",

      title: "Industry Partnership 2",

      shortCaption: "Applied Research Partnership",

      role: "Research Scientist",

      organization: "Placeholder Company",

      period: "2024–2025",

      description:
        "Placeholder description for this industry partnership.",

      link: "#",
    },

    {
      id: "industry-3",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/collaboration/industry/industry_3.jpg`,

      alt: "Industry collaboration placeholder 3",

      title: "Industry Partnership 3",

      shortCaption: "Technology Development Collaboration",

      role: "Technical Contributor",

      organization: "Placeholder Company",

      period: "2023–2024",

      description:
        "Placeholder description explaining the collaboration and your contribution.",

      link: "#",
    },
  ];

  // =========================================================
  // GOVERNMENT
  // =========================================================

  const governmentCollaborations = [
    {
      id: "government-1",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/collaboration/government/government_1.jpg`,

      alt: "Government agency collaboration placeholder 1",

      title: "Government Agency Collaboration 1",

      shortCaption: "Public-Sector Research Collaboration",

      role: "Research Scientist",

      organization: "Placeholder Government Agency",

      period: "2024–2026",

      description:
        "Placeholder description for a government or public-sector collaboration. You can describe the agency's research need, your contribution, and the resulting scientific or operational impact.",

      link: "#",
    },

    {
      id: "government-2",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/collaboration/government/government_2.jpg`,

      alt: "Government agency collaboration placeholder 2",

      title: "Government Agency Collaboration 2",

      shortCaption: "Mission-Driven Research Project",

      role: "Research Contributor",

      organization: "Placeholder Government Agency",

      period: "2023–2025",

      description:
        "Placeholder description for another government agency collaboration.",

      link: "#",
    },

    {
      id: "government-3",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/collaboration/government/government_3.jpg`,

      alt: "Government agency collaboration placeholder 3",

      title: "Government Agency Collaboration 3",

      shortCaption: "Government Research Partnership",

      role: "Project Team Member",

      organization: "Placeholder Government Agency",

      period: "2022–2024",

      description:
        "Placeholder description explaining the project context, your role, and the research contribution.",

      link: "#",
    },

    {
      id: "government-4",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/collaboration/government/government_4.jpg`,

      alt: "Government agency collaboration placeholder 4",

      title: "Government Agency Collaboration 4",

      shortCaption: "Applied Public-Sector Research",

      role: "Researcher",

      organization: "Placeholder Government Agency",

      period: "2021–2023",

      description:
        "Placeholder description for this collaboration.",

      link: "#",
    },
  ];

  // =========================================================
  // SECTIONS
  // =========================================================

  const sections = [
    {
      id: "grants",
      title: "💰 Research Grants & Funded Projects",
      description:
        "Selected experience contributing to externally funded research projects and competitive research grants.",
      items: grants,
    },

    {
      id: "industry",
      title: "🤝 Industry & Technology Partnerships",
      description:
        "Selected collaborations with industry partners involving applied research, technology development, and research translation.",
      items: industryPartnerships,
    },

    {
      id: "government",
      title: "🏛️ Government & Public-Sector Collaborations",
      description:
        "Selected research collaborations with government agencies and public-sector organizations.",
      items: governmentCollaborations,
    },
  ];

  // =========================================================
  // FUNCTIONS
  // =========================================================

  const toggleSection = (sectionId) => {
    setOpenSections((previous) => ({
      ...previous,
      [sectionId]: !previous[sectionId],
    }));
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  // =========================================================
  // PHOTO GALLERY CARD
  // Used by industry + government sections
  // =========================================================

  const GalleryCard = ({ item }) => {
    return (
      <button
        type="button"
        onClick={() => setSelectedItem(item)}
        className="
          group
          w-full
          overflow-hidden
          rounded-xl
          bg-white
          text-left
          shadow-sm
          ring-1
          ring-slate-200
          transition-all
          duration-200
          hover:-translate-y-1
          hover:shadow-lg
          hover:ring-blue-400
        "
      >
        <div
          className="
            relative
            aspect-[16/10]
            w-full
            overflow-hidden
            bg-slate-100
          "
        >
          <img
            src={item.src}
            alt={item.alt}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.03]
            "
          />

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/0
              transition
              group-hover:bg-black/20
            "
          >
            <span
              className="
                translate-y-2
                rounded-full
                bg-white/95
                px-4
                py-2
                text-sm
                font-semibold
                text-slate-800
                opacity-0
                shadow
                transition
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              View Details
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="
              text-base
              font-semibold
              text-slate-900
              group-hover:text-blue-700
            "
          >
            {item.title}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {item.shortCaption}
          </p>

          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              gap-4
              text-xs
              text-slate-500
            "
          >
            <span>{item.organization}</span>

            <span className="shrink-0">
              {item.period}
            </span>
          </div>
        </div>
      </button>
    );
  };

  // =========================================================
  // GRANT CARD
  // =========================================================

  const GrantCard = ({ grant }) => {
        return (
          <button
            type="button"
            onClick={() => setSelectedItem(grant)}
            className="
              group
              flex
              w-full
              items-start
              gap-3
              rounded-lg
              bg-white
              p-3
              text-left
              shadow-sm
              ring-1
              ring-slate-200
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
              hover:ring-blue-400
            "
          >
            {/* Logo */}
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-white
                p-2
                ring-1
                ring-slate-200
              "
            >
              <img
                src={grant.logo}
                alt={`${grant.agency} logo`}
                className="
                  max-h-full
                  max-w-full
                  object-contain
                "
              />
            </div>

            {/* Grant info */}
            <div className="min-w-0 flex-1">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-blue-600
                "
              >
                {grant.agency}
              </p>

              {grant.program && (
                <p
                  className="
                    mt-0.5
                    text-[10px]
                    font-medium
                    text-slate-500
                  "
                >
                  {grant.program}
                </p>
              )}
              <h5
                className="
                  mt-1
                  text-sm
                  font-semibold
                  leading-snug
                  text-slate-900
                  transition
                  group-hover:text-blue-700
                "
              >
                {grant.title_s}
              </h5>
              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  leading-snug
                  text-slate-900
                  transition
                  group-hover:text-blue-700
                "
              >
                {grant.title}
              </p>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-x-3
                  gap-y-1
                  text-xs
                  text-slate-500
                "
              >
                <span className="font-semibold text-slate-700">
                  {grant.amount}
                </span>

                <span>{grant.role}</span>

                <span>{grant.period}</span>
              </div>
            </div>
          </button>
        );
      };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main
      className="
        min-h-[calc(100vh-64px)]
        bg-gradient-to-br
        from-slate-50
        via-white
        to-slate-100
      "
    >
      <div
        className="
          mx-auto
          max-w-[1800px]
          px-4
          py-10
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="mb-10">
          <div className="max-w-4xl">
            <p
              className="
                mb-2
                text-sm
                font-semibold
                uppercase
                tracking-wider
                text-blue-600
              "
            >
              Research Impact
            </p>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-4xl
              "
            >
              Research Partnerships & Funding
            </h1>

            <p
              className="
                mt-4
                max-w-3xl
                text-base
                leading-7
                text-slate-600
              "
            >
              Selected research grants, industry partnerships,
              and collaborations with government and
              public-sector organizations. Click any item to view
              additional information.
            </p>
          </div>
        </section>

        {/* =====================================================
            COLLAPSIBLE SECTIONS
        ===================================================== */}

        <div className="space-y-8">
          {sections.map((section) => {
            const isOpen = openSections[section.id];

            return (
              <section
                key={section.id}
                className="
                  overflow-hidden
                  rounded-2xl
                  bg-white/70
                  shadow-sm
                  ring-1
                  ring-slate-200
                  backdrop-blur
                "
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() =>
                    toggleSection(section.id)
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    px-5
                    py-4
                    text-left
                    transition
                    hover:bg-slate-50
                    sm:px-6
                  "
                >
                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-slate-800
                        sm:text-xl
                      "
                    >
                      {section.title}
                    </h2>

                    <p
                      className="
                        mt-1
                        max-w-4xl
                        text-sm
                        font-normal
                        text-slate-500
                      "
                    >
                      {section.description}
                    </p>
                  </div>

                  <div
                    className="
                      shrink-0
                      rounded-full
                      bg-slate-100
                      p-2
                      text-slate-600
                    "
                  >
                    {isOpen ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>

                {/* Content */}
                {isOpen && (
                  <div
                    className="
                      border-t
                      border-slate-200
                      px-5
                      py-6
                      sm:px-6
                    "
                  >
                    {section.id === "grants" ? (
                      /* ==========================
                         GRANT CARDS
                      ========================== */

                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-4
                          lg:grid-cols-3
                        "
                      >
                        {section.items.map(
                          (grant) => (
                            <GrantCard
                              key={grant.id}
                              grant={grant}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      /* ==========================
                         PHOTO GALLERY
                      ========================== */

                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-6
                          sm:grid-cols-2
                          lg:grid-cols-3
                          xl:grid-cols-4
                        "
                      >
                        {section.items.map(
                          (item) => (
                            <GalleryCard
                              key={item.id}
                              item={item}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {selectedItem && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
          "
          onClick={closeModal}
        >
          <div
            className="
              relative
              flex
              max-h-[92vh]
              w-full
              max-w-6xl
              flex-col
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              lg:flex-row
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeModal}
              className="
                absolute
                right-3
                top-3
                z-20
                rounded-full
                bg-white/95
                p-2
                text-slate-700
                shadow
                ring-1
                ring-slate-200
                transition
                hover:bg-slate-100
              "
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* =================================================
                MODAL VISUAL
            ================================================= */}

            <div
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
                bg-slate-100
                p-6
                lg:w-[55%]
                lg:p-10
              "
            >
              {selectedItem.type === "grant" ? (
                <img
                  src={selectedItem.logo}
                  alt={`${selectedItem.agency} logo`}
                  className="
                    max-h-[320px]
                    max-w-[80%]
                    object-contain
                  "
                />
              ) : (
                <img
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  className="
                    max-h-[75vh]
                    w-full
                    object-contain
                    rounded-lg
                  "
                />
              )}
            </div>

            {/* =================================================
                MODAL INFORMATION
            ================================================= */}

            <div
              className="
                overflow-y-auto
                p-6
                lg:w-[45%]
                lg:p-8
              "
            >
              {/* Type */}
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-blue-600
                "
              >
                {selectedItem.type === "grant"
                  ? "Funded Research Project"
                  : "Research Collaboration"}
              </p>

              {/* Title */}
              <h2
                className="
                  mt-2
                  pr-8
                  text-2xl
                  font-bold
                  leading-snug
                  text-slate-900
                "
              >
                {selectedItem.title}
              </h2>

              {/* Subtitle */}
              {selectedItem.type ===
              "grant" ? (
                <>
                  <p
                    className="
                      mt-3
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    {selectedItem.agency}
                  </p>

                  {selectedItem.program && (
                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      {selectedItem.program}
                    </p>
                  )}
                </>
              ) : (
                <p
                  className="
                    mt-2
                    text-sm
                    font-medium
                    text-slate-600
                  "
                >
                  {selectedItem.shortCaption}
                </p>
              )}

              {/* =================================================
                  METADATA
              ================================================= */}

              <div
                className="
                  mt-6
                  space-y-4
                  rounded-xl
                  bg-slate-50
                  p-4
                  ring-1
                  ring-slate-200
                "
              >
                {selectedItem.type ===
                "grant" ? (
                  <>
                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-slate-400
                        "
                      >
                        Funding
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {selectedItem.amount}
                      </p>
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-slate-400
                        "
                      >
                        Role
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {selectedItem.role}
                      </p>
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-slate-400
                        "
                      >
                        Duration
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {selectedItem.period}
                      </p>
                    </div>

                    {selectedItem.pi && (
                      <div>
                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            text-slate-400
                          "
                        >
                          PI / Project Contact
                        </p>

                        <p
                          className="
                            mt-1
                            text-sm
                            font-medium
                            text-slate-700
                          "
                        >
                          {selectedItem.pi}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-slate-400
                        "
                      >
                        Role
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {selectedItem.role}
                      </p>
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-slate-400
                        "
                      >
                        Organization
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {selectedItem.organization}
                      </p>
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-slate-400
                        "
                      >
                        Period
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {selectedItem.period}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="mt-6">
                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  {selectedItem.type === "grant"
                    ? "About this project"
                    : "About this collaboration"}
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-slate-600
                  "
                >
                  {selectedItem.description}
                </p>
              </div>

              {/* =================================================
                  LINKS
              ================================================= */}

              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  gap-3
                "
              >
                {/* Grant project link */}
                {selectedItem.type === "grant" &&
                  selectedItem.projectUrl &&
                  selectedItem.projectUrl !== "#" && (
                    <a
                      href={
                        selectedItem.projectUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-slate-900
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                      "
                    >
                      Project Website
                      <ExternalLink size={16} />
                    </a>
                  )}

                {/* Grant agency link */}
                {selectedItem.type === "grant" &&
                  selectedItem.agencyUrl &&
                  selectedItem.agencyUrl !== "#" && (
                    <a
                      href={
                        selectedItem.agencyUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-white
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-slate-700
                        ring-1
                        ring-slate-300
                        transition
                        hover:bg-slate-50
                        hover:text-blue-700
                      "
                    >
                      Funding Agency
                      <ExternalLink size={16} />
                    </a>
                  )}

                {/* Industry / government link */}
                {selectedItem.type !== "grant" &&
                  selectedItem.link &&
                  selectedItem.link !== "#" && (
                    <a
                      href={selectedItem.link}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-slate-900
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                      "
                    >
                      View Project
                      <ExternalLink size={16} />
                    </a>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}