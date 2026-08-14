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

  // =========================================================
    // Initial vehicle heading
    // =========================================================

    const firstGeometryXY =
      firstLane.geometry_xy;


    if (
      firstGeometryXY &&
      firstGeometryXY.length >= 2
    ) {

      const [
        x0,
        y0
      ] =
        firstGeometryXY[0];


      const [
        x1,
        y1
      ] =
        firstGeometryXY[1];


      const dx =
        x1 - x0;

      const dy =
        y1 - y0;


      this.headingRad =
        Math.atan2(
          dy,
          dx
        );


      this.headingDeg =
        this.headingRad *
        180 /
        Math.PI;

    } else {

      this.headingRad =
        0;

      this.headingDeg =
        0;

    }

  }

}