import React, { useState } from "react";

import RoadNetworkMap
from "./assets/course_1_graph/components/RoadNetworkMap";

import RoadNetworkGraph
from "./assets/course_1_graph/components/RoadNetworkGraph";

import roadNetwork
from "./assets/course_1_graph/data/unsw_lane_network.json";

import NetworkInspector
from "./assets/course_1_graph/components/NetworkInspector";


export default function InteractiveLearning_c1_graph() {
  // ============================================================
  // Language state
  // ============================================================

  const [language, setLanguage] = useState("en");

  // ============================================================
  // Multilingual text data
  //
  // Later we can move this into:
  // /data/teaching/c1_graph_text.js
  // ============================================================
  // This is for roadnetwork map
  // This is for roadnetwork graph
  const [selectedLaneId, setSelectedLaneId] =
  useState(null);

  const [
    hoveredLaneId,
    setHoveredLaneId,
  ] = useState(null);
 

  const translations = {
    en: {
    "courseTitle": "Road Networks as Graphs",

    "introduction": "A transportation network consists of interconnected roads, intersections, and movement paths. In transportation modelling and computer science, these real-world networks can be represented computationally as graphs composed of vertices (nodes) and edges.",

    "prompt": "Explore the same road network in both views. Select or hover over a road segment or graph node and observe how the geographic representation corresponds to the graph representation.",

    "map": {
      "title": "Real-World Geographic Road Network",
      "description": "Explore the lane-based road network near the UNSW campus. Hover over or click different road segments to inspect individual lanes and their corresponding graph elements.",
      "placeholder": "Leaflet map will be displayed here."
    },

    "graph": {
      "title": "Graph Representation",
      "description": "Explore the nodes, edges, and connectivity relationships of the same road network. Hover over or click individual nodes to see how they correspond to road segments on the geographic map.",
      "placeholder": "D3.js graph will be displayed here."
    },

    "code": {
      "title": "Network Data Structure",
      "description": "Inspect the JSON representation and connectivity information of the selected network element.",
      "placeholder": "Select a network element to inspect its data structure."
    },

    "agent": {
      "title": "Ask the Teaching Agent",
      "description": "Ask questions about graph theory, road-network representation, nodes, edges, or network connectivity.",
      "placeholder": "Ask a question...",
      "button": "Ask"
    },

    "language": "Language"
  },

    zh: {
    "courseTitle": "道路网络的图结构表示",

    "introduction": "交通网络由相互连接的道路、交叉口和车辆通行路径组成。在交通建模和计算机科学中，这些现实世界中的交通网络可以通过由顶点（节点）和边组成的图结构进行计算表示。",

    "prompt": "请在两个视图中探索同一个道路网络。选择或悬停在道路片段或图节点上，并观察道路网络的地理空间表示与图结构表示之间的对应关系。",

    "map": {
      "title": "现实世界地理道路网络",
      "description": "探索 UNSW 校园附近基于车道的道路网络。将鼠标悬停在不同的道路片段上或点击道路片段，以查看各个车道及其对应的图结构元素。",
      "placeholder": "Leaflet 地图将在此处显示。"
    },

    "graph": {
      "title": "图结构表示",
      "description": "探索同一道路网络中的节点、边以及网络连接关系。将鼠标悬停在不同节点上或点击节点，观察它们与地理地图中道路片段之间的对应关系。",
      "placeholder": "D3.js 图结构将在此处显示。"
    },

    "code": {
      "title": "网络数据结构",
      "description": "查看所选网络元素的 JSON 表示及其网络连接信息。",
      "placeholder": "请选择一个网络元素以查看其数据结构。"
    },

    "agent": {
      "title": "询问教学智能体",
      "description": "你可以询问有关图论、道路网络表示、节点、边或网络连接关系的问题。",
      "placeholder": "请输入你的问题……",
      "button": "提问"
    },

    "language": "语言"
  },

    fa: {
        "courseTitle": "نمایش شبکه‌های جاده‌ای به‌صورت گراف",

        "introduction": "یک شبکه حمل‌ونقل از جاده‌ها، تقاطع‌ها و مسیرهای حرکتی به‌هم‌پیوسته تشکیل شده است. در مدل‌سازی حمل‌ونقل و علوم کامپیوتر، این شبکه‌های دنیای واقعی را می‌توان به‌صورت محاسباتی با استفاده از گرافی متشکل از رأس‌ها (گره‌ها) و یال‌ها نمایش داد.",

        "prompt": "یک شبکه جاده‌ای را در هر دو نما بررسی کنید. نشانگر ماوس را روی یک قطعه جاده یا گره گراف قرار دهید یا روی آن کلیک کنید و مشاهده کنید که نمایش جغرافیایی شبکه چگونه با نمایش گراف آن مطابقت دارد.",

        "map": {
          "title": "شبکه جاده‌ای جغرافیایی در دنیای واقعی",
          "description": "شبکه جاده‌ای مبتنی بر خطوط عبور در نزدیکی پردیس UNSW را بررسی کنید. نشانگر ماوس را روی قطعات مختلف جاده قرار دهید یا روی آن‌ها کلیک کنید تا خطوط عبور و عناصر متناظر آن‌ها در گراف را مشاهده کنید.",
          "placeholder": "نقشه Leaflet در اینجا نمایش داده خواهد شد."
        },

        "graph": {
          "title": "نمایش گراف",
          "description": "گره‌ها، یال‌ها و روابط اتصال در همان شبکه جاده‌ای را بررسی کنید. نشانگر ماوس را روی گره‌ها قرار دهید یا روی آن‌ها کلیک کنید تا ارتباط آن‌ها با قطعات جاده در نقشه جغرافیایی را مشاهده کنید.",
          "placeholder": "گراف D3.js در اینجا نمایش داده خواهد شد."
        },

        "code": {
          "title": "ساختار داده شبکه",
          "description": "نمایش JSON و اطلاعات اتصال عنصر انتخاب‌شده در شبکه را بررسی کنید.",
          "placeholder": "برای مشاهده ساختار داده، یک عنصر از شبکه را انتخاب کنید."
        },

        "agent": {
          "title": "از دستیار آموزشی بپرسید",
          "description": "درباره نظریه گراف، نمایش شبکه جاده‌ای، گره‌ها، یال‌ها یا اتصال شبکه سؤال کنید.",
          "placeholder": "سؤال خود را وارد کنید...",
          "button": "پرسش"
        },

        "language": "زبان"
      }

  };

  // Current language text
  const t = translations[language];

  // ============================================================
  // Shared selection state
  //
  // THIS WILL BECOME IMPORTANT.
  //
  // Leaflet, D3 and CodeViewer will all use this state.
  // ============================================================

  const [selectedFeature, setSelectedFeature] = useState(null);


  // ============================================================
  // Teaching agent state
  // ============================================================

  const [question, setQuestion] = useState("");

  const handleAskQuestion = () => {
    console.log("Student question:", question);

    // Later:
    //
    // fetch("/api/teaching-agent", {...})
    //
    // or your Node.js backend / OpenAI API
  };

    return (
    <main className="m-0 p-0">

      {/* =====================================================
          Course Header
      ====================================================== */}

      <section className="mb-1 flex items-center justify-between gap-2 border border-slate-300 bg-white px-2 py-1">
        <h2 className="text-xl font-semibold text-slate-900">
          {t.courseTitle}
        </h2>

        <div className="flex items-center gap-1">
          <label
            htmlFor="course-language"
            className="text-sm text-slate-600"
          >
            {t.language}
          </label>

          <select
            id="course-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="fa">فارسی</option>
          </select>
        </div>

        
      </section>

 <p>
          This tool was also developed with support from the Ideation Laboratory (iLab)
          at the University of Tennessee, Knoxville, led by{" "}
          <a
            href="https://tickle.utk.edu/ise/faculty/xueping-li/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Prof. Xueping Li
          </a>.
        </p>

      {/* =====================================================
          Introduction
      ====================================================== */}

      <section className="mb-1 border border-sky-400 bg-white px-2 py-2">
        <p className="m-1 text-left text-base leading-6 text-slate-700">
          {t.introduction}
        </p>
      </section>


      {/* =====================================================
          Prompt / Teaching Hint
      ====================================================== */}

      <section className="mb-1 pt-1 border border-sky-400 bg-sky-50 px-2 py-1">
        <p className="m-1  text-left text-sm text-slate-700">
          {t.prompt}
        </p>
      </section>


      {/* =====================================================
          Main Visualization Area
      ====================================================== */}

      <section className="grid grid-cols-1 gap-1 lg:grid-cols-2">

        {/* =================================================
            Leaflet Map
        ================================================== */}

        <div className="flex min-h-[430px] flex-col border border-sky-400 bg-white">

          <div className="border-b border-slate-200 px-2 py-1">
            <h4 className="m-0 text-base font-semibold text-slate-900">
              {t.map.title}
            </h4>

            <p className="m-2 text-xs text-slate-500">
              {t.map.description}
            </p>
          </div>

          <div className="flex flex-1 p-1">
            <div className="min-w-0 flex-1">
              <RoadNetworkMap

                    roadNetwork={
                      roadNetwork
                    }

                    selectedLaneId={
                      selectedLaneId
                    }

                    hoveredLaneId={
                      hoveredLaneId
                    }

                    onSelectLane={
                      setSelectedLaneId
                    }

                    onHoverLane={
                      setHoveredLaneId
                    }

                  />
            </div>
          </div>

        </div>


        {/* =================================================
            D3 Graph
        ================================================== */}

        <div className="flex min-h-[430px] flex-col border border-sky-400 bg-white">

          <div className="border-b border-slate-200 px-2 py-1">
            <h4 className="m-1 text-base font-semibold text-slate-900">
              {t.graph.title}
            </h4>

            <p className="m-2 text-xs text-slate-500">
              {t.graph.description}
            </p>
          </div>

          <div className="flex flex-1 p-1">

            <div className="min-w-0 flex-1 text-slate-400">

             <RoadNetworkGraph

                    roadNetwork={
                      roadNetwork
                    }

                    selectedLaneId={
                      selectedLaneId
                    }

                    hoveredLaneId={
                      hoveredLaneId
                    }

                    onSelectLane={
                      setSelectedLaneId
                    }

                    onHoverLane={
                      setHoveredLaneId
                    }

                  />

            </div>

          </div>

        </div>


        {/* =================================================
            Interactive Code / JSON Viewer
        ================================================== */}

        <div className="flex min-h-[260px] flex-col border border-sky-400 bg-white">

          <div className="border-b border-slate-200 px-2 py-1">
            <h4 className="m-1 text-base font-semibold text-slate-900">
              {t.code.title}
            </h4>

            <p className="m-2 text-xs text-slate-500">
              {t.code.description}
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center p-1">

            {selectedFeature ? (

              <pre className="m-1 h-full w-full overflow-auto rounded bg-slate-950 p-2 text-xs text-slate-100">
                {JSON.stringify(selectedFeature, null, 2)}
              </pre>

            ) : (

              <div className="w-full min-w-0 flex-1">
                 <NetworkInspector

                      roadNetwork={
                        roadNetwork
                      }

                      selectedLaneId={
                        selectedLaneId
                      }

                      hoveredLaneId={
                        hoveredLaneId
                      }

                      text={
                        t.code
                      }

                    />
              </div>

            )}

          </div>

        </div>


        {/* =================================================
            Teaching Agent
        ================================================== */}
      <div className="flex h-[500px] flex-col overflow-hidden border border-sky-400 bg-white">

      {/* Fixed header */}
      <div className="shrink-0 border-b border-slate-200 px-2 py-1">

        <h4 className="m-1 text-base font-semibold text-slate-900">
          {t.agent.title}
        </h4>

        <p className="m-1 text-xs text-slate-500">
          {t.agent.description}
        </p>

      </div>


      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-1">

        <div className="flex flex-col gap-2">

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.agent.placeholder}
            className="
              min-h-[110px]
              w-full
              resize-none
              rounded
              border
              border-slate-300
              p-2
              text-sm
              outline-none
              focus:border-sky-500
            "
          />

          <button
            type="button"
            onMouseEnter={handleAskQuestion}
            className="
              self-end
              rounded
              bg-sky-600
              px-3
              py-1
              text-sm
              font-medium
              text-white
              transition
              hover:bg-sky-700
            "
          >
            {t.agent.button}
          </button>

          {/* 
            Put generated teaching-agent content here.
            If it becomes taller than the available space,
            this section will scroll vertically.
          */}

        </div>

      </div>

    </div>

      </section>

    </main>
  );
}