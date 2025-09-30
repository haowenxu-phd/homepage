 /*
  // dropdown option lists
  const IGN_OPTIONS  = ["238_109_30"];
  const DIR_OPTIONS  = ["0.0","45.0","90.0","135.0","180.0","225.0","270.0"];
  // (you asked for this exact list, including the repeated 15.0)
  const SPD_OPTIONS  = ["0.0","5.0","10.0","15.0","25.0","15.0"];

  // helper to fill a <select>
  function fillSelect(id, opts, selected = null) {
    const el = document.getElementById(id);
    el.innerHTML = opts.map(v => 
      `<option value="${v}" ${selected===v ? 'selected' : ''}>${v}</option>`
    ).join("");
  }

  // call once on page load
  fillSelect("ign_loc",  IGN_OPTIONS,  IGN_OPTIONS[0]);
  fillSelect("wind_dir", DIR_OPTIONS,  DIR_OPTIONS[0]);
  fillSelect("wind_spd", SPD_OPTIONS,  SPD_OPTIONS[0]);

  // build scenario folder from current UI values
  function buildScenarioSelection() {
    const ign = document.getElementById("ign_loc").value;
    const dir = document.getElementById("wind_dir").value;
    const spd = document.getElementById("wind_spd").value;
    //  ign/ wd<dir> _sp<spd> _n50_c10.0_gs120.0_sd6
    return `${ign}/wd${dir}_sp${spd}_n50_c10.0_gs120.0_sd6`;
  }

  // rebuild CSV/Wind URLs from current UI
  function buildScenarioUrls(hbTag = "hb2100") {
    const scenario_selection = buildScenarioSelection();
    return {
      csv:  `./outputs/scenarios/${scenario_selection}/voxel_fire_spread_${hbTag}.csv`,
      wind: `./outputs/scenarios/${scenario_selection}/wind_field.png`,
      scenario_selection
    };
  }
 */
