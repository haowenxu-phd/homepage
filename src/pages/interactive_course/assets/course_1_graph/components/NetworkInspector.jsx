import React, { useMemo } from "react";


export default function NetworkInspector({
  roadNetwork,
  selectedLaneId,
  hoveredLaneId,
  text,
}) {

  // ============================================================
  // Hover has temporary priority.
  // Otherwise show the clicked/selected lane.
  // ============================================================

  const activeLaneId =
    hoveredLaneId ??
    selectedLaneId;


  // ============================================================
  // Find corresponding GeoJSON feature
  // ============================================================

  const activeFeature =
    useMemo(() => {

      if (!activeLaneId) {
        return null;
      }


      return (
        roadNetwork?.features?.find(
          (feature) =>
            feature?.properties?.lane_id ===
            activeLaneId
        ) ?? null
      );

    }, [
      roadNetwork,
      activeLaneId,
    ]);


  // ============================================================
  // Render
  // ============================================================

 return (
  <div className="h-full w-full min-w-0">

    {!activeFeature ? (

      <div
        className="
          flex
          h-full
          min-h-[180px]
          w-full
          items-center
          justify-center
          px-6
          text-center
          text-sm
          text-slate-400
        "
      >
        {
          text?.placeholder ??
          "Select a network element to inspect its data structure."
        }
      </div>

    ) : (

      <div className="flex h-full w-full min-w-0 flex-col">

        {/* Header */}

        <div
          className="
            flex
            w-full
            items-center
            justify-between
            border-b
            border-slate-200
            px-4
            py-2
          "
        >
          <span className="text-sm font-medium text-slate-700">
            {activeLaneId}
          </span>

          <span
            className="
              rounded-md
              bg-slate-100
              px-2
              py-1
              text-xs
              text-slate-500
            "
          >
            GeoJSON Feature
          </span>
        </div>


        {/* Code display */}

        <pre
          className="
            m-0
            box-border
            w-full
            min-w-0
            max-w-full
            flex-1
            overflow-auto
            bg-slate-950
            p-4
            text-left
            text-xs
            leading-5
            text-slate-100
          "
        >
          <code>
            {JSON.stringify(
              activeFeature,
              null,
              2
            )}
          </code>
        </pre>

      </div>

    )}

  </div>
);
}