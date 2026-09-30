// Request Call Back form -> same Google Spreadsheet, Sheet2.
// reCAPTCHA has been removed from this form.
const REQUEST_CALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzjaAFKo7pSFyQD43jxu14FD7XKeBsHs_1A4sw7tupxa2FAkWbvcZG8pt9qzefV_9w/exec';

(function handleEnquiryForm() {
    const form = document.getElementById("enquiryForm");
    const submitBtn = form?.querySelector(".submit");
    if (!form) return;

    function setFormBusy(isBusy) {
        if (!submitBtn) return;
        submitBtn.setAttribute("aria-busy", isBusy ? "true" : "false");
        [...form.elements].forEach(el => el.disabled = isBusy);
    }

    function showEnquiryOverlay() {
        const overlay = document.getElementById('enquiryOverlay');
        const openBtn = document.getElementById('openEnquiry');
        if (!overlay) return;
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (openBtn) openBtn.classList.add('is-hidden');
    }

    function hideEnquiryOverlay() {
        const overlay = document.getElementById('enquiryOverlay');
        const openBtn = document.getElementById('openEnquiry');
        if (!overlay) return;
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (openBtn) openBtn.classList.remove('is-hidden');
    }

    const overlay = document.getElementById('enquiryOverlay');
    const openBtn = document.getElementById('openEnquiry');
    const closeBtn = document.getElementById('closeBtn');

    if (overlay && openBtn && closeBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEnquiryOverlay();
        });
        closeBtn.addEventListener('click', hideEnquiryOverlay);
        overlay.addEventListener('click', (e) => {
            if (!e.target.closest('.modal')) hideEnquiryOverlay();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideEnquiryOverlay();
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const phone = form.phone.value.trim();
        if (!/^[0-9]{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        const email = form.email.value.trim();
        if (!email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address.');
            return;
        }

        const fd = new FormData(form);
        fd.append('formType', 'request_callback');
        fd.append('tower', getTowerName());
        fd.append('page_url', window.location.href);
        fd.append('page_path', window.location.pathname);
        fd.append('source', 'Request Call Back');

        setFormBusy(true);
        submitBtn.textContent = 'Submitting...';

        try {
            await fetch(REQUEST_CALLBACK_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: fd,
                keepalive: true
            });

            submitBtn.textContent = '✅ Submitted!';
            form.reset();

            setTimeout(() => {
                hideEnquiryOverlay();
                submitBtn.removeAttribute('aria-busy');
                submitBtn.textContent = 'Request a Call Back';
                setFormBusy(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Could not submit your request. Please try again.');
            submitBtn.textContent = 'Request a Call Back';
            setFormBusy(false);
        }
    });

    function getTowerName() {
        const file = (location.pathname.split('/').pop() || '').toLowerCase();
        if (file.includes('tower_a')) return 'Tower A';
        if (file.includes('tower_b')) return 'Tower B';
        if (file.includes('tower_c')) return 'Tower C';
        if (file.includes('tower_mall')) return 'Mall';
        if (file.includes('tower_d')) return 'Tower D';
        return document.title || 'Unknown';
    }
})();
