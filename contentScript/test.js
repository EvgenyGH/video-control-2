createVideoControls();

function createVideoControls() {
    let buttons = {};
    let timeNumbers = {};
    let label;
    let controls;

    controls = document.createElement("div");
    controls.className = "controls_toolbar";

    buttons["start_time"] = createTimeElement("start_time", "Start time:");
    //controls.append(buttons["start_time"]);
    buttons["warn_time"] = createTimeElement("warn_time", "Warn time:");
    //controls.append(buttons["warn_time"]);
    buttons["end_time"] = createTimeElement("end_time", "End time:");
    //controls.append(buttons["end_time"]);

    //here
    buttons["prevEpisode"] = document.createElement("div");
    buttons["prevEpisode"].textContent = "Previous episode";
    buttons["prevEpisode"].id = "Previous_episode";
    buttons["prevEpisode"].className = "control_button";

    buttons["refresh"] = document.createElement("div");
    buttons["refresh"].textContent = "Refresh";
    buttons["refresh"].id = "Refresh";
    buttons["refresh"].className = "control_button";

    buttons["nextEpisode"] = document.createElement("div");
    buttons["nextEpisode"].textContent = "Next episode";
    buttons["nextEpisode"].id = "Next_episode";
    buttons["nextEpisode"].className = "control_button";

    Object.values(buttons).forEach(val => {
        controls.append(val);
    });

    document.querySelector("video").parentElement.append(controls);

    console.log(`INFO: Video controls created.`);
}

function createTimeElement(name, labelText) {
    let timeElement = document.createElement("div");
    timeElement.id = `${name}_container`;
    timeElement.className = "time_container";

    let label = document.createElement("label");
    label.setAttribute('for', `${name}_data`);
    label.textContent = labelText;

    let inputElement = document.createElement("input");
    inputElement.setAttribute('id', `${name}_data`);
    inputElement.setAttribute('type', 'number');
    inputElement.setAttribute('value', '0');

    let setCurrentElement = document.createElement("div");
    setCurrentElement.className = `set_current`;
    setCurrentElement.textContent = "Set current";

    let plusElement = document.createElement("div");
    plusElement.className = `plus`;
    plusElement.textContent = "+";

    let minusElement = document.createElement("div");
    minusElement.className = `minus`;
    minusElement.textContent = "-";

    timeElement.append(label);
    timeElement.append(inputElement);
    timeElement.append(setCurrentElement);
    timeElement.append(plusElement);
    timeElement.append(minusElement);

    return timeElement;
}

function createNavElement() {

}