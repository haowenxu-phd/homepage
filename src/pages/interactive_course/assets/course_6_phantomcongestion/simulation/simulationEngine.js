import {
  buildLaneIndex
} from "./laneIndex";


import {
  createSpatialHash,
  queryNearbyVehicles
} from "./spatialHash";


import {
  findLeaderOnCurrentLane
} from "./leaderDetection";


import {
  getVehicleHeading,
  senseVehiclesAhead
} from "./perception";


import {
  moveVehicle
} from "./laneMovement";

export function stepSimulation({
  vehicles,
  routingGraph,
  dt
}) {

  // ==============================================
  // Shared indices
  // ==============================================

  const laneIndex =
    buildLaneIndex(
      vehicles
    );


  const spatialHash =
    createSpatialHash(
      vehicles,
      10
    );


  // ==============================================
  // Update vehicles
  // ==============================================

  const updatedVehicles =
    vehicles.map(
      vehicle => {

        const updated = {
          ...vehicle
        };


        // ------------------------------------------
        // Traffic leader
        // ------------------------------------------

        const leader =
          findLeaderOnCurrentLane(
            updated,
            laneIndex
          );


        // ------------------------------------------
        // Spatial perception
        // ------------------------------------------

        const nearby =
          queryNearbyVehicles(
            spatialHash,
            updated.x,
            updated.y,
            50
          );


        const heading =
          getVehicleHeading(
            updated,
            routingGraph
          );


        const visible =
          senseVehiclesAhead({

            egoVehicle:
              updated,

            nearbyVehicles:
              nearby,

            heading,

            sensingDistanceM:
              50,

            sensingWidthM:
              6

          });


        // Temporary debugging information

        updated.leaderId =
          leader
            ?.vehicle
            ?.id
          ?? null;


        updated.gapM =
          leader
            ?.gapM
          ?? Infinity;


        updated.visibleVehicleIds =
          visible.map(
            item =>
              item.vehicle.id
          );


        // ------------------------------------------
        // Movement
        // ------------------------------------------

        moveVehicle(
          updated,
          routingGraph,
          dt
        );


        return updated;

      }
    );


  // ==============================================
  // Remove completed vehicles
  // ==============================================

  return updatedVehicles.filter(
    vehicle =>
      !vehicle.finished
  );

}