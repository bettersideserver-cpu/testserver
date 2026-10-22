import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../map/IPX/JS/imageloader.js', import.meta.url), 'utf8');
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

async function setup({ imageFails = false, videoFails = false } = {}) {
    let init, downloaded = false, fetches = 0;
    const frames = new Map();
    const timers = [];
    const players = [];
    let nextFrame = 0;
    function player() {
        const p = {
            dataset: { video: 'Video/Test.mp4' }, style: {}, events: {},
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
        window: { addEventListener(name, callback) { if (name === 'DOMContentLoaded') init = callback; } },
        document: { getElementById: () => img, querySelector: s => s === '.scene-video' ? first : null },
        URL: { createObjectURL: () => 'blob:complete', revokeObjectURL() {} },
        fetch: async () => {
            fetches++;
            return { ok: !videoFails, blob: async () => { downloaded = true; return {}; } };
        },
        requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
        cancelAnimationFrame: id => frames.delete(id),
        setTimeout: callback => timers.push(callback)
    });
    const pending = init();
    await flush();
    return {
        players, img, pending, fetches: () => fetches,
        present: async p => { p.present(); await flush(); },
        timers: () => timers.splice(0).forEach(callback => callback()),
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
