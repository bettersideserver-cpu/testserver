(() => {
    // Visitor welcome form -> Visitor Form tab in the SAME Google Spreadsheet.
    const scriptURL = "https://script.google.com/macros/s/AKfycbxzjaAFKo7pSFyQD43jxu14FD7XKeBsHs_1A4sw7tupxa2FAkWbvcZG8pt9qzefV_9w/exec";
    const sessionKey = "cm-infinia-tower-lead-submitted";

    try {
        if (sessionStorage.getItem(sessionKey) === "1") return;
    } catch (error) {}

    const dialog = document.createElement("dialog");
    dialog.className = "tower-lead-dialog";
    dialog.setAttribute("aria-labelledby", "tower-lead-title");
    dialog.setAttribute("aria-describedby", "tower-lead-intro");
    dialog.setAttribute("aria-modal", "true");
    dialog.innerHTML = `
        <div class="tower-lead-content">
            <div class="tower-lead-top">
                <div>
                    <p class="tower-lead-kicker">CM Infinia</p>
                    <h2 class="tower-lead-title" id="tower-lead-title">Explore your next home</h2>
                </div>
                <button class="tower-lead-close" type="button" aria-label="Close form">&times;</button>
            </div>
            <p class="tower-lead-intro" id="tower-lead-intro">Share your details and our team will get in touch.</p>
            <form class="tower-lead-form">
                <label class="tower-lead-field"><span>Name *</span><input name="fullName" type="text" autocomplete="name" required maxlength="100"></label>
                <label class="tower-lead-field"><span>Phone Number *</span><input name="phone" type="tel" autocomplete="tel-national" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" title="Enter a 10-digit phone number" required></label>
                <label class="tower-lead-field"><span>Email (optional)</span><input name="email" type="email" autocomplete="email" maxlength="254"></label>
                <label class="tower-lead-field"><span>City *</span><input name="city" type="text" autocomplete="address-level2" required maxlength="100"></label>
                <button class="tower-lead-submit" type="submit">Continue exploring</button>
                <p class="tower-lead-error" role="alert" aria-live="polite"></p>
            </form>
        </div>`;
    document.body.appendChild(dialog);

    const form = dialog.querySelector("form");
    const button = dialog.querySelector(".tower-lead-submit");
    const errorMessage = dialog.querySelector(".tower-lead-error");
    const previousOverflow = document.body.style.overflow;

    function closeDialog() {
        dialog.close();
        document.body.style.overflow = previousOverflow;
    }

    dialog.querySelector(".tower-lead-close").addEventListener("click", closeDialog);
    dialog.addEventListener("cancel", () => {
        document.body.style.overflow = previousOverflow;
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const data = new FormData(form);
        data.set("fullName", String(data.get("fullName") || "").trim());
        data.set("phone", String(data.get("phone") || "").trim());
        data.set("email", String(data.get("email") || "").trim());
        data.set("city", String(data.get("city") || "").trim());
        data.append("formType", "visitor");
        data.append("page_title", document.title);
        data.append("page_url", location.href);
        data.append("page_path", location.pathname);
        data.append("source", "Visitor Form");

        if (!data.get("fullName") || !data.get("city")) {
            errorMessage.textContent = "Please enter your name and city.";
            return;
        }

        button.disabled = true;
        button.textContent = "Submitting...";
        errorMessage.textContent = "";

        try {
            await fetch(scriptURL, { method: "POST", mode: "no-cors", body: data, keepalive: true });
            try { sessionStorage.setItem(sessionKey, "1"); } catch (error) {}
            closeDialog();
        } catch (error) {
            errorMessage.textContent = "Your details could not be sent. Please try again.";
        } finally {
            button.disabled = false;
            button.textContent = "Continue exploring";
        }
    });

    document.body.style.overflow = "hidden";
    dialog.showModal();
})();
