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

    setupVideoControls();
}

function setupVideoControls() {

    // todo

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

//Settigs pattern
function Settings(prevEpisode, nexEpisode, startTime, endTime, delayTime) {
    this.prevEpisode = prevEpisode;
    this.nexEpisode = nexEpisode;
    this.startTime = startTime;
    this.endTime = endTime;
    this.delayTime = delayTime;
}
