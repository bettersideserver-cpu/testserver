// ================================
// SUPABASE CONFIG
// ================================

const SUPABASE_URL =
    "https://tmjjjhbrvgafxovqawsw.supabase.co";

const SUPABASE_KEY =
    "https://tmjjjhbrvgafxovqawsw.supabase.co/rest/v1/visitor_events";


// ================================
// VISITOR ID
// ================================

let visitorId =
    localStorage.getItem("betterside_visitor_id");

if (!visitorId) {

    visitorId = crypto.randomUUID();

    localStorage.setItem(
        "betterside_visitor_id",
        visitorId
    );
}


// ================================
// SESSION ID
// ================================

let sessionId =
    sessionStorage.getItem(
        "betterside_session_id"
    );

if (!sessionId) {

    sessionId = crypto.randomUUID();

    sessionStorage.setItem(
        "betterside_session_id",
        sessionId
    );
}


// ================================
// UTM DATA
// ================================

const params =
    new URLSearchParams(
        window.location.search
    );

const source =
    params.get("utm_source") ||
    "direct";

const medium =
    params.get("utm_medium") ||
    "none";

const campaign =
    params.get("utm_campaign") ||
    "none";


// ================================
// DEVICE
// ================================

function getDevice() {

    const width =
        window.innerWidth;

    if (width < 768)
        return "Mobile";

    if (width < 1024)
        return "Tablet";

    return "Desktop";
}


// ================================
// SEND EVENT TO SUPABASE
// ================================

async function trackEvent(
    eventName,
    properties = {}
) {

    const data = {

        visitor_id:
            visitorId,

        session_id:
            sessionId,

        source:
            source,

        medium:
            medium,

        campaign:
            campaign,

        referrer:
            document.referrer ||
            "Direct",

        device:
            getDevice(),

        page:
            window.location.pathname,

        event:
            eventName,

        project:
            properties.project ||
            null,

        floor:
            properties.floor ||
            null,

        unit:
            properties.unit ||
            null

    };


    console.log(
        "Sending analytics:",
        data
    );


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/visitor_events`,
                {

                    method: "POST",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify(data)

                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Supabase error:",
                error
            );

            return;
        }


        console.log(
            "✅ Analytics saved"
        );

    }

    catch (error) {

        console.error(
            "Analytics failed:",
            error
        );

    }

}


// ================================
// PAGE VIEW
// ================================

trackEvent(
    "page_view"
);


// ================================
// PROJECT
// ================================

function openProject(project) {

    trackEvent(
        "project_opened",
        {
            project: project
        }
    );

    alert(
        `${project} opened`
    );
}


// ================================
// FLOOR
// ================================

function selectFloor(floor) {

    trackEvent(
        "floor_selected",
        {

            project:
                "MDB Lutyens",

            floor:
                floor

        }
    );

    alert(
        `Floor ${floor} selected`
    );
}


// ================================
// UNIT
// ================================

function selectUnit(unit) {

    trackEvent(
        "unit_selected",
        {

            project:
                "MDB Lutyens",

            floor:
                "5",

            unit:
                unit

        }
    );

    alert(
        `Unit ${unit} selected`
    );
}