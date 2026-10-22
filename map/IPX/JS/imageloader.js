window.addEventListener('DOMContentLoaded', async () => {
    const img = document.getElementById('mainImage');
    if (!img) return;

    const fullSrc = img.getAttribute('data-full');
    if (!fullSrc) return;

    // Keep the decoded placeholder if the full-size image cannot load.
    try {
        const hi = new Image();
        hi.decoding = 'async';
        await new Promise((resolve, reject) => {
            hi.onload = resolve;
            hi.onerror = reject;
            hi.src = fullSrc;
        });
        if (hi.decode) await hi.decode();
        img.src = fullSrc;
        img.classList.add('is-loaded');
        const intro = document.querySelector('.explore-bg');
        if (intro) intro.style.backgroundImage = `url("${fullSrc}")`;
    } catch {
        // The WebP remains the fallback, including if video loading fails.
    }

    const video = document.querySelector('.scene-video');
    if (!video || !video.dataset.video) return;
    // Two decoders share one complete download. Keep the outgoing frame opaque
    // beneath the incoming clip so the JPG never shows through the blend.
    const twin = video.cloneNode(false);
    twin.removeAttribute('id');
    video.after(twin);
    const players = [video, twin];
    players.forEach(player => {
        player.loop = false;
        player.removeAttribute('loop');
        player.muted = true;
        player.defaultMuted = true;
        player.playsInline = true;
    });
    const syncSize = () => {
        players.forEach(player => {
            player.style.width = `${img.offsetWidth}px`;
            player.style.height = `${img.offsetHeight}px`;
        });
    };
    syncSize();
    img.addEventListener('load', syncSize);
    window.addEventListener('resize', syncSize);
    if ('ResizeObserver' in window) new ResizeObserver(syncSize).observe(img);

    let objectURL;
    let failed = false;
    let frame;
    let active = video;
    let incoming = twin;
    let blending = false;
    let starting = false;
    let blendStart = 0;
    let blendDuration = 0.8;
    const fallback = () => {
        failed = true;
        cancelAnimationFrame(frame);
        players.forEach(player => {
            player.style.opacity = '0';
            player.classList.remove('is-ready');
            player.pause();
            player.removeAttribute('src');
            player.load();
        });
        if (objectURL) URL.revokeObjectURL(objectURL);
        objectURL = null;
    };
    players.forEach(player => player.addEventListener('error', fallback, { once: true }));

    async function playFrame(player) {
        // Register before play so even a very short clip supplies a first frame.
        let callback;
        let timer;
        let finish;
        const presented = 'requestVideoFrameCallback' in player
            ? new Promise(resolve => {
                finish = () => { clearTimeout(timer); resolve(); };
                callback = player.requestVideoFrameCallback(finish);
            })
            : null;
        try {
            await player.play();
        } catch (error) {
            if (callback !== undefined) player.cancelVideoFrameCallback(callback);
            throw error;
        }
        if (presented) {
            // Some mobile browsers suppress frame callbacks for a transparent
            // layer. play() plus HAVE_CURRENT_DATA also confirms decoded data.
            const checkDecoded = () => {
                if (failed || (!player.paused && player.readyState >= 2)) {
                    player.cancelVideoFrameCallback(callback);
                    finish();
                } else {
                    timer = setTimeout(checkDecoded, 100);
                }
            };
            timer = setTimeout(checkDecoded, 100);
            await presented;
        }
        else await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    async function beginBlend() {
        starting = true;
        // Put the incoming clip above the outgoing clip, below the hotspot layer.
        active.after(incoming);
        try {
            await playFrame(incoming);
            if (failed) return;
            blendStart = incoming.currentTime;
            blending = true;
        } catch {
            fallback();
        } finally {
            starting = false;
        }
    }

    function tick() {
        if (failed) return;
        if (blending) {
            // Media time freezes during a stall; opacity freezes with it.
            const progress = Math.min(1, Math.max(0, (incoming.currentTime - blendStart) / blendDuration));
            const eased = progress * progress * (3 - 2 * progress);
            incoming.style.opacity = String(eased);
            if (progress === 1 || incoming.ended) {
                incoming.style.opacity = '1';
                active.style.opacity = '0';
                active.pause();
                active.currentTime = 0;
                [active, incoming] = [incoming, active];
                blending = false;
            }
        } else if (!starting && Number.isFinite(active.duration)
            && active.duration > 0 && active.duration - active.currentTime <= blendDuration
            && !incoming.seeking) {
            // If decoding is late, retain the last outgoing frame instead of
            // performing a hard native loop or exposing an empty frame.
            beginBlend();
        }
        frame = requestAnimationFrame(tick);
    }

    async function start() {
        await playFrame(active);
        if (failed) return;
        const configured = Number(video.dataset.blendSeconds);
        blendDuration = Math.min(configured > 0 ? configured : 0.8, active.duration / 3);
        active.classList.add('is-ready');
        // Initial JPG-to-video fade uses CSS; loop blends use media time.
        setTimeout(() => {
            if (failed) return;
            players.forEach(player => { player.style.transition = 'none'; });
            active.style.opacity = '1';
            tick();
        }, 450);
    }

    try {
        // A Blob guarantees the complete download; canplaythrough is only an estimate.
        const mobile = window.matchMedia?.('(max-width: 768px), (pointer: coarse)').matches;
        const supportsHEVC = video.canPlayType?.('video/mp4; codecs="hvc1"');
        const source = video.dataset.videoMobile && (mobile || supportsHEVC === '')
            ? video.dataset.videoMobile : video.dataset.video;
        const response = await fetch(source);
        if (!response.ok) throw new Error('Scene video unavailable');
        const blob = await response.blob();
        objectURL = URL.createObjectURL(blob);
        players.forEach(player => { player.src = objectURL; player.load(); });
        try {
            await start();
        } catch (error) {
            if (error.name !== 'NotAllowedError') throw error;
            // Some mobile browsers require a gesture even for muted autoplay.
            let retrying = false;
            const retry = () => {
                if (retrying || failed) return;
                retrying = true;
                start().then(() => {
                    document.removeEventListener('pointerdown', retry);
                    document.removeEventListener('keydown', retry);
                }).catch(() => {}).finally(() => { retrying = false; });
            };
            document.addEventListener('pointerdown', retry);
            document.addEventListener('keydown', retry);
        }
    } catch {
        fallback();
    }
});
