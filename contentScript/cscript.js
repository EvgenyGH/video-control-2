function main() {
    const title = /https:\/\/(?<title>.*?)\/.*?/.exec(window.location).groups["title"];
    console.log(`INFO: Content script injected to <${title}>.`);

    switch (title) {
        case "amedia.online":
            amediaExec();
            break;
        case "mangavost.org":
            mangavostExecPartOne();
            break;
    }
}

function amediaExec() {
    const firstEl = document.querySelector(".playlist-episodes > a:nth-of-type(1)");
    const secondEl = document.querySelector(".playlist-episodes > a:nth-of-type(2)");

    if (secondEl) {
        if (getTitle(secondEl) === "Следующая") {
            handlePageData(firstEl, secondEl);
        } else {
            if (getTitle(firstEl) === "Предыдущая") {
                handlePageData(firstEl, null);
            } else {
                handlePageData(null, firstEl);
            }
        }
    } else {
        handlePageData(null, null);
    }
}

function handlePageData(firstEl, secondEl) {
    refreshCheck(secondEl);

    const src = document.querySelector(".players-section iframe").src;

    if (/.*\.jpg$/.test(src)) {
        showShortPanel(firstEl);
    } else {
        setMessageListener(firstEl?.href ?? null, secondEl?.href ?? null);
    }
}

function showShortPanel(firstEl) {
    createShortPan();
    insertShortPanCSS();
    addShortPanListeners(firstEl);
    scrollToPlayer();
}

function scrollToPlayer() {
    let container = document.querySelector(".players-section .box.visible");
    container.scrollIntoView();

    console.log("INFO: Player in view.");
}

function refreshCheck(secondEl) {
    const name = document.querySelector(".titlesp + a").text;
    let settings = JSON.parse(localStorage.getItem(name)) ?? { name: name, refresh: false };

    if (settings.refresh) {
        settings.refresh = false;
        localStorage.setItem(name, JSON.stringify(settings));

        console.log(`INFO: Refresh data for <${name}> saved.`);
        console.log(`INFO: Refresh. Opening next episode url=<${secondEl.href}>.`);

        window.open(secondEl.href, "_top");
    }
}
function insertShortPanCSS() {
    let style = document.createElement("style");
    document.head.appendChild(style);
    let sheet = style.sheet;

    sheet.insertRule(`#short_control_panel {
                              box-sizing: border-box;
                              position: absolute;
                              right: 6%;
                              top: 12%;
                              color: Chartreuse;
                              text-align: center;
                              line-height: 1.6;
                              display: flex;
                              gap: 2% 2%;
                              padding: 1%;
    }`);

    sheet.insertRule(`.short_refresh,
                      .short_prev_episode {
                              font-size: 100%;
                              box-sizing: border-box;
                              white-space: nowrap;
                              padding: 0% 2%;
                              border: 1px solid Chartreuse;
                              border-radius: 15%;
                              flex-wrap: nowrap;
                              justify-content: space-around;
    }`);

    sheet.insertRule(`.short_refresh:hover,
                      .short_prev_episode:hover {
                              background-color: rgba(178, 34, 34, 0.6);
                              font-weight: bold;
    }`);

    sheet.insertRule(`.short_refresh {
                              width: 6em;  
    }`);

    sheet.insertRule(`.short_prev_episode {
                              width: 10em;
    }`);

    console.log("INFO: Short CSS inserted.");
}

function addShortPanListeners(firsrEl) {
    const name = document.querySelector(".titlesp + a").text;
    let refresh = document.querySelector("#short_control_panel .short_refresh");
    let prevEpisode = document.querySelector("#short_control_panel .short_prev_episode");

    prevEpisode.addEventListener("click", e => {
        console.log(`INFO: Opening previous episod url=<${firsrEl.href}>.`);

        window.open(firsrEl.href, "_top");
    });

    refresh.addEventListener("click", e => {
        let settings = JSON.parse(localStorage.getItem(name)) ?? { name: name, refresh: true };
        settings.refresh = true;
        localStorage.setItem(name, JSON.stringify(settings));

        console.log(`INFO: Refresh data for <${name}> saved.`);

        prevEpisode.click();
    });
}

function createShortPan() {
    let container = document.querySelector(".players-section .box.visible");
    let controlPanel = document.createElement("div");
    let refresh = document.createElement("div");
    let prevEpisode = document.createElement("div");

    controlPanel.id = "short_control_panel";

    refresh.textContent = "Refresh";
    refresh.title = "Refresh";
    refresh.className = "short_refresh";

    prevEpisode.textContent = "Previous episode";
    prevEpisode.title = "Previous episode";
    prevEpisode.className = "short_prev_episode"

    controlPanel.appendChild(prevEpisode);
    controlPanel.appendChild(refresh);
    container.appendChild(controlPanel);

    console.log("INFO: Short control panel created.");
}

function getTitle(element) {
    return /^(?<title>[А-Яа-я]+)\s\d+\s[А-Яа-я]+/.exec(element.textContent)?.groups.title;
}

function setMessageListener(prev, next) {
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

function mangavostExecPartOne() {
    setupVideoControls();
    addFullscreenListener();
    disableAd();
    setupMessageExchange();
}

function mangavostExecPartTwo() {
    setupControlPanelListeners();
    playVideo();
    setTimeout(setTimerAlgorithm, 500);
}

function addFullscreenListener() {
    let fullscreenButton = document.querySelector("[id^=oframevideoplayer] > \
                                    pjsdiv:nth-child(15) > pjsdiv:nth-child(3)");

    document.querySelector("iframe + pjsdiv video").addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        fullscreenButton.click();

        console.log(`INFO: Mouse clicked the video. Fullscreen request sent`);
    }, { once: true });

    console.log("INFO: Fullscreen on any key listener set.");
}

function setupMessageExchange() {
    window.addEventListener("message", (msg) => {
        if (msg.origin.startsWith("https://amedia.online") &&
            msg.data.request === "post_video_data" &&
            msg.data?.name !== undefined) {
            console.log(`INFO: Message recieved. Request <${msg.data.request}>. Data <${JSON.stringify(msg.data)}>.`);

            let settings = localStorage.getItem(msg.data.name);

            if (settings === null) {
                let video = document.querySelector("iframe + pjsdiv video");
                settings = new Settings(msg.data.name, null, null, 0, Math.floor(video.duration), 5, false);
            } else {
                settings = JSON.parse(settings);
            }

            settings.prevEpisode = msg.data.previousEpisode;
            settings.nextEpisode = msg.data.nextEpisode;
            saveSettings(settings);
            setTitle(settings.name);
            checkRefresh(settings);

            console.log(`INFO: Recieved message computing finished.`);

            mangavostExecPartTwo();

            console.log(`INFO: Script setup finished.`);
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
    let avcContainer;
    let timer;

    avcContainer = document.createElement("div");
    avcContainer.id = "avc_container";

    controls = document.createElement("div");
    controls.className = "controls_toolbar";

    buttons["start_time"] = createTimeElement("start_time", "Start time:");
    buttons["warn_time"] = createTimeElement("warn_time", "Warn time:", "Set default");
    buttons["end_time"] = createTimeElement("end_time", "End time:");

    buttons["prevEpisode"] = createNavElement("previous_episode", "Previous episode");
    buttons["refresh"] = createNavElement("refresh", "Refresh");
    buttons["nextEpisode"] = createNavElement("next_episode", "Next episode");

    Object.values(buttons).forEach(val => {
        controls.append(val);
    });

    timer = createTimer();

    document.querySelector("iframe + pjsdiv video").parentElement.append(avcContainer);
    avcContainer.append(controls);
    avcContainer.append(timer);

    console.log(`INFO: Video controls created.`);
}

function createTimeElement(name, labelText, actionText = "Set current") {
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
    timeElement.title = parseInt(inputElement.value).toTimeFormat();

    let setCurrentElement = document.createElement("div");
    setCurrentElement.className = `set_current`;
    setCurrentElement.textContent = actionText;

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
    navElement.title = text;

    return navElement;
}

function injectCSS() {
    let style = document.createElement("style");
    document.head.appendChild(style);
    sheet = style.sheet;

    sheet.insertRule(`
        #avc_container {
            position: absolute;
            right: 1%;
            top: 1%;
            font-size: 100%;
            box-sizing: border-box;
    }`);

    sheet.insertRule(`
        .controls_toolbar {
            position: static;
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

    sheet.insertRule(`
        .timer {
            position: static;
            font-size: 500%;
            width: max-content;
            padding: 1% 2%;
            text-align: center;
            margin: 0.01em 1% 0.01em auto;
            color: white;
            background-color: black;
            opacity: 0.5;
            line-height: normal;
    }`);


    console.log("INFO: Video controls style injected.");
}

//toolbar listener set in setupVideoControls (not redifined)
function setupControlPanelListeners() {
    setupRefreshEpisodeListener();
    setupPreviousEpisodeListener();
    setupNextEpisodeListener();

    setupEpisodeTimeListeners("start");
    setupEpisodeTimeListeners("warn", 5);
    setupEpisodeTimeListeners("end");

    setupTimerListener();

    console.log("INFO: All video toolbar listeners set.");
}

function setTitle(name) {
    document.querySelector(".controls_toolbar")
        .setAttribute("title", name);
}

function setupToolbarListeners() {
    let toolbar = document.querySelector("#avc_container .controls_toolbar");
    let video = document.querySelector("iframe + pjsdiv video");

    toolbar.addEventListener("click", e => e.stopPropagation());

    video.addEventListener("play", e => {
        toolbar.style.display = "none";
    });

    video.addEventListener("pause", e => {
        toolbar.style.display = "";
    });

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

function setupEpisodeTimeListeners(name, defaultValue = null) {
    let timeElement = document.querySelector(`#${name}_time_data`);
    timeElement.value = getSettings()[`${name}Time`];
    timeElement.parentElement.title = parseInt(timeElement.value).toTimeFormat();

    console.log(`INFO: ${name.charAt(0).toUpperCase() + name.slice(1)} time set`);

    let video = document.querySelector("iframe + pjsdiv video");
    let plusElement = document.querySelector(`#${name}_time_container .plus`);
    let minusElement = document.querySelector(`#${name}_time_container .minus`);
    let setCurrentElement = document.querySelector(`#${name}_time_container .set_current`);

    plusElement.addEventListener("click", e => {
        e.preventDefault();
        let newTime = parseInt(timeElement.value) + 1;
        timeElement.value = newTime;
        timeElement.dispatchEvent(new Event("input"));
    });

    minusElement.addEventListener("click", e => {
        e.preventDefault();
        let newTime = parseInt(timeElement.value) - 1;
        timeElement.value = newTime;
        timeElement.dispatchEvent(new Event("input"));
    });

    setCurrentElement.addEventListener("click", e => {
        e.preventDefault();
        timeElement.value = defaultValue == null ? parseInt(video.currentTime) : defaultValue;
        timeElement.dispatchEvent(new Event("input"));
    });

    timeElement.addEventListener("input", e => {
        if (e.target.value < 0) {
            e.target.value = 0;
            console.log(`INFO: Invalid ${name} time value (time < 0).`);

        } else if (e.target.value > video.duration) {
            e.target.value = parseInt(video.duration);
            console.log(`INFO: Invalid ${name} time value (time > video duration).`);
        } else {
            console.log(`INFO: ${name.charAt(0).toUpperCase() + name.slice(1)} time value changed to <${timeElement.value}>.`);
        }

        timeElement.parentElement.title = parseInt(e.target.value).toTimeFormat();

        let settings = getSettings();
        settings[`${name}Time`] = Number(e.target.value);
        saveSettings(settings);

        video.dispatchEvent(new Event("timeupdate"));
    });

    console.log(`INFO: Episode ${name} time listener set.`);
}

function setupTimerListener() {
    let timer = document.querySelector("#avc_container .timer");

    timer.addEventListener("click", (e) => {
        e.stopPropagation();

        let endTimeElement = document.querySelector("#end_time_data");
        endTimeElement.value = Number(endTimeElement.value) + 10;
        endTimeElement.dispatchEvent(new Event("input"));

        let video = document.querySelector("iframe + pjsdiv video");
        video.dispatchEvent(new Event("timeupdate"));

        console.log(`INFO: Video End time timer prolonged (+10 sec.).`);
    });
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

function setTimerAlgorithm() {
    let video = document.querySelector("iframe + pjsdiv video");

    video.addEventListener("timeupdate", e => {
        let videoCurrentTime = parseInt(video.currentTime);
        let settings = getSettings();

        if (videoCurrentTime >= settings.endTime) {
            video.pause();
        } else if (videoCurrentTime < settings.startTime) {
            video.currentTime = settings.startTime;

            console.log(`INFO: Video start time set to <${video.currentTime}>.`);
        }

        setPermanetTimerAlgorithm();
    }, { once: true });

    console.log(`INFO: Temporary video progress listener set.`);
}

function setPermanetTimerAlgorithm() {
    let video = document.querySelector("iframe + pjsdiv video");

    video.addEventListener("timeupdate", e => {
        let videoCurrentTime = parseInt(video.currentTime);
        let endTime = parseInt(document.querySelector("#end_time_data").value);
        let warnTime = parseInt(document.querySelector("#warn_time_data").value);

        if (videoCurrentTime >= endTime) {
            let settings = getSettings();
            showTimer();
            updateTimer(parseInt(endTime - videoCurrentTime));

            if (settings.nextEpisode !== null) {
                if (!video.paused) {
                    console.log(`INFO: Opening url=<${settings.nextEpisode}>.`);

                    window.open(settings.nextEpisode, "_top");
                } else {
                    console.log(`INFO: Video is paused. Next episode link not opening.`);
                }
            } else {
                video.pause();

                console.log(`INFO: Video paused. No next episode.`);
            }
        } else if (videoCurrentTime >= (endTime - warnTime)) {
            showTimer();
            updateTimer(parseInt(endTime - videoCurrentTime));
        } else {
            hideTimer();
        }
    });

    console.log(`INFO: Permanet video progress listener set.`);
}

function showTimer() {
    let timer = document.querySelector("#avc_container .timer");

    if (timer.style.display === "none") {
        timer.style.display = "";

        console.log("INFO: Timer shown.");
    }
}

function hideTimer() {
    let timer = document.querySelector("#avc_container .timer");

    if (timer.style.display !== "none") {
        timer.style.display = "none";
        timer.textContent = "";

        console.log("INFO: Timer hidden.");
    }
}

function updateTimer(time) {
    document.querySelector("#avc_container .timer").textContent = time;
    console.log(`INFO: Timer updated <${time}>.`);
}

function createTimer() {
    let timer = document.createElement("div");
    timer.className = "timer";
    timer.style.display = "none";

    console.log("INFO: Timer element created.");

    return timer;
}

//Settigs pattern
function Settings(name, prevEpisode, nextEpisode, startTime, endTime, warnTime, refresh) {
    this.name = name;
    this.prevEpisode = prevEpisode;
    this.nextEpisode = nextEpisode;
    this.startTime = startTime;
    this.endTime = endTime;
    this.warnTime = warnTime;
    this.refresh = refresh;
}

function toTimeFormat() {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num % 60;

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    return hours + ':' + minutes + ':' + seconds;
}

function toSec() {
    let numbers = this.split(":");
    let seconds = parseInt(numbers[0]) * 3600 + parseInt(numbers[1]) * 60 + parseInt(numbers[2]);

    return seconds;
}

Number.prototype.toTimeFormat = toTimeFormat;

String.prototype.toSec = toSec;

main();