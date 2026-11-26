import RenderScheduler from '../../../domain/template/renderScheduler.js';
import AutoFit from '../autoFit/AutoFit.js';
import { waitForImages } from '../../../shared/htmlUtils.js';

const RENDER_TIMEOUT_MS = 10000;
const TIMED_OUT = Symbol('timed out');

function afterNextFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(() => setTimeout(resolve));
    });
}

function cropImages(root) {
    return [...root.querySelectorAll('crop-image')];
}

function autoFits(root) {
    return [...root.querySelectorAll('*')].filter(node => node instanceof AutoFit);
}

function hasIncompleteImages(root) {
    return [...root.querySelectorAll('img')].some(image => !image.complete);
}

function isBusy(cardFace) {
    const root = cardFace.shadowRoot;
    return !cardFace.face.pendingWork.isIdle
        || RenderScheduler.scheduled
        || autoFits(root).some(autoFit => autoFit.fitPending)
        || hasIncompleteImages(root);
}

async function settlePass(cardFace) {
    const root = cardFace.shadowRoot;
    await cardFace.face.pendingWork.settled();
    await RenderScheduler.flushed();
    await document.fonts.ready;
    await waitForImages(root);
    await Promise.all(cropImages(root).map(image => image.updateComplete));
    await afterNextFrame();
}

async function settle(cardFace) {
    await settlePass(cardFace);
    while (isBusy(cardFace)) await settlePass(cardFace);
}

function timeout(ms) {
    let timer;
    const promise = new Promise(resolve => {
        timer = setTimeout(() => resolve(TIMED_OUT), ms);
    });
    return { promise, cancel: () => clearTimeout(timer) };
}

export async function waitForRender(cardFace, timeoutMs = RENDER_TIMEOUT_MS) {
    const timer = timeout(timeoutMs);
    const result = await Promise.race([settle(cardFace), timer.promise]);
    timer.cancel();
    if (result !== TIMED_OUT) return;
    log('render').warn(`Card face ${cardFace.face.id} did not finish rendering `
        + `within ${timeoutMs}ms`);
}
