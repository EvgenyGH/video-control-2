

async function setupListeners(data) {
    let buttons = data[0];
    let timeNumbers = data[1];

    buttons["startTime"].addEventListener("click", event => {
        event.stopPropagation();
    });
    timeNumbers["startTime"].addEventListener("click", event => {
        event.stopPropagation();
    });

    buttons["warnTime"].addEventListener("click", event => {
        event.stopPropagation();
    });
    timeNumbers["warnTime"].addEventListener("click", event => {
        event.stopPropagation();
    });
    buttons["endTime"].addEventListener("click", event => {
        event.stopPropagation();
    });
    timeNumbers["endTime"].addEventListener("click", event => {
        event.stopPropagation();
    });

    buttons["prevEpisode"].addEventListener("click", event => {
        event.stopPropagation();
    });
    buttons["refresh"].addEventListener("click", event => {
        event.stopPropagation();
    });

    buttons["nextEpisode"].addEventListener("click", event => {
        windiw.postMessage("https://amedia.online");
        event.stopPropagation();
    });


    //setup video events

    return timeNumbers;
}




async function createVideoControls() {
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

    setupCSS(controls, buttons);

    console.log(`INFO: Video controls ready.`);

    return [buttons, timeNumbers];
}

function setupCSS(controls, buttons) {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .controls_toolbar {
          position: absolute;
          right: 1%;
          top: 1%;
          font-size: 100%;
          border: thick double #32a1ce;
          border-radius: 15%;
          color: Chartreuse;
          box-sizing: border-box;
          width: 65%;
          padding: 0.5%;
          display: grid;
          grid: ". . .";
          grid-auto-columns: 31%;
          grid-column-gap: 3%;
          grid-row-gap: 10%;
        }

        .controls_button {
          position: relative;
          border: 1px solid LightGoldenRodYellow;
          border-radius: 15%;
          text-align: center;
        }

        .controls_button:hover {
          background-color: rgba(201, 76, 76, 0.3);
          font-weight: bold;
        }

        input[type="number"] {
          color: Chartreuse;
          background-color: transparent;
          border-style: none;
          appearance: textfield;
          font-size: 90%;
          height: 1.5em;
          box-sizing: border-box;
        }

        div[id$="time_div"]:hover input[type="number"] {
          appearance: auto;
          border: 1px dotted LightGoldenRodYellow;
        }

        #start_time,
        #end_time {
          width: 4em;
        }

        #warn_time {
          width: 3em;
        }
        `;

    document.getElementsByTagName("head")[0].appendChild(style);

    console.log("INFO: Video controls style set.");
}
