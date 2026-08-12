export function getVehicleHeading(
  vehicle,
  routingGraph
) {

  const lane =
    routingGraph.lanes[
      vehicle.currentLaneId
    ];


  const i =
    vehicle.segmentIndex;


  const p1 =
    lane.geometry_xy[i];

  const p2 =
    lane.geometry_xy[
      i + 1
    ];


  if (
    !p1 ||
    !p2
  ) {
    return 0;
  }


  return Math.atan2(
    p2[1] - p1[1],
    p2[0] - p1[0]
  );

}

// =====================================================

export function getRelativePosition(
  ego,
  target,
  heading
) {

  const dx =
    target.x -
    ego.x;

  const dy =
    target.y -
    ego.y;


  const cos =
    Math.cos(
      heading
    );

  const sin =
    Math.sin(
      heading
    );


  const forward =
    dx * cos +
    dy * sin;


  const lateral =
    -dx * sin +
    dy * cos;


  return {
    forward,
    lateral
  };

}

// ===============================================

export function senseVehiclesAhead({
  egoVehicle,
  nearbyVehicles,
  heading,
  sensingDistanceM = 50,
  sensingWidthM = 4
}) {

  const detected =
    [];


  for (
    const target
    of nearbyVehicles
  ) {

    if (
      target.id ===
      egoVehicle.id
    ) {
      continue;
    }


    const {
      forward,
      lateral
    } =
      getRelativePosition(
        egoVehicle,
        target,
        heading
      );


    if (
      forward > 0 &&
      forward <=
        sensingDistanceM &&
      Math.abs(
        lateral
      ) <=
        sensingWidthM / 2
    ) {

      detected.push({

        vehicle:
          target,

        forwardDistanceM:
          forward,

        lateralDistanceM:
          lateral

      });

    }

  }


  detected.sort(
    (a, b) =>
      a.forwardDistanceM -
      b.forwardDistanceM
  );


  return detected;

}