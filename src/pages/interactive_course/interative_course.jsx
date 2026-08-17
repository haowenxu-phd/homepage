import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import translations
from "./assets/course_0_landing_page/trans/interactive_course.json";


export default function InteractiveLearning() {

  // ============================================================
  // Language
  // ============================================================

  const [
    language,
    setLanguage,
  ] = useState("en");


  const t =
    translations[language] ??
    translations.en;


  const textDirection =
    language === "fa"
      ? "rtl"
      : "ltr";


  // ============================================================
  // Course metadata
  //
  // Visible text is stored in translation JSON.
  // ============================================================

  const courses =
    useMemo(
      () => [
        {
          id: 1,

          image:
            "img/thumbnail_learning/T1_transport_network_graph_model.png",

          href:
            "/learning/course_1",
            //https://haowenxu-phd.github.io/homepage/learning/course_1
          level:
            "Foundation",

          status:
            "Available",
        },
        {
          id: 2,

          image:
            "img/thumbnail_learning/T2_Nav.png",

          href:
            "/learning/course_2",
            //https://haowenxu-phd.github.io/homepage/learning/course_1
          level:
            "Foundation",

          status:
            "Available",
        },
         {
          id: 3,

          image:
            "img/thumbnail_learning/T3_Optimize.png",

          href:
            "/learning/course_3",
            //https://haowenxu-phd.github.io/homepage/learning/course_1
          level:
            "Foundation",

          status:
            "Available",
        },
        {
          id: 4,

          image:
            "img/thumbnail_learning/T4_traffic_flow.png",

          href:
            "/learning/course_4",
            //https://haowenxu-phd.github.io/homepage/learning/course_1
          level:
            "Foundation",

          status:
            "Available",
        },
        {
            id: 5,

            image:
              "img/thumbnail_learning/T5_Signal.png",

            href:
              "/learning/course_5",

            level:
              "Intermediate",

            status:
              "Available",
        },
        {
          id: 6,

          image:
            "img/thumbnail_learning/Tw1_transportation_watershed.png",

          href:
            "/learning/course_9",
            //https://haowenxu-phd.github.io/homepage/learning/course_1
          level:
            "Intermediate",

          status:
            "Available",
        },
      ],
      []
    );


  // ============================================================
  // Level style
  // ============================================================

  const getLevelStyle =
    (level) => {

      switch (level) {

        case "Foundation":
          return (
            "bg-emerald-50 " +
            "text-emerald-700 " +
            "ring-emerald-200"
          );


        case "Intermediate":
          return (
            "bg-blue-50 " +
            "text-blue-700 " +
            "ring-blue-200"
          );


        case "Advanced":
          return (
            "bg-purple-50 " +
            "text-purple-700 " +
            "ring-purple-200"
          );


        default:
          return (
            "bg-slate-50 " +
            "text-slate-700 " +
            "ring-slate-200"
          );

      }

    };


  // ============================================================
  // Number of active modules
  // ============================================================

  const availableCount =
    courses.filter(
      (course) =>
        course.status ===
        "Available"
    ).length;


  // ============================================================
  // Render
  // ============================================================

  return (

    <main
      className="
        min-h-[calc(100vh-64px)]
        w-full
        bg-gradient-to-br
        from-slate-50
        via-white
        to-blue-50
      "
    >

      <div
          className="
            mx-auto
            w-full
            max-w-[2200px]
            px-3
            py-3
            sm:px-4
            sm:py-4
            md:px-5
            lg:px-6
            xl:px-8
          "
        >

        {/* ====================================================
            Header / language
        ===================================================== */}

        <div
            className="
              mb-3
              flex
              w-full
              items-center
              justify-between
              gap-2
              sm:justify-end
            "
          >

          <label
            htmlFor="learning-language"
            className="
              text-xs
              text-slate-500
            "
          >
            {t.language}
          </label>


          <select

            id="learning-language"

            value={
              language
            }

            onChange={
              (event) =>
                setLanguage(
                  event.target.value
                )
            }

            className="
                min-w-[110px]
                rounded-md
                border
                border-slate-300
                bg-white
                px-2
                py-1.5
                text-sm
                text-slate-700
              "
          >

            <option value="en">
              English
            </option>

            <option value="zh">
              中文
            </option>

            <option value="fa">
              فارسی
            </option>

          </select>

        </div>


        {/* ====================================================
            Introduction
        ===================================================== */}

        <section
          dir={
            textDirection
          }
          className="w-full"
        >

          <span
            className="
              inline-flex
              rounded-full
              bg-blue-50
              px-2.5
              py-1
              text-xs
              font-medium
              text-blue-700
              ring-1
              ring-inset
              ring-blue-200
            "
          >
            {
              t.header.badge
            }
          </span>


          <h2
            className="
            mt-2
            max-w-[1600px]
            break-words
            text-2xl
            font-bold
            leading-tight
            tracking-tight
            text-slate-900
            sm:text-3xl
            lg:text-4xl
          "
          >
            {
              t.header.title
            }
          </h2>


          <div
            className="
                  mt-3
                  grid
                  w-full
                  grid-cols-1
                  gap-3
                  lg:grid-cols-2
                  lg:gap-6
                "
          >

            <p
              className="
                break-words
                  text-sm
                  leading-6
                  text-slate-600
                  sm:text-base
              "
            >
              {
                t.header.paragraph1
              }
            </p>


            <p
              className="
                text-sm
                leading-6
                text-slate-600
                sm:text-base
              "
            >
              {
                t.header.paragraph2
              }
            </p>

          </div>


          {/* ==================================================
              Buttons
          =================================================== */}

          <div
              className="
                mt-1
                flex
                w-full
                flex-wrap
                items-center
                gap-x-3
                gap-y-2
                lg:flex-nowrap
              "
            >
              {/* ==================================================
                  Action Buttons
              ================================================== */}
               {/*
              <div
                className="
                  flex
                  shrink-0
                  flex-row
                  items-center
                  gap-2
                "
              >
                
               
                <a
                  href="#course-gallery"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    whitespace-nowrap
                    rounded-lg
                    bg-slate-900
                    px-3
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-slate-700
                    sm:px-4
                  "
                >
                  {t.header.exploreButton}
                </a>


                Collaboration button 

                <a
                  href="mailto:haowen.xu.phd@gmail.com"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    whitespace-nowrap
                    rounded-lg
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-800
                    ring-1
                    ring-slate-200
                    transition
                    hover:bg-slate-50
                    sm:px-4
                  "
                >
                  {t.header.collaborationButton}
                </a>
              </div>*/}


              {/* ==================================================
                  Collaboration Acknowledgement
              ================================================== */} 

              <span
                className="
                  min-w-0
                  basis-full
                  text-sm
                  leading-relaxed
                  text-slate-600
                  lg:basis-auto
                  lg:flex-1
                "
              >
                {t.header.attributes1}{" "}

                <a
                  href="https://tickle.utk.edu/ise/faculty/xueping-li/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    font-medium
                    text-blue-600
                    underline
                    hover:text-blue-800
                  "
                >
                  Prof. Xueping Li
                </a>

                {" "}
                {t.header.attributes2}
                {" "}

                <a
                  href="https://www.ornl.gov/staff-profile/wan-li"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    font-medium
                    text-blue-600
                    underline
                    hover:text-blue-800
                  "
                >
                  Dr. Wan Li
                </a>

                {" "}
                {t.header.attributes3}.
              </span>
            </div>

        </section>


        {/* ====================================================
            Learning principles
        ===================================================== */}

        <section
          dir={
            textDirection
          }
          className="
            mt-3
            grid
            w-full
            grid-cols-1
            gap-2
            md:grid-cols-3
          "
        >

          <LearningPrinciple
            title={
              t.principles
                .experiment
                .title
            }

            description={
              t.principles
                .experiment
                .description
            }
          />


          <LearningPrinciple
            title={
              t.principles
                .visualise
                .title
            }

            description={
              t.principles
                .visualise
                .description
            }
          />


          <LearningPrinciple
            title={
              t.principles
                .practice
                .title
            }

            description={
              t.principles
                .practice
                .description
            }
          />

        </section>


        {/* ====================================================
            Course gallery
        ===================================================== */}

        <section
          id="course-gallery"
          className="
            mt-4
            w-full
            scroll-mt-16
          "
        >

          <div
            dir={
              textDirection
            }
            className="
              flex
              w-full
              flex-col
              justify-between
              gap-2
              sm:flex-row
              sm:items-end
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-blue-700
                "
              >
                {
                  t.gallery.eyebrow
                }
              </p>


              <h5
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                {
                  t.gallery.title
                }
              </h5>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-600
                "
              >
                {
                  t.gallery.description
                }
              </p>

            </div>


            <p
              className="
                shrink-0
                text-xs
                text-slate-500
              "
            >
              {availableCount}
              {" "}
              {
                t.gallery
                  .availableSuffix
              }
            </p>

          </div>


          {/* ==================================================
              Cards
          =================================================== */}

          <div
            className="
              mt-3
              grid
              w-full
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              min-[2100px]:grid-cols-4
            "
          >

            {
              courses.map(
                (course) => {

                  const courseText =
                    t.courses[
                      String(
                        course.id
                      )
                    ];


                  if (!courseText) {
                    return null;
                  }


                  const isComingSoon =
                    course.status ===
                    "Coming Soon";


                  const cardContent = (

                    <>

                      {/* ========================================
                          Thumbnail
                      ========================================= */}

                      <div
                        className="
                          relative
                          aspect-[7/5]
                          overflow-hidden
                          bg-slate-100
                        "
                      >

                        <img

                          src={
                            `${
                              import.meta.env.BASE_URL
                            }${
                              course.image
                            }`
                          }

                          alt={
                            `${courseText.title} interactive course thumbnail`
                          }

                          loading="lazy"

                          className={`
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-500

                            ${
                              isComingSoon
                                ? "opacity-75"
                                : "group-hover:scale-[1.03]"
                            }
                          `}
                        />


                        <div
                          className="
                            absolute
                            left-2
                            top-2
                          "
                        >

                          <span
                            className={`
                              rounded-full
                              px-2
                              py-0.5
                              text-xs
                              font-semibold
                              ring-1
                              ring-inset

                              ${
                                getLevelStyle(
                                  course.level
                                )
                              }
                            `}
                          >
                            {
                              t.levels[
                                course.level
                              ]
                            }
                          </span>

                        </div>


                        {
                          isComingSoon && (

                            <div
                              className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-slate-950/35
                              "
                            >

                              <span
                                className="
                                  rounded-full
                                  bg-white/95
                                  px-3
                                  py-1.5
                                  text-sm
                                  font-semibold
                                  text-slate-800
                                "
                              >
                                {
                                  t.gallery
                                    .comingSoon
                                }
                              </span>

                            </div>

                          )
                        }

                      </div>


                      {/* ========================================
                          Course content
                      ========================================= */}

                      <div
                        dir={
                          textDirection
                        }
                        className={`
                          flex
                          min-h-[220px]
                          flex-col
                          p-4

                          ${
                            isComingSoon
                              ? "opacity-70"
                              : ""
                          }
                        `}
                      >

                        <div>

                          <h4
                            className="
                              text-lg
                              font-bold
                              leading-snug
                              text-slate-900
                            "
                          >
                            {
                              courseText.title
                            }
                          </h4>


                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-blue-700
                            "
                          >
                            {
                              courseText.subtitle
                            }
                          </p>


                          <p
                            className="
                              mt-2
                              text-sm
                              leading-5
                              text-slate-600
                            "
                          >
                            {
                              courseText.description
                            }
                          </p>

                        </div>


                        {/* ======================================
                            Badges
                        ======================================= */}

                        <div
                          className="
                            mt-3
                            flex
                            flex-wrap
                            gap-1.5
                          "
                        >

                          {
                            courseText
                              .badges
                              .map(
                                (badge) => (

                                  <span
                                    key={
                                      badge
                                    }
                                    className="
                                      rounded-full
                                      bg-slate-100
                                      px-2
                                      py-0.5
                                      text-[11px]
                                      font-medium
                                      text-slate-700
                                      ring-1
                                      ring-inset
                                      ring-slate-200
                                    "
                                  >
                                    {
                                      badge
                                    }
                                  </span>

                                )
                              )
                          }

                        </div>


                        {/* ======================================
                            Footer
                        ======================================= */}

                        <div
                          className="
                            mt-auto
                            pt-4
                          "
                        >

                          <div
                            className={`
                              flex
                              items-center
                              justify-between
                              border-t
                              border-slate-200
                              pt-3

                              ${
                                isComingSoon
                                  ? "text-slate-400"
                                  : "text-blue-700"
                              }
                            `}
                          >

                            <span
                              className="
                                text-sm
                                font-semibold
                              "
                            >
                              {
                                isComingSoon
                                  ? t.gallery
                                      .underDevelopment
                                  : t.gallery
                                      .launch
                              }
                            </span>


                            {
                              !isComingSoon && (

                                <span
                                  aria-hidden="true"
                                  className="
                                    text-lg
                                    transition-transform
                                    group-hover:translate-x-1
                                  "
                                >
                                  →
                                </span>

                              )
                            }

                          </div>

                        </div>

                      </div>

                    </>

                  );


                  if (
                    isComingSoon
                  ) {

                    return (

                      <article

                        key={
                          course.id
                        }

                        aria-disabled="true"

                        className="
                          group
                          overflow-hidden
                          rounded-xl
                          bg-white
                          shadow-sm
                          ring-1
                          ring-slate-200
                        "
                      >
                        {
                          cardContent
                        }
                      </article>

                    );

                  }


                  return (

                    <Link

                      key={
                        course.id
                      }

                      to={
                        course.href
                      }

                      className="
                        group
                        overflow-hidden
                        rounded-xl
                        bg-white
                        shadow-sm
                        ring-1
                        ring-slate-200
                        transition
                        duration-200
                        hover:-translate-y-0.5
                        hover:shadow-md
                        hover:ring-blue-300
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                      "
                    >

                      {
                        cardContent
                      }

                    </Link>

                  );

                }
              )
            }

          </div>

        </section>

      </div>

    </main>

  );

}


// ============================================================
// Small reusable teaching principle card
// ============================================================

function LearningPrinciple({
  title,
  description,
}) {

  return (

    <div
      className="
        rounded-lg
        bg-white
        px-4
        py-2.5
        ring-1
        ring-slate-200
      "
    >

      <h4
        className="
          text-sm
          font-semibold
          leading-tight
          text-slate-900
        "
      >
        {title}
      </h4>


      <p
        className="
          mt-1
          text-sm
          leading-5
          text-slate-600
        "
      >
        {description}
      </p>

    </div>

  );

}