// =========================================================
// spatialHash.js
// =========================================================

export function createSpatialHash(
  vehicles,
  cellSizeM = 10
) {

  const grid =
    new Map();


  for (
    const vehicle
    of vehicles
  ) {

    if (
      vehicle.finished
    ) {
      continue;
    }


    const cell =
      getCellCoordinates(
        vehicle.x,
        vehicle.y,
        cellSizeM
      );


    const cellKey =
      createCellKey(
        cell.col,
        cell.row
      );


    if (
      !grid.has(
        cellKey
      )
    ) {

      grid.set(
        cellKey,
        []
      );

    }


    grid
      .get(cellKey)
      .push(vehicle);

  }


  return {
    grid,
    cellSizeM
  };

}


// =========================================================

export function getCellCoordinates(
  x,
  y,
  cellSizeM
) {

  return {

    col:
      Math.floor(
        x / cellSizeM
      ),

    row:
      Math.floor(
        y / cellSizeM
      )

  };

}


// =========================================================

export function createCellKey(
  col,
  row
) {

  return `${col},${row}`;

}

// ===========================================================
export function queryNearbyVehicles(
  spatialHash,
  x,
  y,
  radiusM
) {

  const {
    grid,
    cellSizeM
  } =
    spatialHash;


  const center =
    getCellCoordinates(
      x,
      y,
      cellSizeM
    );


  const cellRadius =
    Math.ceil(
      radiusM /
      cellSizeM
    );


  const candidates =
    [];


  for (
    let rowOffset =
      -cellRadius;

    rowOffset <=
      cellRadius;

    rowOffset++
  ) {

    for (
      let colOffset =
        -cellRadius;

      colOffset <=
        cellRadius;

      colOffset++
    ) {

      const key =
        createCellKey(

          center.col +
            colOffset,

          center.row +
            rowOffset

        );


      const cellVehicles =
        grid.get(key);


      if (
        !cellVehicles
      ) {
        continue;
      }


      candidates.push(
        ...cellVehicles
      );

    }

  }


  return candidates;

}