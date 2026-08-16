// =========================================================
// TrafficSignal
// =========================================================
//
// Represents one lane-level traffic signal.
//
// Responsibilities:
//
// - Store signal ID
// - Store controlled lane ID
// - Store stop-bar position
// - Store signal timing
// - Store current signal state
//
// It should NOT:
//
// - Move vehicles
// - Detect vehicles
// - Run car-following behavior
// - Render Leaflet markers
//
// =========================================================

export class TrafficSignal {

  constructor({
    id,

    laneId,

    lon,
    lat,

    x,
    y,

    distanceAlongLaneM,

    greenDurationS = 20,

    yellowDurationS = 3,

    redDurationS = 20,

    offsetS = 0,
  }) {

    this.id =
      id;


    // -----------------------------------------------------
    // Controlled lane
    // -----------------------------------------------------

    this.laneId =
      laneId;


    // -----------------------------------------------------
    // Geographic position
    //
    // Used by Leaflet
    // -----------------------------------------------------

    this.lon =
      lon;

    this.lat =
      lat;


    // -----------------------------------------------------
    // Projected position
    //
    // Used by simulation / distance calculations
    // -----------------------------------------------------

    this.x =
      x;

    this.y =
      y;


    // -----------------------------------------------------
    // Position along controlled lane
    // -----------------------------------------------------

    this.distanceAlongLaneM =
      distanceAlongLaneM;


    // -----------------------------------------------------
    // Signal timing
    // -----------------------------------------------------

    this.greenDurationS =
      greenDurationS;

    this.yellowDurationS =
      yellowDurationS;

    this.redDurationS =
      redDurationS;

    this.offsetS =
      offsetS;


    // -----------------------------------------------------
    // Current state
    // -----------------------------------------------------

    this.state =
      "red";

  }

}