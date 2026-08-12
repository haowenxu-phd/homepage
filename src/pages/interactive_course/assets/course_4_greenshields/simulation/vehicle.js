// =========================================================
// Vehicle
// =========================================================

export class Vehicle {

  constructor({
    id,
    route,
    routingGraph,

    speedMps = 0,

    desiredSpeedMps = 10,

    lengthM = 4.5,

  }) {

    this.id =
      id;

    this.route =
      route;

    this.routeIndex =
      0;

    this.currentLaneId =
      route[0];


    this.segmentIndex =
      0;

    this.distanceAlongSegmentM =
      0;

    this.distanceAlongLaneM =
      0;


    // Actual current speed
    this.speedMps =
      speedMps;


    // Speed the driver would like to travel
    this.desiredSpeedMps =
      desiredSpeedMps;


    this.accelerationMps2 =
      0;


    this.lengthM =
      lengthM;


    this.finished =
      false;


    const firstLane =
      routingGraph.lanes[
        this.currentLaneId
      ];


    const [
      lon,
      lat
    ] =
      firstLane.geometry_lonlat[0];


    const [
      x,
      y
    ] =
      firstLane.geometry_xy[0];


    this.lon =
      lon;

    this.lat =
      lat;

    this.x =
      x;

    this.y =
      y;

  }

}