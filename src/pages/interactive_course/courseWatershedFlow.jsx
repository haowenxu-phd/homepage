import React, { useMemo, useState } from "react";
import FlowMapWebGL from "../../components/LegacyFlowMap";

export default function InteractiveLearning_c_watershed() {
  const [language, setLanguage] = useState("en");

  const translations = useMemo(
    () => ({
      en: {
        title:
          "Road Networks, Watersheds, and Flood Flow Visualization",

        subtitle:
          "Explore how terrain-driven water flow interacts with roads, transport corridors, and flood-prone areas.",

        overviewTitle:
          "Learning Objectives",

        overview:
          "This interactive lesson uses WebGL-based flow visualization and a watershed flow-direction matrix to help students understand how surface water moves across terrain and how road networks may intersect, redirect, or become exposed to flood flows.",

        objective1:
          "Understand how a watershed flow-direction matrix represents local surface-water movement.",

        objective2:
          "Explore the spatial relationship between roads, drainage paths, and watershed structure.",

        objective3:
          "Identify road segments that may be exposed to concentrated surface runoff or flooding.",

        objective4:
          "Connect hydrologic flow patterns with transportation infrastructure planning and resilience.",

        instructionsTitle:
          "Interactive Exploration",

        instructions:
          "Pan and zoom the map, switch between available basemaps, and observe the animated flow field. Compare the direction and concentration of flow with the road network and surrounding terrain.",

        questionTitle:
          "Think About",

        question1:
          "Where do major flow paths intersect the transportation network?",

        question2:
          "Which road segments appear most exposed to concentrated runoff?",

        question3:
          "How could road embankments, bridges, culverts, or drainage infrastructure alter local flow patterns?",

        question4:
          "How could this type of analysis support flood-resilient transportation planning?",

        mapTitle:
          "Interactive Watershed Flow Map",

        mapCaption:
          "WebGL visualization of terrain-driven flow patterns and their relationship with transportation infrastructure.",

        languageLabel:
          "Language",

        instructionsTitle: "Interactive Exploration",

        instructions:
          "Use the basemap selector on the map to switch between transportation, imagery, topographic, and other map layers. Compare the animated surface-water flow with terrain and elevation patterns to observe where runoff converges. Zoom in and out across different parts of Iowa to examine transportation networks and infrastructure, and investigate how water flows toward, across, or around roads and other infrastructure.",

        attribution:
          "This application was developed using watershed DEM data provided by the Iowa Flood Center and the U.S. Geological Survey (USGS).",
      },

      zh: {
        title:
          "道路网络、流域与洪水流动可视化",

        subtitle:
          "探索地形驱动的水流如何与道路、交通走廊以及洪水易发区域相互作用。",

        overviewTitle:
          "学习目标",

        overview:
          "本互动课程利用基于 WebGL 的水流可视化和流域流向矩阵，帮助学生理解地表水如何沿地形移动，以及道路网络如何与这些水流路径发生交叉、阻挡、重定向或暴露于洪水风险之中。",

        objective1:
          "理解流域流向矩阵如何表示局部地表水流动方向。",

        objective2:
          "探索道路、排水路径与流域空间结构之间的关系。",

        objective3:
          "识别可能暴露于集中径流或洪水影响的道路路段。",

        objective4:
          "将水文流动模式与交通基础设施规划和韧性分析联系起来。",

        instructionsTitle:
          "互动探索",

        instructions:
          "平移和缩放地图，切换不同底图，并观察动态水流场。比较水流方向和汇聚区域与道路网络及周围地形之间的空间关系。",

        questionTitle:
          "思考问题",

        question1:
          "主要水流路径在哪里与交通网络相交？",

        question2:
          "哪些道路路段最可能暴露于集中径流影响？",

        question3:
          "道路路堤、桥梁、涵洞或排水设施可能如何改变局部水流路径？",

        question4:
          "这种分析如何支持面向洪水韧性的交通规划？",

        mapTitle:
          "互动流域水流地图",

        mapCaption:
          "基于 WebGL 的地形驱动水流可视化，用于分析水流与交通基础设施之间的关系。",

        languageLabel:
          "语言",
        
        instructionsTitle: "互动探索",

        instructions:
          "使用地图上的底图选择器，在交通、影像、地形等不同地图图层之间进行切换。观察动态地表水流，并将水流方向和汇聚区域与地形、地势和高程变化进行比较。通过放大和缩小地图，探索爱荷华州不同地区的交通网络和基础设施，观察水流如何流向道路、穿越道路，或受到道路及其他基础设施空间分布的影响。",

        attribution:
          "本应用使用由 Iowa Flood Center 和美国地质调查局（USGS）提供的流域 DEM 数据开发。",
      },

      fa: {
        title:
          "شبکه‌های جاده‌ای، حوضه‌های آبریز و نمایش جریان سیلاب",

        subtitle:
          "بررسی کنید که چگونه جریان آب ناشی از توپوگرافی با جاده‌ها، کریدورهای حمل‌ونقل و مناطق مستعد سیلاب تعامل دارد.",

        overviewTitle:
          "اهداف یادگیری",

        overview:
          "این درس تعاملی از نمایش جریان مبتنی بر WebGL و ماتریس جهت جریان حوضه آبریز استفاده می‌کند تا دانشجویان درک کنند آب سطحی چگونه روی زمین حرکت می‌کند و شبکه‌های جاده‌ای چگونه ممکن است با مسیرهای جریان تلاقی داشته باشند، آن‌ها را تغییر دهند یا در معرض سیلاب قرار گیرند.",

        objective1:
          "درک نحوه نمایش حرکت محلی آب سطحی توسط ماتریس جهت جریان حوضه آبریز.",

        objective2:
          "بررسی رابطه مکانی میان جاده‌ها، مسیرهای زهکشی و ساختار حوضه آبریز.",

        objective3:
          "شناسایی بخش‌هایی از شبکه جاده‌ای که ممکن است در معرض رواناب متمرکز یا سیلاب قرار گیرند.",

        objective4:
          "ارتباط دادن الگوهای جریان هیدرولوژیکی با برنامه‌ریزی و تاب‌آوری زیرساخت‌های حمل‌ونقل.",

        instructionsTitle:
          "کاوش تعاملی",

        instructions:
          "نقشه را جابه‌جا و بزرگ‌نمایی کنید، میان نقشه‌های پایه مختلف جابه‌جا شوید و میدان جریان متحرک را مشاهده کنید. جهت و تمرکز جریان را با شبکه جاده‌ای و توپوگرافی اطراف مقایسه کنید.",

        questionTitle:
          "سؤالات برای بررسی",

        question1:
          "مسیرهای اصلی جریان در کجا با شبکه حمل‌ونقل تلاقی دارند؟",

        question2:
          "کدام بخش‌های جاده‌ای بیشترین مواجهه را با رواناب متمرکز دارند؟",

        question3:
          "خاکریزهای جاده‌ای، پل‌ها، آبروها یا زیرساخت‌های زهکشی چگونه می‌توانند الگوهای محلی جریان را تغییر دهند؟",

        question4:
          "این نوع تحلیل چگونه می‌تواند از برنامه‌ریزی حمل‌ونقل مقاوم در برابر سیلاب پشتیبانی کند؟",

        mapTitle:
          "نقشه تعاملی جریان حوضه آبریز",

        mapCaption:
          "نمایش WebGL الگوهای جریان ناشی از توپوگرافی و رابطه آن‌ها با زیرساخت‌های حمل‌ونقل.",

        languageLabel:
          "زبان",

         instructionsTitle: "کاوش تعاملی",

        instructions:
          "از انتخابگر نقشه پایه برای جابه‌جایی میان لایه‌های حمل‌ونقل، تصاویر ماهواره‌ای، توپوگرافی و سایر نقشه‌ها استفاده کنید. جریان متحرک آب سطحی را با الگوهای زمین و ارتفاع مقایسه کنید و بررسی کنید که رواناب در چه نقاطی همگرا می‌شود. با بزرگ‌نمایی و کوچک‌نمایی در مناطق مختلف آیووا، شبکه‌های حمل‌ونقل و زیرساخت‌ها را بررسی کنید و ببینید آب چگونه به سمت جاده‌ها، از روی آن‌ها یا در اطراف زیرساخت‌ها جریان پیدا می‌کند.",

        attribution:
          "این برنامه با استفاده از داده‌های DEM حوضه آبریز ارائه‌شده توسط Iowa Flood Center و سازمان زمین‌شناسی ایالات متحده (USGS) توسعه یافته است.",

      },
    }),
    []
  );

  const t = translations[language];

  const isRTL = language === "fa";

  return (
     <main
    dir={isRTL ? "rtl" : "ltr"}
    className="
      min-h-screen
      w-full
      bg-slate-100
    "
  >
    {/* =========================================
        Compact Header
    ========================================== */}
    <header
      className="
        flex
        items-center
        justify-between
        gap-3
        border-b
        border-slate-200
        bg-white
        px-4
        py-2
      "
    >
      <div className="min-w-0">
        <h1
          className="
            text-xl
            font-bold
            leading-tight
            text-slate-900
          "
        >
          {t.title}
        </h1>

        <p
          className="
            mt-0.5
            text-xs
            text-slate-500
          "
        >
          {t.subtitle}
        </p>
      </div>

      {/* Language */}
      <div
        className="
          flex
          shrink-0
          overflow-hidden
          rounded-md
          border
          border-slate-300
        "
      >
        {["en", "zh", "fa"].map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            className={`
              px-2.5
              py-1
              text-xs
              font-semibold
              ${
                language === lang
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }
            `}
          >
            {lang === "en"
              ? "EN"
              : lang === "zh"
              ? "中文"
              : "فارسی"}
          </button>
        ))}
      </div>
    </header>

    {/* =========================================
        Compact Instructions
    ========================================== */}
    <section
        className="
          border-b
          border-blue-200
          bg-blue-50
          px-4
          py-2
        "
      >
        <div
          className="
            flex
            items-start
            gap-2
            text-xs
            leading-5
            text-blue-900
          "
        >
          <span
            className="
              shrink-0
              font-bold
            "
          >
            {t.instructionsTitle}:
          </span>

          <span>
            {t.instructions}
          </span>
        </div>
      </section>

    {/* =========================================
        WebGL Map
    ========================================== */}
    <section className="w-full bg-black">
      <div className="h-[650px] w-full">
        <FlowMapWebGL />
      </div>
    </section>

    {/* =========================================
        Learning Content
    ========================================== */}
    <section
      className="
        grid
        grid-cols-1
        border-t
        border-slate-200
        bg-white
        md:grid-cols-2
      "
    >
      {/* Learning Objectives */}
      <div
        className="
          border-b
          border-slate-200
          px-4
          py-3
          md:border-b-0
          md:border-r
        "
      >
        <h2
          className="
            mb-1.5
            text-sm
            font-bold
            text-slate-900
          "
        >
          {t.overviewTitle}
        </h2>

        <p
          className="
            mb-2
            text-xs
            leading-5
            text-slate-600
          "
        >
          {t.overview}
        </p>

        <ul
          className="
            space-y-0.5
            text-xs
            leading-5
            text-slate-700
          "
        >
          <li>• {t.objective1}</li>
          <li>• {t.objective2}</li>
          <li>• {t.objective3}</li>
          <li>• {t.objective4}</li>
        </ul>
      </div>

      {/* Questions */}
      <div
        className="
          px-4
          py-3
        "
      >
        <h2
          className="
            mb-1.5
            text-sm
            font-bold
            text-slate-900
          "
        >
          {t.questionTitle}
        </h2>

        <ol
          className="
            space-y-0.5
            text-xs
            leading-5
            text-slate-700
          "
        >
          <li>1. {t.question1}</li>
          <li>2. {t.question2}</li>
          <li>3. {t.question3}</li>
          <li>4. {t.question4}</li>
        </ol>
      </div>
    </section>
  </main>
  );
}