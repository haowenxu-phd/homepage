// =========================================================
// Traffic signal timing
// =========================================================
//
// Determines traffic signal state from simulation time.
//
// IMPORTANT:
//
// Signal timing uses SIMULATION TIME,
// not browser / wall-clock time.
//
// This ensures:
//
// - pause / resume works correctly
// - simulation speed can be changed
// - signals remain synchronized with vehicles
//
// =========================================================


export function getTrafficSignalState(
  signal,
  simulationTimeS
) {

  const greenS =
    signal.greenDurationS;

  const yellowS =
    signal.yellowDurationS;

  const redS =
    signal.redDurationS;


  const cycleLengthS =
    greenS +
    yellowS +
    redS;


  if (
    cycleLengthS <= 0
  ) {

    return "red";

  }


  const timeInCycle =
    (
      simulationTimeS +
      signal.offsetS
    ) %
    cycleLengthS;


  // -------------------------------------------------------
  // GREEN
  // -------------------------------------------------------

  if (
    timeInCycle <
    greenS
  ) {

    return "green";

  }


  // -------------------------------------------------------
  // YELLOW
  // -------------------------------------------------------

  if (
    timeInCycle <
    greenS +
    yellowS
  ) {

    return "yellow";

  }


  // -------------------------------------------------------
  // RED
  // -------------------------------------------------------

  return "red";

}