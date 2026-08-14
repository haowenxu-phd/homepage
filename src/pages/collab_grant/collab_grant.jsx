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
        pjimg: `${import.meta.env.BASE_URL}/img/funders/ada_frg.png`,

        agency: "UNSW Arts, Design & Architecture",

        program: "2026 Faculty Research Grants Scheme",

        title_s: "2026 UNSW ADA Faculty Research Grant",

        title:
          "Development of Competitive External Research Funding Proposals - 3D GPU-acceletrate Gas Dispersion Simulation",

        amount: "AUD $7,500",

        role: "Principal Investigator",

        period: "2026",

        pi: "Dr Haowen Xu",

        description:
          `Competitive internal seed grant awarded under the 2026 UNSW Arts, Design & Architecture Faculty Research Grants Scheme to support the development of an eligible external competitive research funding application. The funded work includes the development of a GPU-accelerated voxel-based environmental simulation prototype for 3D gas dispersion and aerosol transport. A working research prototype was developed within approximately two months and is available through the project website.`,

        projectUrl:
          "https://haowenxu-phd.github.io/homepage/portfolio/3d_gas_dispersion",

        agencyUrl: "#",
      },

    {
            id: "grant-2",
            type: "grant",

            logo: `${import.meta.env.BASE_URL}/img/funders/usdoe.jpg`,
            pjimg: `${import.meta.env.BASE_URL}/img/funders/recoil.png`,

            agency:
              "U.S. Department of Energy — ARPA-E",

            program:
              "INTERMODAL Exploratory Topic",

            title_s:
              "ARPA-E RECOIL Freight Transportation Optimization",

            title:
              "A Cognitive Freight Transportation Digital Twin for Resiliency and Emission Control Through Optimizing Intermodal Logistics (RECOIL)",

            amount:
              "USD $1,900,000",

            role:
              "Co-Principal Investigator",

            period:
              "FY2023–FY2025",

            pi:
              "Prof. Xueping Li (xli27@utk.edu)",

            awardNumber:
              "DE-AR0001780",

            description:
              `ARPA-E-funded research project developing RECOIL, a cognitive digital twin of the U.S. intermodal freight transportation system spanning road, rail, and waterways. The project integrates heterogeneous freight data, ontology-driven knowledge graphs, advanced analytics, optimization, and machine learning to support national-scale freight flow planning, scheduling, and optimization, as well as rapid route rescheduling during disruptions. RECOIL aims to improve freight-system efficiency and resilience while reducing life-cycle greenhouse gas emissions. The project is led by the University of Tennessee, Knoxville, in collaboration with Oak Ridge National Laboratory and West Virginia University.`,

            projectUrl:
              "https://recoil.utk.edu/",

            agencyUrl:
              "https://arpa-e.energy.gov/",
          },

          {
            id: "grant-3",
            type: "grant",

            logo: `${import.meta.env.BASE_URL}/img/funders/usdoe.jpg`,
            pjimg: `${import.meta.env.BASE_URL}/img/funders/nsrd.png`,

            agency: "U.S. Department of Energy — NNSA",

            program:
              "Nuclear Safety Research and Development (NSR&D)",

            title_s:
              "DOE NSR&D — Atmospheric Hazard Modeling",

            title:
              "ML-Assisted Atmospheric Hazard Modeling for Effective Geospatial Risk Analysis",

            amount:
              "USD $500,000",

            role:
              "Co-Principal Investigator",

            period:
              "FY2024–FY2025",

            pi:
              "Dr. Xiao-Ying Yu, Oak Ridge National Laboratory",

            description:
              `U.S. Department of Energy nuclear safety research project developing machine-learning-assisted methods for rapid geospatial risk analysis of accidental radiological and chemical releases in complex terrain. The project integrates long-term meteorological observations, machine learning and statistical analysis, and the CAPARS high-resolution 3D atmospheric dispersion modeling system to improve consequence assessment and safety-basis analysis. My technical responsibility focused on developing the web-based geospatial visualization and visual analytics framework, including interactive interfaces for discovering, analyzing, and visualizing CAPARS simulation outputs and plume-impact scenarios. The resulting architecture combines a web front end, Python-based APIs, geospatial web services, and an online simulation data repository to support interactive risk analysis and dissemination across DOE users.`,

            projectUrl:
              null,

            agencyUrl:
              "https://www.energy.gov/ehss/nuclear-safety-research-and-development-nsrd-program",
          },

    {
        id: "grant-4",
        type: "grant",

        logo: `${import.meta.env.BASE_URL}/img/funders/usdoe.jpg`,
        pjimg: `${import.meta.env.BASE_URL}/img/funders/ctwin_project.png`,

        agency:
          "U.S. Department of Energy — Vehicle Technologies Office",

        program:
          "Energy Efficient Mobility Systems (EEMS)",

        title_s:
          "DOE VTO — Chattanooga Transportation Digital Twin",

        title:
          "Scaling up the Realtime Data, Simulation and Artificial Intelligence (AI) and Control for Optimizing Regional Mobility",

        amount:
          "USD $4,000,000",

        role:
          "Task Lead — Digital Twin Development",

        period:
          "FY2021–FY2023",

        pi:
          "Dr. Jiboananda Sanyal, Oak Ridge National Laboratory",

        projectId:
          "EEMS061",

        description:
          `U.S. Department of Energy Vehicle Technologies Office project developing a real-time transportation digital twin for regional mobility optimization in Chattanooga, Tennessee. The project integrated real-time transportation data, traffic simulation, machine learning, high-performance computing, and cyber-physical control to provide regional-scale situational awareness and support data- and simulation-informed traffic management. I served as the task lead for digital twin development, contributing to the architecture and implementation of digital twin capabilities that connected transportation data, simulation, analytics, and interactive visualization. The project demonstrated real-world traffic signal optimization and adaptive control, achieving reductions in traffic delays and energy use, while establishing a transferable framework for transportation digital twins and congestion mitigation in other cities.`,

        projectUrl:
          "https://www.energy.gov/eere/vehicles/articles/regional-mobility-chattanooga",

        agencyUrl:
          "https://www.energy.gov/eere/vehicles/vehicle-technologies-office",
      },
    {
        id: "grant-5",
        type: "grant",

        logo: `${import.meta.env.BASE_URL}/img/funders/iowadot.png`,
        pjimg: `${import.meta.env.BASE_URL}/img/funders/TR-744.png`,

        agency: "Iowa Department of Transportation",

        program: "Iowa Highway Research Board (IHRB)",

        title_s:
          "Iowa DOT IHRB TR-744",

        title:
          "Transfer of the Iowa DOT Culverts Web-Tool Prototype to Iowa DOT Mainframe",

        amount: "",

        role:
          "Co-Investigator",

        period:
          "2020",

        pi:
          "Prof. Marian Muste, University of Iowa",

        description:
          `Iowa Highway Research Board project supporting the technology transfer and operational deployment of a web-based culvert decision-support tool developed through prior Iowa DOT research. The project customized and transitioned the prototype into the Iowa DOT computing environment for internal use by transportation personnel involved in culvert design and operations. The web tool integrates relevant pre- and post-construction culvert data within an interactive interface, enabling users to review information in one place, develop systematic culvert monitoring plans, and perform quantitative assessments of potential sediment deposition. The project demonstrates the translation of academic research and cyberinfrastructure into an operational decision-support capability for a state transportation agency.`,

        projectUrl:
          "https://trid.trb.org/View/1715356",

        agencyUrl:
          "#",
      },
    {
        id: "grant-6",
        type: "grant",

        logo: `${import.meta.env.BASE_URL}/img/funders/iowadot.png`,
        pjimg: `${import.meta.env.BASE_URL}/img/funders/tr-719.png`,

        agency: "Iowa Department of Transportation",

        program: "Iowa Highway Research Board (IHRB)",

        title_s:
          "Iowa DOT IHRB TR-719",

        title:
          "Development of Self-Cleaning Box Culvert Design — Phase III",

        amount: "",

        role:
          "Co-Investigator",

        period:
          "2020",

        pi:
          "Prof. Marian Muste, University of Iowa",

        description:
          `Iowa Highway Research Board project investigating self-cleaning culvert designs to mitigate sediment accumulation and maintain hydraulic conveyance in multi-barrel box culverts. Building on more than a decade of Iowa DOT-supported research, the project conducted full-scale field implementation and testing of a self-cleaning design at three-barrel culvert sites in Iowa. The study combined field monitoring, hydraulic and sediment-transport analysis, and laboratory-informed design concepts to evaluate sediment deposition and culvert performance under real-world conditions. Results demonstrated the effectiveness of the self-cleaning design in reducing sediment accumulation while maintaining flow conveyance, providing practical design and monitoring guidance for transportation agencies addressing culvert sedimentation problems.`,

        projectUrl:
          "https://rosap.ntl.bts.gov/view/dot/79705/dot_79705_DS1.pdf/",

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

        src: `${import.meta.env.BASE_URL}/img/industry/ornl_toyato.png`,

        alt: "ORNL and Toyota Research Collaboration",

        title:
          "ORNL–Toyota Partnership",

        shortCaption:
          "National Laboratory–Industry Research Collaboration",

        role: "Research Lead",

        organization:
          "Oak Ridge National Laboratory (ORNL) & Toyota",

        period: "2023-2024",

        description:
          "Contributed to an industry research partnership between ORNL and Toyota on connected and automated mobility, developing digital-twin simulation and computational technologies for energy-efficient transportation. The research integrated vehicle control, traffic simulation, and traffic signal optimization, with related technologies demonstrated in real-world traffic environments.",

        link:
          "https://www.ornl.gov/news/real-world-traffic-demo-reveals-energy-savings",
      },
      {
        id: "industry-2",
        type: "photo",

        src: `${import.meta.env.BASE_URL}/img/industry/hdr.jpg`,

        alt: "HDR Research Collaboration",

        title:
          "Partnership Engagement with HDR",

        shortCaption:
          "Industry Engagement & Applied Research",

        role:
          "Research Scientist",

        organization:
          "HDR",

        period:
          "2026",

        description:
          "Engaged with technical leaders at HDR, a U.S.-based international engineering, architecture, and consulting firm, to explore research collaboration in civil infrastructure, environmental engineering, and transportation. Invited to present research and develop joint publications, with discussions focused on building longer-term university–industry partnerships and pursuing future Australian collaborative funding opportunities, including ARC Linkage Projects and CRC programs.",

        link:
          "https://www.hdrinc.com/",
  },

    {
        id: "industry-3",
        type: "photo",

        src: `${import.meta.env.BASE_URL}/img/industry/motionai_intel.png`,

        alt: "MotionIntel industry advisory and technology collaboration",

        title: "MotionIntel Industry Advisory",

        shortCaption: "AI & Transportation Technology Industry Advisory",

        role: "Industry Advisor",

        organization: "MotionIntel",

        period: "2023–Present",

        description:
          "Industry advisory engagement supporting the development and application of AI-enabled mobility and transportation technologies.",

        link: "https://motionintel.ai/team",
      },
  ];

  // =========================================================
  // GOVERNMENT
  // =========================================================

  const governmentCollaborations = [
    
    {
      id: "government-1",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/ntsb_collab.png`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/ntsb_logo.jpg`,

      alt: "National Transportation Safety Board Engagement",

      title: "U.S. National Transportation Safety Board",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "National Transportation Safety Board",

      period: "2022–2023",

      description:
        " ",

      link: "#",
    },
     {
      id: "government-2",
      type: "photo",

      src: `${import.meta.env.BASE_URL}/img/gov/fhwa_collab.png`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/fhwa_logo.jpg`, 
      alt: "Federal Highway Administration Engagement",

      title: "Federal Highway Administration",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "Federal Highway Administration（FHWA）",

      period: "2022–2023",

      description:
        " ",

      link: "#",
    },
    {
      id: "government-3",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/fhwa_collab2.png`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/fhwa_logo.jpg`,

      alt: "Federal Highway Administration Engagement",

      title: "U.S. Federal Highway Administration",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "Federal Highway Administration（FHWA）",

      period: "2018–2019",

      description:
        " ",

      link: "#",
    },
     {
      id: "government-4",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/iowa_dot.png`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/iowa_dot_logo.jpg`,

      alt: "Iowa Department of Transportation",

      title: "Iowa Department of Transportation",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "Iowa Department of Transportation",

      period: "2016–2019",

      description:
        " ",

      link: "#",
    },
    {
      id: "government-5",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/acm_iwcts.png`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/acm_sig.jpg`,
      alt: "SigSpatial",

      title: "Computational Transportation Workshop",

      shortCaption: "Conference and Workshop Organization",

      role: "Collaberator",

      organization: "ACM Sig Spatial IWCTS",

      period: "2022–2024",

      description:
        " ",

      link: "#",
    },
    {
      id: "government-6",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/USEPA.jpg`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/epa_logo.png`,

      alt: "EPA",

      title: "United States Environmental Protection Agency",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "Environmental Protection Agency (EPA）",

      period: "2016",

      description:
        " ",

      link: "#",
    },

    {
      id: "government-7",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/NCSA.jpg`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/ncsa_logo.png`,

      alt: "NCSA",

      title: "National Center for Supercomputing Applications ",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "National Center for Supercomputing Applications (NCSA)",

      period: "2016",

      description:
        " ",

      link: "#",
    },

    {
      id: "government-8",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/usace.png`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/usace_logo.jpg`,

      alt: "USACE IWR",

      title: "United States Army Corps of Engineers",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "U.S. Army Engineer Institute for Water Resources (IWR)",

      period: "2016-2019",

      description:
        " ",

      link: "#",
    },

    {
      id: "government-9",
      type: "gov",

      src: `${import.meta.env.BASE_URL}/img/gov/usgs.jpg`,
      logosrc: `${import.meta.env.BASE_URL}/img/gov/USGS_logo_green.png`,

      alt: "USGS",

      title: "United States Geological Survey",

      shortCaption: "Public-Sector Research Engagement",

      role: "Collaberator",

      organization: "United States Geological Survey (USGS)",

      period: "2016",

      description:
        " ",

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
      title: "🤝 Industry & Technology Collaberation",
      description:
        "Selected collaborations with industry partners involving applied research, technology development, and research translation.",
      items: industryPartnerships,
    },

    {
      id: "government",
      title: "🏛️ Government, Public-Sector & Professional Engagement",
      description:
        "Selected research collaborations and professional engagements with government agencies, public-sector organizations, and professional societies.",
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
const LogoCard = ({ item }) => {
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
      {/* Logo Area */}
      <div
        className="
          relative
          flex
          h-[90px]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-white
          px-3
          py-0
        "
      >
        <img
          src={item.logosrc}
          alt={item.alt}
          className="
            h-full
            w-full
            object-contain
            transition-transform
            duration-300
            group-hover:scale-[1.03]
          "
        />

        {/* Hover Overlay */}
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-black/0
            transition
            group-hover:bg-black/10
          "
        >
          <span
            className="
              translate-y-2
              rounded-full
              bg-white/95
              px-1
              py-1.5
              text-xs
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

      {/* Card Content */}
      <div className="p-4">
       <div
          className="
            mt-1
            flex
            items-center
            justify-between
            gap-4
            text-xs
            text-slate-500
          "
        >
          <span>
            {item.organization}
          </span>

          <span className="shrink-0">
            {item.period}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-600">
          {item.shortCaption}
        </p>

        
      </div>
    </button>
  );
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
          <h4
            className="
              text-base
              font-semibold
              text-slate-900
              group-hover:text-blue-700
            "
          >
            {item.title}
          </h4>

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
                            {section.items.map((grant) => (
                              <GrantCard
                                key={grant.id}
                                grant={grant}
                              />
                            ))}
                          </div>

                        ) : section.id === "government" ? (
                          /* ==========================
                            GOVERNMENT CARDS
                          ========================== */
                          <div
                            className="
                              grid
                              grid-cols-1
                              gap-4
                              lg:grid-cols-3
                            "
                          >
                            {section.items.map((item) => (
                              <LogoCard
                                key={item.id}
                                item={item}
                              />
                            ))}
                          </div>

                        ) : (
                          /* ==========================
                            PHOTO GALLERY
                            Industry / everything else
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
                            {section.items.map((item) => (
                              <GalleryCard
                                key={item.id}
                                item={item}
                              />
                            ))}
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
                    /* Grant project image */
                    <img
                      src={selectedItem.pjimg}
                      alt={`${selectedItem.title} project`}
                      className="
                        max-h-full
                        max-w-full
                        object-contain
                        rounded-lg
                      "
                    />
                  ) : selectedItem.type === "gov" ? (
                    /* Government collaboration image */
                    <img
                      src={selectedItem.src }
                      alt={selectedItem.alt}
                      className="
                        max-h-[75vh]
                        w-full
                        object-contain
                        rounded-lg
                      "
                    />
                  ) : (
                    /* Industry / other collaboration image */
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