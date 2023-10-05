let videoData;

main();

function main() {
    const title = /https:\/\/(?<title>.*?)\/.*?/.exec(window.location).groups["title"];
    console.log(`INFO: Content script injected to <${title}>.`);

    switch (title) {
        case "amedia.online":
            amediaExec();
            break;
        case "mangavost.org":
            disableAd();
            mangavostExec();
            playVideo();
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
        if (msg.origin.startsWith("https://amedia.online") && msg.data.request === "post_video_data") {
            console.log(`INFO: Message recieved. Request <${msg.data.request}>.`);
            videoData = msg.data;
            console.log(`INFO: Data saved. Data <${JSON.stringify(videoData)}>.`);
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
    //injectCSS();
    //setupControlPanelListeners();
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

/*//todo
function injectCSS() {
    let styleElement = document.createElement("link");

    styleElement.rel = "stylesheet";
    styleElement.href = "cscript/cstyle.css";

    document.getElementsByTagName("head")[0].appendChild(styleElement);

    console.log("INFO: Video controls style injected.");
}
*/
async function setupControlPanelListeners(data) {
    //setup video events

    return timeNumbers;
}


//Settigs pattern
function Settings(prevEpisode, nexEpisode, startTime, endTime, delayTime) {
    this.prevEpisode = prevEpisode;
    this.nexEpisode = nexEpisode;
    this.startTime = startTime;
    this.endTime = endTime;
    this.delayTime = delayTime;
}
