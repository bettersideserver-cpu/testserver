/*
    BETTERSIDE ANALYTICS DEMO
*/


// --------------------------------------------------
// GET URL PARAMETERS
// --------------------------------------------------

const params = new URLSearchParams(window.location.search);


// --------------------------------------------------
// CREATE / GET VISITOR ID
// --------------------------------------------------

let visitorId = localStorage.getItem("betterside_visitor_id");

if (!visitorId) {

    visitorId =
        crypto.randomUUID();

    localStorage.setItem(
        "betterside_visitor_id",
        visitorId
    );
}


// --------------------------------------------------
// CREATE / GET SESSION ID
// --------------------------------------------------

let sessionId = sessionStorage.getItem(
    "betterside_session_id"
);

if (!sessionId) {

    sessionId =
        crypto.randomUUID();

    sessionStorage.setItem(
        "betterside_session_id",
        sessionId
    );
}


// --------------------------------------------------
// DETECT SOURCE
// --------------------------------------------------

const source =
    params.get("utm_source")
    || document.referrer
    || "direct";

const medium =
    params.get("utm_medium")
    || "none";

const campaign =
    params.get("utm_campaign")
    || "none";


// --------------------------------------------------
// DEVICE
// --------------------------------------------------

function getDevice() {

    const width =
        window.innerWidth;

    if (width < 768)
        return "Mobile";

    if (width < 1024)
        return "Tablet";

    return "Desktop";
}


// --------------------------------------------------
// BASIC VISITOR DATA
// --------------------------------------------------

const visitorData = {

    visitorId,

    sessionId,

    timestamp:
        new Date().toISOString(),

    source,

    medium,

    campaign,

    referrer:
        document.referrer || "Direct",

    page:
        window.location.pathname,

    device:
        getDevice(),

    browser:
        navigator.userAgent

};


// --------------------------------------------------
// STORE EVENT LOCALLY
// --------------------------------------------------

function saveEvent(event) {

    let events =
        JSON.parse(
            localStorage.getItem(
                "betterside_events"
            )
        ) || [];

    events.push(event);

    localStorage.setItem(
        "betterside_events",
        JSON.stringify(events)
    );
}


// --------------------------------------------------
// TRACK EVENT
// --------------------------------------------------

function trackEvent(
    eventName,
    properties = {}
) {

    const event = {

        ...visitorData,

        event:
            eventName,

        properties

    };

    saveEvent(event);

    console.log(
        "BetterSide Event:",
        event
    );
}


// --------------------------------------------------
// INITIAL PAGE VIEW
// --------------------------------------------------

trackEvent(
    "page_view"
);


// --------------------------------------------------
// PROJECT
// --------------------------------------------------

function openProject(project) {

    trackEvent(
        "project_opened",
        {
            project
        }
    );

    alert(
        `${project} opened`
    );
}


// --------------------------------------------------
// FLOOR
// --------------------------------------------------

function selectFloor(floor) {

    trackEvent(
        "floor_selected",
        {
            project:
                "MDB Lutyens",

            floor
        }
    );

    alert(
        `Floor ${floor} selected`
    );
}


// --------------------------------------------------
// UNIT
// --------------------------------------------------

function selectUnit(unit) {

    trackEvent(
        "unit_selected",
        {
            project:
                "MDB Lutyens",

            floor:
                "5",

            unit
        }
    );

    alert(
        `Unit ${unit} selected`
    );
}