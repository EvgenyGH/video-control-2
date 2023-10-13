main();

function main() {
    const title = /https:\/\/(?<title>.*?)\/.*?/.exec(window.location).groups["title"];
    console.log(`INFO: Content script injected to <${title}>.`);

    switch (title) {
        case "amedia.online":
            amediaExec();
            break;
        case "mangavost.org":
            mangavostExec();
            break;
    }
}

function amediaExec() {
    const firstEl = document.querySelector(".playlist-episodes > a:nth-of-type(1)");
    const secondEl = document.querySelector(".playlist-episodes > a:nth-of-type(2)");

    if (secondEl) {
        if (getTitle(secondEl) === "Следующая") {
            setPrevNextLinks(firstEl.href, secondEl.href);
        } else {
            if (getTitle(firstEl) === "Предыдущая") {
                setPrevNextLinks(firstEl.href, null);
            } else {
                setPrevNextLinks(null, firstEl.href);
            }
        }
    } else {
        setPrevNextLinks(null, null);
    }

}

function getTitle(element) {
    return /^(?<title>[А-Яа-я]+)\s\d+\s[А-Яа-я]+/.exec(element.textContent)?.groups.title;
}

function setPrevNextLinks(prev, next) {
    window.addEventListener("message", (msg) => {
        if (msg.origin.startsWith("https://mangavost.org") && msg.data.request === "get_video_data") {
            console.log(`INFO: Message recieved. Request <${msg.data.request}>.`);
            const name = document.querySelector(".titlesp + a").text;
            msg.source.postMessage({
                request: "post_video_data",
                name: name,
                previousEpisode: prev,
                nextEpisode: next
            },
                msg.origin);

            console.log(`INFO: Message sent to <${msg.origin}>. Data <${JSON.stringify(msg.data)}>.`);
        }
    });

    console.log(`INFO: Listener set.`);
}

function mangavostExec() {
    disableAd();
    setupMessageExchange();
    setupVideoControls();
    playVideo();
}

function setupMessageExchange() {
    window.addEventListener("message", (msg) => {
        if (msg.origin.startsWith("https://amedia.online") &&
            msg.data.request === "post_video_data" &&
            msg.data?.name !== undefined) {
            console.log(`INFO: Message recieved. Request <${msg.data.request}>. Data <${JSON.stringify(msg.data)}>.`);

            let settings = localStorage.getItem(msg.data.name);

            if (settings === null) {
                settings = new Settings(msg.data.name, null, null, 0, 0, 5, false);
            } else {
                settings = JSON.parse(settings);
            }

            settings.prevEpisode = msg.data.previousEpisode;
            settings.nextEpisode = msg.data.nextEpisode;
            saveSettings(settings);
            setTitle(settings.name);
            checkRefresh(settings);
            setupControlPanelListeners();

            console.log(`INFO: Control panel listeners set.`);
        }
    });

    console.log(`INFO: Listener set.`);

    window.parent.postMessage({ request: "get_video_data" }, "https://amedia.online/*");

    console.log(`INFO: Message sent. Request <get_video_data>.`);
}

async function disableAd() {
    document.querySelector("#video_ad").remove();
    console.log("INFO: AD disabled.");
}

async function playVideo() {
    let autoplay = navigator.getAutoplayPolicy("mediaelement");
    let video = document.querySelector("iframe + pjsdiv video");

    if (["allowed-muted", "allowed"].includes(autoplay)) {
        if (autoplay === "allowed-muted") {
            video.volume = 0;
            console.log("INFO: Autoplay video allowed muted.");
        }

        video.scrollIntoView();
        video.play();

        console.log("INFO: Video.play().");
    } else {
        console.log("INFO: Autoplay failed. Please change Autoplay policy.");
    }
}

function setupVideoControls() {
    createVideoControls();
    injectCSS();
    setupToolbarListeners();
}

function createVideoControls() {
    let buttons = {};
    let controls;

    controls = document.createElement("div");
    controls.className = "controls_toolbar";

    buttons["start_time"] = createTimeElement("start_time", "Start time:");
    buttons["warn_time"] = createTimeElement("warn_time", "Warn time:");
    buttons["end_time"] = createTimeElement("end_time", "End time:");

    buttons["prevEpisode"] = createNavElement("previous_episode", "Previous episode");
    buttons["refresh"] = createNavElement("refresh", "Refresh");
    buttons["nextEpisode"] = createNavElement("next_episode", "Next episode");

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

function createNavElement(id, text) {
    let navElement = document.createElement("div");

    navElement.textContent = text;
    navElement.id = id;
    navElement.className = "navigation_button";

    return navElement;
}

function injectCSS() {
    let style = document.createElement("style");
    document.head.appendChild(style);
    sheet = style.sheet;

    sheet.insertRule(`
        .controls_toolbar {
            position: absolute;
            right: 2%;
            top: 2%;
            font-size: 100%;
            color: Chartreuse;
            box-sizing: border-box;
            width: 50vw;
            padding: 0.5%;
            display: grid;
            grid: ". . .";
            grid-auto-columns: 32%;
            justify-content: space-around;
            grid-row-gap: 0.25em;
            min-width: 35em;
        }`);

    sheet.insertRule(`
        .navigation_button,
        .time_container {
            position: relative;
            border: 1px solid Chartreuse;
            border-radius: 15%;
            text-align: center;
            line-height: 1.6;
        }`);

    sheet.insertRule(`
        .navigation_button:hover,
        .time_container:hover {
            background-color: rgba(178, 34, 34, 0.6);
            font-weight: bold;
        }`);

    sheet.insertRule(`
        .controls_toolbar input[type = "number"] {
            color: Chartreuse;
            background-color: transparent;
            border: thin dotted Chartreuse;
            appearance: textfield;
            font-size: 90%;
            height: 1.5em;
            box-sizing: border-box;
            width: 4em;
            margin: auto;
        }`);

    sheet.insertRule(`
        .time_container {
            display: grid;
            grid: ". std std" ". . .";
            justify-content: center;
            padding: 4%;
        }`);

    sheet.insertRule(`
        #start_time_data,
        #warn_time_data,
        #end_time_data {
            grid-area: std;
        }`);

    sheet.insertRule(`
        .plus:hover,
        .minus:hover,
        .set_current:hover,
        .controls_toolbar input[type = "number"]:hover {
            border: thin dotted black;
        }`);

    sheet.insertRule(`
        .plus,
        .minus {
            margin-left: 0.5em;
            width: 1.5em;
        }`);

    sheet.insertRule(`
        .plus,
        .minus,
        .set_current {
            border: thin dotted transparent;
        }`);

    console.log("INFO: Video controls style injected.");
}

//toolbar listener set in setupVideoControls (not redifined)
function setupControlPanelListeners() {
    setupRefreshEpisodeListener();
    setupPreviousEpisodeListener();
    setupNextEpisodeListener();

    setupEpisodeStartTimeListeners();
    setupEpisodeEndTimeListeners();
    setupEpisodeWarnTimeListeners();

    console.log("INFO: All video toolbar listeners set.");
}

function setTitle(name) {
    document.querySelector(".controls_toolbar")
        .setAttribute("title", name);
}

function setupToolbarListeners() {
    document.querySelector(".controls_toolbar")
        .addEventListener("click", e =>
            e.stopPropagation()
        );

    console.log("INFO: Controls toolbar listener set.");
}

function checkRefresh(settings) {
    if (settings.refresh) {
        settings.refresh = false;
        saveSettings(settings);

        if (settings.nextEpisode !== null) {
            console.log(`INFO: Opening url=<${settings.nextEpisode}>.`);
            window.open(settings.nextEpisode, "_top");
        } else {
            console.log(`INFO: No next Episode.`);
        }
    }
}

function setupRefreshEpisodeListener() {
    document.querySelector("#refresh")
        .addEventListener("click", e => {
            let settings = getSettings();
            settings.refresh = true;
            saveSettings(settings);

            if (settings.prevEpisode !== null) {
                console.log(`Opening url=<${settings.prevEpisode}>.`);

                window.open(settings.prevEpisode, "_top");
            } else {
                console.log(`INFO: No previous episode.`);

                let element = document.querySelector("#refresh");
                setTimeout(title => element.textContent = title, 2000, element.textContent);
                element.textContent = "IT`S FIRST EPISODE";
            }
        });

    console.log("INFO: Refresh listener set.");
}

function setupPreviousEpisodeListener() {
    document.querySelector("#previous_episode")
        .addEventListener("click", e => {
            let settings = getSettings();

            if (settings.prevEpisode !== null) {
                console.log(`Opening url=<${settings.prevEpisode}>.`);

                window.open(settings.prevEpisode, "_top");
            } else {
                console.log(`INFO: No previous episode.`);

                let element = document.querySelector("#previous_episode");
                setTimeout(title => element.textContent = title, 2000, element.textContent);
                element.textContent = "NO EPISODE";
            }
        });

    console.log("INFO: Previous episode listener set.");
}

function setupNextEpisodeListener() {
    document.querySelector("#next_episode")
        .addEventListener("click", e => {
            let settings = getSettings();

            if (settings.nextEpisode !== null) {
                console.log(`Opening url=<${settings.nextEpisode}>.`);

                window.open(settings.nextEpisode, "_top");
            } else {
                console.log(`INFO: No next episode.`);
                let element = document.querySelector("#next_episode");
                setTimeout(title => element.textContent = title, 2000, element.textContent);
                element.textContent = "NO EPISODE";
            }
        });

    console.log("INFO: Next episode listener set.");
}

function setupEpisodeStartTimeListeners() {
    let startTimeElement = document.querySelector("#start_time_data");
    startTimeElement.value = getSettings().startTime;

    console.log("INFO: Start time set");

    let video = document.querySelector("video");
    let plusElement = document.querySelector("#start_time_container .plus");
    let minusElement = document.querySelector("#start_time_container .minus");
    let setCurrentElement = document.querySelector("#start_time_container .set_current");

    plusElement.addEventListener("click", e => {
        e.preventDefault();
        let newTime = parseInt(startTimeElement.value) + 1;
        startTimeElement.value = newTime;
        startTimeElement.dispatchEvent(new Event("input"));
    });

    minusElement.addEventListener("click", e => {
        e.preventDefault();
        let newTime = parseInt(startTimeElement.value) - 1;
        startTimeElement.value = newTime;
        startTimeElement.dispatchEvent(new Event("input"));
    });

    setCurrentElement.addEventListener("click", e => {
        e.preventDefault();
        startTimeElement.value = parseInt(video.currentTime);
        startTimeElement.dispatchEvent(new Event("input"));
    });

    startTimeElement.addEventListener("input", e => {
        if (e.target.value < 0) {
            e.target.value = 0;
            console.log(`INFO: Invalid start time value (time < 0).`);
        } else if (e.target.value > video.duration) {
            e.target.value = parseInt(video.duration);
            console.log(`INFO: Invalid start time value (time > video duration).`);
        } else {
            console.log(`INFO: Start time value changed to <${startTimeElement.value}>.`);
            let settings = getSettings();
            settings.startTime = Number(e.target.value);
            saveSettings(settings);
        }
    });

    console.log("INFO: Episode start time listener set.");
}

function setupEpisodeEndTimeListeners() {

}

function setupEpisodeWarnTimeListeners() {

}

function getSettings() {
    let name = document.querySelector(".controls_toolbar").title;
    let settings = localStorage.getItem(name);

    if (settings === null) {
        settings = new Settings(name, null, null, 0, 0, 5, false);
    } else {
        settings = JSON.parse(settings);
    }

    console.log(`INFO: Settings recieved for <${name}>.`);

    return settings;
}

function saveSettings(settings) {
    localStorage.setItem(settings.name, JSON.stringify(settings));
    console.log(`INFO: Data saved. Data <${JSON.stringify(settings)}>.`);
}

//Settigs pattern
function Settings(name, prevEpisode, nextEpisode, startTime, endTime, delayTime, refresh) {
    this.name = name;
    this.prevEpisode = prevEpisode;
    this.nextEpisode = nextEpisode;
    this.startTime = startTime;
    this.endTime = endTime;
    this.delayTime = delayTime;
    this.refresh = refresh;
}