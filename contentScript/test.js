createVideoControls();

function createVideoControls() {
    let buttons = {};
    let timeNumbers = {};
    let label;
    let controls;

    controls = document.createElement("div");
    controls.className = "controls_toolbar";

    buttons["startTime"] = document.createElement("div");
    buttons["startTime"].id = "start_time_div";

    label = document.createElement("label");
    label.setAttribute('for', "start_data");
    label.textContent = "Start time:";

    timeNumbers["startTime"] = document.createElement("input");
    timeNumbers["startTime"].setAttribute('id', 'start_time');

    buttons["startTime"].append(label);
    buttons["startTime"].append(timeNumbers["startTime"]);

    buttons["warnTime"] = document.createElement("div");
    buttons["warnTime"].id = "Warn_time_div";

    label = document.createElement("label");
    label.setAttribute('for', "warn_time");
    label.textContent = "Warn time:";

    timeNumbers["warnTime"] = document.createElement("input");
    timeNumbers["warnTime"].setAttribute('id', 'warn_time');

    buttons["warnTime"].append(label);
    buttons["warnTime"].append(timeNumbers["warnTime"]);

    buttons["endTime"] = document.createElement("div");
    buttons["endTime"].id = "End_time_div";

    label = document.createElement("label");
    label.setAttribute('for', "end_time");
    label.textContent = "End time:";

    timeNumbers["endTime"] = document.createElement("input");
    timeNumbers["endTime"].setAttribute('id', 'end_time');

    buttons["endTime"].append(label);
    buttons["endTime"].append(timeNumbers["endTime"]);

    buttons["prevEpisode"] = document.createElement("div");
    buttons["prevEpisode"].textContent = "Previous episode";
    buttons["prevEpisode"].id = "Previous_episode";

    buttons["refresh"] = document.createElement("div");
    buttons["refresh"].textContent = "Refresh";
    buttons["refresh"].id = "Refresh";

    buttons["nextEpisode"] = document.createElement("div");
    buttons["nextEpisode"].textContent = "Next episode";
    buttons["nextEpisode"].id = "Next_episode";

    Object.values(buttons).forEach(val => {
        val.className = "controls_button";
        controls.append(val);
    });

    Object.values(timeNumbers).forEach(val => {
        val.setAttribute('type', 'number');
        val.setAttribute('min', '0');
        val.setAttribute('value', '0');
    });

    document.querySelector("video").parentElement.append(controls);

    console.log(`INFO: Video controls created.`);

    //injectCSS();

   // console.log(`INFO: Video controls ready.`);

    return [buttons, timeNumbers];
}