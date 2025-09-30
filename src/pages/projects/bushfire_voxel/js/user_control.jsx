// DOM-based controls (keeps your original getElementById approach)

export function connectFramesUI(frames, onFrameChange) {
  const slider  = document.getElementById("timeSlider");
  const label   = document.getElementById("tl");
  const playBtn = document.getElementById("play");

  if (!slider || !label || !playBtn) {
    console.warn("[connectFramesUI] Missing HUD elements (timeSlider/tl/play).");
    return () => {}; // no-op disposer
  }

  // Extract timesteps and configure slider
  const timesteps = Object.keys(frames).map(Number).sort((a, b) => a - b);
  if (timesteps.length === 0) {
    console.warn("[connectFramesUI] No timesteps.");
    return () => {};
  }

  slider.min = timesteps[0];
  slider.max = timesteps[timesteps.length - 1];
  slider.value = timesteps[0];
  label.textContent = String(timesteps[0]);

  // Update helper
  function updateFrame(t) {
    const frame = frames[t] || [];
    label.textContent = String(t);
    onFrameChange(t, frame);
  }

  // Listeners (with handles for cleanup)
  const onSliderInput = () => {
    const t = parseInt(slider.value, 10);
    updateFrame(t);
  };
  slider.addEventListener("input", onSliderInput);

  let playing = false;
  let intervalId = null;
  const intervalStepMs = 100; // original comment said 100ms

  const onPlayClick = () => {
    if (!playing) {
      playing = true;
      playBtn.textContent = "⏸";
      intervalId = setInterval(() => {
        let t = parseInt(slider.value, 10);
        const min = parseInt(slider.min, 10);
        const max = parseInt(slider.max, 10);
        t = t >= max ? min : t + 1;
        slider.value = String(t);
        updateFrame(t);
      }, intervalStepMs);
    } else {
      playing = false;
      playBtn.textContent = "▶";
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  playBtn.addEventListener("click", onPlayClick);

  // Initialize first frame
  updateFrame(parseInt(slider.value, 10));

  // Return a disposer to prevent duplicate listeners if called again
  return function disposeConnectFramesUI() {
    slider.removeEventListener("input", onSliderInput);
    playBtn.removeEventListener("click", onPlayClick);
    if (intervalId) clearInterval(intervalId);
  };
}

// Keep this alongside; other modules call it.
export function upsertPairsInPlace(arr1, arr2) {
  const index = new Map();
  for (let i = 0; i < arr1.length; i++) {
    const key = arr1[i][0];
    if (!index.has(key)) index.set(key, i);
  }
  for (const [a, b] of arr2) {
    if (index.has(a)) {
      arr1[index.get(a)] = [a, b];
    } else {
      index.set(a, arr1.length);
      arr1.push([a, b]);
    }
  }
  return arr1;
}

// (Optional) default export if you prefer `import connectFramesUI from ...`
// export default connectFramesUI;
