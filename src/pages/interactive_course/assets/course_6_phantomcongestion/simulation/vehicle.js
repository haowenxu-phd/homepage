// =========================================================
// Vehicle
// =========================================================

export class Vehicle {

  constructor({
    id,
    route,
    routingGraph,
    laneGeoJSON,

    speedMps = 0,

    desiredSpeedMps = 10,

    lengthM = 4.5,

  }) {

    // =====================================================
    // Validate route
    // =====================================================

    if (
      !Array.isArray(route) ||
      route.length === 0
    ) {

      throw new Error(
        `Vehicle ${id}: route is empty or invalid.`
      );

    }


    this.id =
      id;


    this.route = [
      ...route
    ];


    this.routeIndex =
      0;


    this.currentLaneId =
      this.route[0];


    this.segmentIndex =
      0;


    this.distanceAlongSegmentM =
      0;


    this.distanceAlongLaneM =
      0;


    // =====================================================
    // Vehicle dynamics
    // =====================================================

    this.speedMps =
      speedMps;


    this.desiredSpeedMps =
      desiredSpeedMps;


    this.accelerationMps2 =
      0;


    this.lengthM =
      lengthM;


    this.finished =
      false;


    // =====================================================
    // Find current lane in routing graph
    // =====================================================

    const graphLane =
      routingGraph?.lanes?.[
        this.currentLaneId
      ];


    if (!graphLane) {

      throw new Error(
        `Vehicle ${id}: lane "${this.currentLaneId}" ` +
        `was not found in routingGraph.lanes.`
      );

    }


    // =====================================================
    // Find geometry in GeoJSON
    // =====================================================

    const laneFeature =
      laneGeoJSON?.features?.find(
        feature => {

          const laneId =
            feature?.properties?.lane_id ??
            feature?.id;


          return (
            laneId ===
            this.currentLaneId
          );

        }
      );


    if (!laneFeature) {

      throw new Error(
        `Vehicle ${id}: geometry for lane ` +
        `"${this.currentLaneId}" was not found.`
      );

    }


    const geometryLonLat =
      laneFeature?.geometry?.coordinates;


    if (
      !Array.isArray(
        geometryLonLat
      ) ||
      geometryLonLat.length < 2
    ) {

      throw new Error(
        `Vehicle ${id}: lane "${this.currentLaneId}" ` +
        `does not contain a valid LineString.`
      );

    }


    // =====================================================
    // Store lane geometry
    // =====================================================

    this.geometryLonLat =
      geometryLonLat;


    // =====================================================
    // Initial longitude / latitude
    // =====================================================

    const [
      lon,
      lat
    ] =
      geometryLonLat[0];


    this.lon =
      lon;


    this.lat =
      lat;


    // =====================================================
    // Temporary local XY
    //
    // Convert longitude / latitude differences into
    // approximate local metres.
    //
    // Origin = first point of the lane.
    // =====================================================

    const originLon =
      geometryLonLat[0][0];


    const originLat =
      geometryLonLat[0][1];


    const metersPerDegreeLatitude =
      111320;


    const metersPerDegreeLongitude =
      111320 *
      Math.cos(
        originLat *
        Math.PI /
        180
      );


    this.geometryXY =
      geometryLonLat.map(
        coordinate => {

          const [
            pointLon,
            pointLat
          ] =
            coordinate;


          const x =
            (
              pointLon -
              originLon
            ) *
            metersPerDegreeLongitude;


          const y =
            (
              pointLat -
              originLat
            ) *
            metersPerDegreeLatitude;


          return [
            x,
            y
          ];

        }
      );


    // =====================================================
    // Initial XY
    // =====================================================

    const [
      x,
      y
    ] =
      this.geometryXY[0];


    this.x =
      x;


    this.y =
      y;


    // =====================================================
    // Initial vehicle heading
    // =====================================================

    if (
      this.geometryXY.length >= 2
    ) {

      const [
        x0,
        y0
      ] =
        this.geometryXY[0];


      const [
        x1,
        y1
      ] =
        this.geometryXY[1];


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


    // =====================================================
    // Closed-loop marker
    // =====================================================

    this.isClosedLoop =
      (
        graphLane?.downstream?.includes(
          this.currentLaneId
        ) ||
        graphLane?.upstream?.includes(
          this.currentLaneId
        )
      );

  }

}