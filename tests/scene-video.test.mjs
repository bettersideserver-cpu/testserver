import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../map/IPX/JS/imageloader.js', import.meta.url), 'utf8');
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

async function setup({ imageFails = false, videoFails = false, mobile = false, hevc = 'probably' } = {}) {
    let init, downloaded = false, fetches = 0;
    const frames = new Map();
    const timers = new Map();
    const requests = [];
    let nextTimer = 0;
    const players = [];
    let nextFrame = 0;
    function player() {
        const p = {
            dataset: { video: 'video/Test.mp4', videoMobile: 'video/Test-mobile.mp4' }, style: {}, events: {},
            canPlayType: () => hevc,
            currentTime: 0, duration: 3, readyState: 4, seeking: false,
            paused: true, ended: false, classList: { add() {}, remove() {} },
            cloneNode: player, removeAttribute() {}, after() {}, load() {},
            addEventListener(name, callback) { this.events[name] = callback; },
            requestVideoFrameCallback(callback) { this.present = callback; return 1; },
            cancelVideoFrameCallback() {},
            async play() { assert.ok(downloaded); this.paused = false; },
            pause() { this.paused = true; }
        };
        players.push(p);
        return p;
    }
    const first = player();
    const img = {
        src: 'low.webp', getAttribute: () => 'full.jpg', offsetWidth: 384, offsetHeight: 583,
        classList: { add() {} }, addEventListener() {}
    };
    class Image {
        set src(value) { queueMicrotask(() => imageFails ? this.onerror() : this.onload()); }
        async decode() {}
    }
    vm.runInNewContext(source, {
        Image,
        window: {
            matchMedia: () => ({ matches: mobile }),
            addEventListener(name, callback) { if (name === 'DOMContentLoaded') init = callback; }
        },
        document: { getElementById: () => img, querySelector: s => s === '.scene-video' ? first : null },
        URL: { createObjectURL: () => 'blob:complete', revokeObjectURL() {} },
        fetch: async source => {
            requests.push(source);
            fetches++;
            return { ok: !videoFails, blob: async () => { downloaded = true; return {}; } };
        },
        requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
        cancelAnimationFrame: id => frames.delete(id),
        setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; },
        clearTimeout: id => timers.delete(id)
    });
    const pending = init();
    await flush();
    return {
        players, img, pending, requests, fetches: () => fetches,
        present: async p => { p.present(); await flush(); },
        timers: () => {
            const callbacks = [...timers.values()];
            timers.clear();
            callbacks.forEach(callback => callback());
        },
        frame: async () => {
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach(callback => callback());
            await flush();
        }
    };
}

test('crossfade alternates decoders without revealing the underlying JPG', async () => {
    const app = await setup();
    let [active, incoming] = app.players;
    assert.equal(active.style.opacity, undefined, 'wait for first presented frame');
    await app.present(active);
    await app.pending;
    app.timers();
    for (let cycle = 0; cycle < 4; cycle++) {
        active.currentTime = 2.21;
        await app.frame();
        assert.equal(incoming.paused, false);
        assert.equal(active.style.opacity, '1');
        await app.present(incoming);
        incoming.currentTime = 0.4;
        await app.frame();
        assert.ok(Math.abs(Number(incoming.style.opacity) - 0.5) < 0.001);
        assert.equal(active.style.opacity, '1', 'outgoing layer remains opaque');
        await app.frame();
        assert.ok(Math.abs(Number(incoming.style.opacity) - 0.5) < 0.001, 'stalled media freezes blend');
        incoming.currentTime = 0.81;
        await app.frame();
        assert.equal(incoming.style.opacity, '1');
        assert.equal(active.style.opacity, '0');
        assert.equal(active.paused, true);
        assert.equal(active.currentTime, 0);
        [active, incoming] = [incoming, active];
    }
    assert.equal(app.fetches(), 1, 'both decoders reuse one download');
    app.players[0].events.error();
    assert.ok(app.players.every(p => p.style.opacity === '0' && p.paused));
});

test('failed downloads retain the best available still image', async () => {
    for (const imageFails of [false, true]) {
        const app = await setup({ imageFails, videoFails: true });
        await app.pending;
        assert.equal(app.img.src, imageFails ? 'low.webp' : 'full.jpg');
        assert.ok(app.players.every(p => p.style.opacity === '0' && p.paused));
    }
});

test('phones and browsers without HEVC use the lightweight H.264 source', async () => {
    for (const options of [{ mobile: true }, { hevc: '' }]) {
        const app = await setup(options);
        assert.equal(app.requests[0], 'video/Test-mobile.mp4');
        await app.present(app.players[0]);
        await app.pending;
        assert.equal(app.players[0].playsInline, true);
        assert.equal(app.players[0].defaultMuted, true);
    }
});

test('decoded mobile playback reveals even when frame callbacks are suppressed', async () => {
    const app = await setup({ mobile: true });
    app.timers();
    await flush();
    await app.pending;
    app.timers();
    assert.equal(app.players[0].style.opacity, '1');
    // Mobile preload can defer decoding the second player until play() is called.
    app.players[1].readyState = 1;
    app.players[0].currentTime = 2.21;
    await app.frame();
    assert.equal(app.players[1].paused, false);
});
