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
        "Explore how terrain-driven surface-water flow interacts with roads, transportation corridors, and flood-prone infrastructure.",

      overviewTitle:
        "Learning Objectives",

      overview:
        "This interactive lesson combines WebGL-based flow visualization with a watershed flow-direction matrix to help students understand how surface water moves across terrain and how transportation infrastructure may intersect with, redirect, constrain, or become exposed to flood flows.",

      objective1:
        "Understand how a watershed flow-direction matrix represents local surface-water movement across terrain.",

      objective2:
        "Explore the spatial relationships among roads, drainage paths, terrain, and watershed structure.",

      objective3:
        "Identify transportation infrastructure that may be exposed to concentrated runoff or flood flows.",

      objective4:
        "Connect hydrologic flow patterns with transportation infrastructure planning, design, and resilience.",

      instructionsTitle:
        "Interactive Exploration",

      instructions:
        "Use the basemap selector to switch between transportation, satellite imagery, topographic, and other map layers. Observe the animated surface-water flow and compare its direction and concentration with terrain and elevation patterns. Zoom in and out across different parts of Iowa to examine transportation networks and infrastructure, and investigate where water flows toward, across, or around roads, bridges, culverts, and other infrastructure.",

      questionTitle:
        "Think About",

      question1:
        "Where do major surface-water flow paths intersect the transportation network?",

      question2:
        "Which road segments or transportation assets appear most exposed to concentrated runoff or flooding?",

      question3:
        "How might road embankments, bridges, culverts, or drainage infrastructure alter local flow paths?",

      question4:
        "How could this type of spatial analysis support flood-resilient transportation planning and infrastructure management?",

      mapTitle:
        "Interactive Watershed Flow Map",

      mapCaption:
        "WebGL visualization of terrain-driven surface-water flow and its spatial relationship with transportation infrastructure.",

      languageLabel:
        "Language",

      attribution:
        "This application was developed using watershed DEM data provided by the Iowa Flood Center and the U.S. Geological Survey (USGS).",
    },


    zh: {
      title:
        "道路网络、流域与洪水流动可视化",

      subtitle:
        "探索地形驱动的地表水流如何与道路、交通走廊及易受洪水影响的交通基础设施相互作用。",

      overviewTitle:
        "学习目标",

      overview:
        "本互动课程结合基于 WebGL 的水流可视化与流域流向矩阵，帮助学生理解地表水如何沿地形运动，以及交通基础设施如何与水流路径相交、改变或限制局部水流，并可能暴露于洪水风险之中。",

      objective1:
        "理解流域流向矩阵如何表示地形上的局部地表水流动方向。",

      objective2:
        "探索道路、排水路径、地形与流域空间结构之间的关系。",

      objective3:
        "识别可能暴露于集中径流或洪水影响的交通基础设施。",

      objective4:
        "将水文流动模式与交通基础设施规划、设计及韧性分析联系起来。",

      instructionsTitle:
        "互动探索",

      instructions:
        "使用地图上的底图选择器，在交通地图、卫星影像、地形图及其他地图图层之间切换。观察动态地表水流，并将水流方向和汇聚区域与地形和高程变化进行比较。通过放大和缩小地图，探索爱荷华州不同地区的交通网络与基础设施，并分析水流在何处流向、穿越或绕过道路、桥梁、涵洞及其他交通基础设施。",

      questionTitle:
        "思考问题",

      question1:
        "主要地表水流路径在哪里与交通网络相交？",

      question2:
        "哪些道路路段或交通基础设施最可能暴露于集中径流或洪水影响？",

      question3:
        "道路路堤、桥梁、涵洞或排水设施可能如何改变局部水流路径？",

      question4:
        "这种空间分析如何支持具有洪水韧性的交通规划与基础设施管理？",

      mapTitle:
        "互动流域水流地图",

      mapCaption:
        "基于 WebGL 的地形驱动地表水流可视化，用于分析水流与交通基础设施之间的空间关系。",

      languageLabel:
        "语言",

      attribution:
        "本应用使用由爱荷华洪水中心（Iowa Flood Center）和美国地质调查局（USGS）提供的流域 DEM 数据开发。",
    },


    fa: {
      title:
        "شبکه‌های جاده‌ای، حوضه‌های آبریز و نمایش جریان سیلاب",

      subtitle:
        "بررسی کنید که چگونه جریان آب سطحی ناشی از توپوگرافی با جاده‌ها، کریدورهای حمل‌ونقل و زیرساخت‌های در معرض خطر سیلاب تعامل دارد.",

      overviewTitle:
        "اهداف یادگیری",

      overview:
        "این درس تعاملی، نمایش جریان مبتنی بر WebGL را با ماتریس جهت جریان حوضه آبریز ترکیب می‌کند تا دانشجویان درک کنند آب سطحی چگونه در امتداد توپوگرافی حرکت می‌کند و زیرساخت‌های حمل‌ونقل چگونه می‌توانند با مسیرهای جریان تلاقی داشته باشند، آن‌ها را تغییر دهند یا محدود کنند و در معرض خطر سیلاب قرار گیرند.",

      objective1:
        "درک نحوه نمایش جهت حرکت محلی آب سطحی روی زمین توسط ماتریس جهت جریان حوضه آبریز.",

      objective2:
        "بررسی روابط مکانی میان جاده‌ها، مسیرهای زهکشی، توپوگرافی و ساختار حوضه آبریز.",

      objective3:
        "شناسایی زیرساخت‌های حمل‌ونقلی که ممکن است در معرض رواناب متمرکز یا جریان‌های سیلابی قرار گیرند.",

      objective4:
        "ارتباط دادن الگوهای جریان هیدرولوژیکی با برنامه‌ریزی، طراحی و تاب‌آوری زیرساخت‌های حمل‌ونقل.",

      instructionsTitle:
        "کاوش تعاملی",

      instructions:
        "از انتخابگر نقشه پایه برای جابه‌جایی میان نقشه‌های حمل‌ونقل، تصاویر ماهواره‌ای، نقشه‌های توپوگرافی و سایر لایه‌ها استفاده کنید. جریان متحرک آب سطحی را مشاهده کرده و جهت و تمرکز آن را با الگوهای توپوگرافی و ارتفاع مقایسه کنید. با بزرگ‌نمایی و کوچک‌نمایی در بخش‌های مختلف آیووا، شبکه‌ها و زیرساخت‌های حمل‌ونقل را بررسی کنید و ببینید آب در کجا به سمت جاده‌ها، از روی آن‌ها یا در اطراف جاده‌ها، پل‌ها، آبروها و سایر زیرساخت‌ها جریان پیدا می‌کند.",

      questionTitle:
        "سؤالات برای بررسی",

      question1:
        "مسیرهای اصلی جریان آب سطحی در کجا با شبکه حمل‌ونقل تلاقی دارند؟",

      question2:
        "کدام بخش‌های جاده‌ای یا زیرساخت‌های حمل‌ونقل بیشترین مواجهه را با رواناب متمرکز یا سیلاب دارند؟",

      question3:
        "خاکریزهای جاده‌ای، پل‌ها، آبروها یا زیرساخت‌های زهکشی چگونه می‌توانند مسیرهای محلی جریان را تغییر دهند؟",

      question4:
        "این نوع تحلیل مکانی چگونه می‌تواند از برنامه‌ریزی حمل‌ونقل و مدیریت زیرساخت مقاوم در برابر سیلاب پشتیبانی کند؟",

      mapTitle:
        "نقشه تعاملی جریان حوضه آبریز",

      mapCaption:
        "نمایش WebGL جریان آب سطحی ناشی از توپوگرافی و رابطه مکانی آن با زیرساخت‌های حمل‌ونقل.",

      languageLabel:
        "زبان",

      attribution:
        "این برنامه با استفاده از داده‌های DEM حوضه آبریز ارائه‌شده توسط مرکز سیلاب آیووا (Iowa Flood Center) و سازمان زمین‌شناسی ایالات متحده (USGS) توسعه یافته است.",
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