import React, {
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as d3 from "d3";


export default function RoadNetworkGraph({
  roadNetwork,
  selectedLaneId,
  hoveredLaneId,
  onSelectLane,
  onHoverLane,
}) {

  const svgRef = useRef(null);


  // ============================================================
  // Convert GeoJSON lane network into graph data
  //
  // One lane = one graph node
  // downstream relationship = one directed graph edge
  // ============================================================

  const graphData = useMemo(() => {

    const features =
      roadNetwork?.features ?? [];


    // ----------------------------------------------------------
    // Build node list
    // ----------------------------------------------------------

    const nodes = features
      .map((feature) => {

        const properties =
          feature?.properties ?? {};


        return {

          id:
            properties.lane_id,

          roadName:
            properties.road_name ??
            "Unknown",

          laneType:
            properties.lane_type ??
            "road",

          upstream:
            properties.upstream ??
            [],

          downstream:
            properties.downstream ??
            [],

        };

      })
      .filter(
        (node) => node.id
      );


    // ----------------------------------------------------------
    // Build directed link list
    //
    // Only use downstream relationships.
    // Do NOT also use upstream or edges will be duplicated.
    // ----------------------------------------------------------

    const links = [];


    features.forEach(
      (feature) => {

        const properties =
          feature?.properties ?? {};


        const sourceId =
          properties.lane_id;


        const downstream =
          properties.downstream ?? [];


        if (!sourceId) {
          return;
        }


        downstream.forEach(
          (targetId) => {

            links.push({

              source:
                sourceId,

              target:
                targetId,

            });

          }
        );

      }
    );


    return {

      nodes,
      links,

    };

  }, [roadNetwork]);



  // ============================================================
  // Build D3 force-directed graph
  //
  // This only runs when the road network changes.
  // ============================================================

  useEffect(() => {

    if (!svgRef.current) {
      return;
    }


    // ==========================================================
    // Canvas dimensions
    // ==========================================================

    const width =
      800;

    const height =
      600;


    // ==========================================================
    // D3 mutates node/link objects,
    // so clone our React data first.
    // ==========================================================

    const nodes =
      graphData.nodes.map(
        (node) => ({
          ...node,
        })
      );


    const links =
      graphData.links.map(
        (link) => ({
          ...link,
        })
      );


    // ==========================================================
    // Select SVG
    // ==========================================================

    const svg =
      d3.select(
        svgRef.current
      );


    // Clear previous graph
    svg
      .selectAll("*")
      .remove();


    svg

      .attr(
        "viewBox",
        `0 0 ${width} ${height}`
      )

      .attr(
        "preserveAspectRatio",
        "xMidYMid meet"
      )

      .style(
        "background",
        "#ffffff"
      );


    // ==========================================================
    // Background
    //
    // Clicking empty graph clears selected lane
    // ==========================================================

    svg

      .append("rect")

      .attr(
        "width",
        width
      )

      .attr(
        "height",
        height
      )

      .attr(
        "fill",
        "white"
      )

      .on(
        "click",
        () => {

          onSelectLane(
            null
          );

        }
      );



    // ==========================================================
    // Arrow marker
    //
    // Used to show direction:
    //
    // lane_A -----> lane_B
    // ==========================================================

    const defs =
      svg
        .append("defs");


    defs

      .append("marker")

      .attr(
        "id",
        "lane-arrowhead"
      )

      .attr(
        "viewBox",
        "0 -5 10 10"
      )

      .attr(
        "refX",
        24
      )

      .attr(
        "refY",
        0
      )

      .attr(
        "markerWidth",
        6
      )

      .attr(
        "markerHeight",
        6
      )

      .attr(
        "orient",
        "auto"
      )

      .append("path")

      .attr(
        "d",
        "M0,-5L10,0L0,5"
      )

      .attr(
        "fill",
        "#888"
      );



    // ==========================================================
    // Main graph layer
    // ==========================================================

    const graphLayer =
      svg

        .append("g")

        .attr(
          "class",
          "graph-layer"
        );



    // ==========================================================
    // Links
    // ==========================================================

    const link =
      graphLayer

        .append("g")

        .attr(
          "class",
          "link-layer"
        )

        .selectAll("line")

        .data(
          links
        )

        .join("line")

        .attr(
          "class",
          "lane-link"
        )

        .attr(
          "stroke",
          "#999"
        )

        .attr(
          "stroke-width",
          1.5
        )

        .attr(
          "stroke-opacity",
          0.7
        )

        .attr(
          "marker-end",
          "url(#lane-arrowhead)"
        );



    // ==========================================================
    // Nodes
    // ==========================================================

    const node =
      graphLayer

        .append("g")

        .attr(
          "class",
          "node-layer"
        )

        .selectAll("circle")

        .data(
          nodes,
          (d) => d.id
        )

        .join("circle")

        .attr(
          "class",
          "lane-node"
        )

        .attr(
          "r",
          (d) => {

            // Slightly larger for intersection lanes

            if (
              d.laneType ===
              "intersect"
            ) {

              return 18;

            }


            return 15;

          }
        )

        .attr(
          "fill",
          "#00aaff"
        )

        .attr(
          "stroke",
          "#ffffff"
        )

        .attr(
          "stroke-width",
          2
        )

        .style(
          "cursor",
          "pointer"
        )

       .on(
            "mouseover",
            (event, d) => {

              onHoverLane(
                d.id
              );

            }
          )

          .on(
            "mouseout",
            () => {

              onHoverLane(
                null
              );

            }
          )

          .on(
            "mouseover",
            (event, d) => {

              event.stopPropagation();

              onSelectLane(
                d.id
              );

            }
          );



    // ==========================================================
    // Native SVG tooltip
    // ==========================================================

    node

      .append("title")

      .text(
        (d) => {

          return (
            `Lane ID: ${d.id}\n` +
            `Road Name: ${d.roadName}\n` +
            `Lane Type: ${d.laneType}\n` +
            `Upstream: ${d.upstream.join(", ") || "None"}\n` +
            `Downstream: ${d.downstream.join(", ") || "None"}`
          );

        }
      );



    // ==========================================================
    // Node labels
    // ==========================================================

    const label =
      graphLayer

        .append("g")

        .attr(
          "class",
          "label-layer"
        )

        .selectAll("text")

        .data(
          nodes,
          (d) => d.id
        )

        .join("text")

        .attr(
          "class",
          "lane-label"
        )

        .text(
          (d) => d.id
        )

        .attr(
          "font-size",
          16
        )

        .attr(
          "font-family",
          "sans-serif"
        )

        .attr(
          "fill",
          "#222"
        )

        .attr(
          "dx",
          20
        )

        .attr(
          "dy",
          4
        )

        .attr(
          "pointer-events",
          "none"
        );



    // ==========================================================
    // Force simulation
    // ==========================================================

    const simulation =
      d3

        .forceSimulation(
          nodes
        )


        // ------------------------------------------------------
        // Link force
        // ------------------------------------------------------

        .force(

          "link",

          d3

            .forceLink(
              links
            )

            .id(
              (d) => d.id
            )

            .distance(
              90
            )

            .strength(
              0.8
            )

        )


        // ------------------------------------------------------
        // Repulsion
        // ------------------------------------------------------

        .force(

          "charge",

          d3

            .forceManyBody()

            .strength(
              -350
            )

        )


        // ------------------------------------------------------
        // Keep graph centered
        // ------------------------------------------------------

        .force(

          "center",

          d3.forceCenter(
            width / 2,
            height / 2
          )

        )


        // ------------------------------------------------------
        // Prevent nodes overlapping
        // ------------------------------------------------------

        .force(

          "collision",

          d3

            .forceCollide()

            .radius(
              28
            )

        );



    // ==========================================================
    // Update SVG on every simulation tick
    // ==========================================================

    simulation

      .on(
        "tick",
        () => {


          // ----------------------------------------------------
          // Update links
          // ----------------------------------------------------

          link

            .attr(
              "x1",
              (d) => d.source.x
            )

            .attr(
              "y1",
              (d) => d.source.y
            )

            .attr(
              "x2",
              (d) => d.target.x
            )

            .attr(
              "y2",
              (d) => d.target.y
            );



          // ----------------------------------------------------
          // Update nodes
          // ----------------------------------------------------

          node

            .attr(
              "cx",
              (d) => d.x
            )

            .attr(
              "cy",
              (d) => d.y
            );



          // ----------------------------------------------------
          // Update labels
          // ----------------------------------------------------

          label

            .attr(
              "x",
              (d) => d.x
            )

            .attr(
              "y",
              (d) => d.y
            );

        }
      );



    // ==========================================================
    // Drag interaction
    // ==========================================================

    const dragStarted =
      (
        event,
        d
      ) => {

        if (
          !event.active
        ) {

          simulation

            .alphaTarget(
              0.3
            )

            .restart();

        }


        d.fx =
          d.x;

        d.fy =
          d.y;

      };



    const dragged =
      (
        event,
        d
      ) => {

        d.fx =
          event.x;

        d.fy =
          event.y;

      };



    const dragEnded =
      (
        event,
        d
      ) => {

        if (
          !event.active
        ) {

          simulation

            .alphaTarget(
              0
            );

        }


        d.fx =
          null;

        d.fy =
          null;

      };



    node.call(

      d3

        .drag()

        .on(
          "start",
          dragStarted
        )

        .on(
          "drag",
          dragged
        )

        .on(
          "end",
          dragEnded
        )

    );



    // ==========================================================
    // Cleanup
    // ==========================================================

    return () => {

      simulation.stop();

    };


  }, [
    graphData,
    onSelectLane,
  ]);


  //-----------------------------------------------------
  // fade d3js 
        useEffect(() => {

        if (!svgRef.current) {
          return;
        }


        const svg =
          d3.select(
            svgRef.current
          );


        // ============================================================
        // Nodes
        // ============================================================

        svg
          .selectAll(
            ".lane-node"
          )

          .attr(
            "opacity",
            (d) => {

              // No hover -> restore everything
              if (!hoveredLaneId) {
                return 1;
              }


              // Hovered node
              if (
                d.id ===
                hoveredLaneId
              ) {
                return 1;
              }


              // Everything else
              return 0.3;

            }
          );


        // ============================================================
        // Labels
        // ============================================================

        svg
          .selectAll(
            ".lane-label"
          )

          .attr(
            "opacity",
            (d) => {

              if (!hoveredLaneId) {
                return 1;
              }


              if (
                d.id ===
                hoveredLaneId
              ) {
                return 1;
              }


              return 0.3;

            }
          );


        // ============================================================
        // Edges
        // ============================================================

        svg
          .selectAll(
            ".lane-link"
          )

          .attr(
            "opacity",
            (d) => {

              if (!hoveredLaneId) {
                return 0.7;
              }


              const sourceId =
                typeof d.source === "object"
                  ? d.source.id
                  : d.source;


              const targetId =
                typeof d.target === "object"
                  ? d.target.id
                  : d.target;


              // Edge connected to hovered node
              if (
                sourceId === hoveredLaneId ||
                targetId === hoveredLaneId
              ) {

                return 1;

              }


              return 0.3;

            }
          );


      }, [
        hoveredLaneId,
      ]);

    // ============================================================
  // Leaflet to D3
  // ============================================================

  useEffect(() => {

  if (!svgRef.current) {
    return;
  }

  const svg =
    d3.select(svgRef.current);


  // ============================================================
  // Highlight selected node
  // ============================================================

  svg
    .selectAll(".lane-node")

    .attr(
      "fill",
      (d) => {

        if (d.id === selectedLaneId) {
          return "#ff0000";
        }

        if (d.laneType === "intersect") {
          return "#ffb000";
        }

        return "#00aaff";
      }
    )

    .attr(
      "stroke",
      (d) => {

        if (d.id === selectedLaneId) {
          return "#7f0000";
        }

        return "#ffffff";
      }
    )

    .attr(
      "stroke-width",
      (d) => {

        if (d.id === selectedLaneId) {
          return 4;
        }

        return 2;
      }
    );


  // ============================================================
  // Highlight edges connected to selected node
  // ============================================================

    svg
      .selectAll(".lane-link")

      .attr(
        "stroke",
        (d) => {

          if (!selectedLaneId) {
            return "#999";
          }

          const sourceId =
            typeof d.source === "object"
              ? d.source.id
              : d.source;

          const targetId =
            typeof d.target === "object"
              ? d.target.id
              : d.target;


          if (
            sourceId === selectedLaneId ||
            targetId === selectedLaneId
          ) {
            return "#ff0000";
          }

          return "#999";
        }
      )

      .attr(
        "stroke-width",
        (d) => {

          if (!selectedLaneId) {
            return 1.5;
          }

          const sourceId =
            typeof d.source === "object"
              ? d.source.id
              : d.source;

          const targetId =
            typeof d.target === "object"
              ? d.target.id
              : d.target;


          if (
            sourceId === selectedLaneId ||
            targetId === selectedLaneId
          ) {
            return 4;
          }

          return 1.5;
        }
      )

      .attr(
        "stroke-opacity",
        (d) => {

          if (!selectedLaneId) {
            return 0.7;
          }

          const sourceId =
            typeof d.source === "object"
              ? d.source.id
              : d.source;

          const targetId =
            typeof d.target === "object"
              ? d.target.id
              : d.target;


          if (
            sourceId === selectedLaneId ||
            targetId === selectedLaneId
          ) {
            return 1;
          }

          return 0.25;
        }
      );

  }, [
    selectedLaneId,
  ]);

  // ============================================================
  // Update selected node styling
  //
  // This DOES NOT rebuild the force simulation.
  // ============================================================

  useEffect(() => {

    if (
      !svgRef.current
    ) {

      return;

    }


    const svg =
      d3.select(
        svgRef.current
      );


    svg

      .selectAll(
        ".lane-node"
      )

      .attr(
        "fill",
        (d) => {

          if (
            d.id ===
            selectedLaneId
          ) {

            return "#ff0000";

          }


          if (
            d.laneType ===
            "intersect"
          ) {

            return "#ffb000";

          }


          return "#00aaff";

        }
      )

      .attr(
        "stroke",
        (d) => {

          if (
            d.id ===
            selectedLaneId
          ) {

            return "#7f0000";

          }


          return "#ffffff";

        }
      )

      .attr(
        "stroke-width",
        (d) => {

          if (
            d.id ===
            selectedLaneId
          ) {

            return 4;

          }


          return 2;

        }
      );


  }, [
    selectedLaneId,
  ]);



  // ============================================================
  // Render
  // ============================================================

  return (

    <svg

      ref={
        svgRef
      }

      style={{

        width:
          "100%",

        height:
          "100%",

        minHeight:
          "420px",

        display:
          "block",

      }}

    />

  );

}