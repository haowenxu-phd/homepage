// =========================================================
// Vehicle
// =========================================================

export class Vehicle {

  constructor({
    id,
    route,
    routingGraph,
    speedMps = 10,
    lengthM = 4.5,
  }) {

    // -----------------------------------------------------
    // Basic information
    // -----------------------------------------------------

    this.id = id;

    this.route = route;


    // -----------------------------------------------------
    // Route state
    // -----------------------------------------------------

    this.routeIndex = 0;

    this.currentLaneId =
      route[0];


    // -----------------------------------------------------
    // Position along current lane geometry
    // -----------------------------------------------------

    this.segmentIndex = 0;

    this.distanceAlongSegmentM = 0;
    this.distanceAlongLaneM = 0;


    // -----------------------------------------------------
    // Vehicle dynamics
    // -----------------------------------------------------

    this.speedMps =
      speedMps;

    this.accelerationMps2 =
      0;

    this.lengthM =
      lengthM;


    // -----------------------------------------------------
    // Simulation state
    // -----------------------------------------------------

    this.finished = false;


    // -----------------------------------------------------
    // Initial geographic position
    // -----------------------------------------------------

    const firstLane =
      routingGraph.lanes[
        this.currentLaneId
      ];

    if (!firstLane) {

      throw new Error(
        `Lane not found: ${this.currentLaneId}`
      );

    }


    const firstCoordinate =
      firstLane.geometry_lonlat[0];


    this.lon =
      firstCoordinate[0];

    this.lat =
      firstCoordinate[1];


    // -----------------------------------------------------
    // Initial projected position
    // -----------------------------------------------------

    const firstXY =
      firstLane.geometry_xy[0];


    this.x =
      firstXY[0];

    this.y =
      firstXY[1];

  }

}