import { loadImage } from '../../../shared/imageUtils.js';

function matchingRules(sheet, parent) {
    let cssText = '';
    for (const rule of sheet.cssRules) {
        if (rule.constructor !== CSSStyleRule) continue;
        if (!parent.querySelector(rule.selectorText)) continue;
        cssText += rule.cssText + '\n';
    }
    return cssText;
}

function cloneSvg(svgEl) {
    const clone = svgEl.cloneNode(true);
    if (!clone.getAttribute('xmlns'))
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const styleEl = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'style'
    );

    const styleTags = svgEl.getRootNode().querySelectorAll('style');
    styleEl.textContent = [...styleTags].map(style => (
        matchingRules(style.sheet, svgEl.parentElement)
    )).join('');
    clone.insertBefore(styleEl, clone.firstChild);

    return clone;
}

function svgToObjectUrl(svgEl) {
    const clone = cloneSvg(svgEl);
    const rect = svgEl.getBoundingClientRect();
    clone.setAttribute('width', rect.width);
    clone.setAttribute('height', rect.height);

    if (!clone.getAttribute('viewBox'))
        clone.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);

    const svgText = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
}

export async function drawSvg(ctx, svgEl, rootRect) {
    const rect = svgEl.getBoundingClientRect();
    const x = rect.left - rootRect.left;
    const y = rect.top - rootRect.top;

    const objectUrl = svgToObjectUrl(svgEl);
    try {
        const img = await loadImage(objectUrl);
        ctx.drawImage(img, x, y, rect.width, rect.height);
    } catch(error) {
        log('render').error(`Failed to draw svg`, svgEl, error);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function decodeSource(url) {
    const response = await fetch(url);
    return createImageBitmap(await response.blob());
}

export async function drawImage(ctx, imgEl, rootRect) {
    const rect = imgEl.getBoundingClientRect();
    const x = rect.left - rootRect.left;
    const y = rect.top - rootRect.top;
    const bitmap = await decodeSource(imgEl.currentSrc);
    ctx.drawImage(bitmap, x, y, rect.width, rect.height);
    bitmap.close();
}
