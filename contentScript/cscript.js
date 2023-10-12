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
            console.log(`INFO: Message recieved. Request <${msg.data.request}>.`);

            let settings = localStorage.getItem(msg.data.name) ?? new Settings(null, null, 0, 0, 5, false);

            settings.prevEpisode = msg.data.previousEpisode;
            settings.nexEpisode = msg.data.nextEpisode;
            settings.name = msg.data.name;

            localStorage.setItem(settings.name, settings);

            console.log(`INFO: Data saved. Data <${JSON.stringify(msg.data)}>.`);

            setTitle(settings.name);

            checkRefresh(settings);

            setupControlPanelListeners(settings);

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
    setupToolbarListener();
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
function setupControlPanelListeners(settings) {
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
        localStorage.setItem(settings.name, settings);

        console.log(`INFO: Settings saved.`);

        if (settings.nexEpisode !== null) {
            console.log(`INFO: Opening url=<${settings.nexEpisode}>.`);
            window.open(settings.nexEpisode, "_top");
        } else {
            console.log(`INFO: No next Episode.`);
        }  
    }
}

function setupRefreshEpisodeListener() {
    document.querySelector("#refresh")
        .addEventListener("click", e => {
            let name = document.querySelector(".controls_toolbar").title;
            let settings = localStorage.getItem(name);

            settings.refresh = true;
            localStorage.setItem(name, settings);

            console.log(`INFO: Settings saved.`);

            if (settings.prevEpisode !== null) {
                console.log(`Opening url=<${settings.prevEpisode}>.`);

                window.open(settings.prevEpisode, "_top");
            } else {
                console.log(`INFO: No previous episode.`);
            }
        });
}

function setupPreviousEpisodeListener() {
    document.querySelector("#previous_episode")
        .addEventListener("click", e => {
            let name = document.querySelector(".controls_toolbar").title;
            let settings = localStorage.getItem(name);

            console.log(`INFO: Settings recieved for <${name}>.`);

            if (settings.prevEpisode !== null) {
                console.log(`Opening url=<${settings.prevEpisode}>.`);

                window.open(settings.prevEpisode, "_top");
            } else {
                console.log(`INFO: No previous episode.`);
            }
        });
}

function setupNextEpisodeListener() {
    document.querySelector("#next_episode")
        .addEventListener("click", e => {
            let name = document.querySelector(".controls_toolbar").title;
            let settings = localStorage.getItem(name);

            console.log(`INFO: Settings recieved for <${name}>.`);

            if (settings.nextEpisode !== null) {
                console.log(`Opening url=<${settings.nextEpisode}>.`);

                window.open(settings.nextEpisode, "_top");
            } else {
                console.log(`INFO: No next episode.`);
            }
        });
}

function setupEpisodeStartTimeListeners() {

}

function setupEpisodeEndTimeListeners() {

}

function setupEpisodeWarnTimeListeners() {

}


//Settigs pattern
function Settings(name, prevEpisode, nexEpisode, startTime, endTime, delayTime, refresh) {
    this.name = name;
    this.prevEpisode = prevEpisode;
    this.nexEpisode = nexEpisode;
    this.startTime = startTime;
    this.endTime = endTime;
    this.delayTime = delayTime;
    this.refresh = refresh;
}
