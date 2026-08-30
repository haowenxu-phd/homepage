import React from "react";

import L from "leaflet";

import {
  Marker,
  Tooltip,
} from "react-leaflet";


// =========================================================
// Create traffic signal icon
// =========================================================

function createTrafficSignalIcon(
  state
) {

  let color =
    "#ef4444";


  if (
    state === "green"
  ) {

    color =
      "#22c55e";

  }


  if (
    state === "yellow"
  ) {

    color =
      "#eab308";

  }


  return L.divIcon({

    className:
      "traffic-signal-marker",

    html: `
      <div
        style="
          width: 14px;
          height: 14px;

          background: ${color};

          border: 2px solid #111827;
          border-radius: 50%;

          box-shadow:
            0 1px 4px
            rgba(0, 0, 0, 0.35);
        "
      >
      </div>
    `,

    iconSize: [
      14,
      14
    ],

    iconAnchor: [
      7,
      7
    ],

  });

}


// =========================================================
// TrafficSignalLayer
// =========================================================

export default function TrafficSignalLayer({

  signals = [],

  simulationTimeS,

  getSignalState,

}) {

  return (
    <>
      {
        signals.map(
          signal => {

            const state =
              getSignalState(
                signal,
                simulationTimeS
              );


            return (

              <Marker
                key={
                  signal.id
                }

                position={[
                  signal.lat,
                  signal.lon
                ]}

                icon={
                  createTrafficSignalIcon(
                    state
                  )
                }
              >

                <Tooltip>

                  <div>

                    <strong>
                      {signal.id}
                    </strong>

                    <div>
                      Lane:{" "}
                      {signal.laneId}
                    </div>

                    <div>
                      State:{" "}
                      {state}
                    </div>

                  </div>

                </Tooltip>

              </Marker>

            );

          }
        )
      }
    </>
  );

}