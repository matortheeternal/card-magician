import { loadImage } from '../../../shared/imageUtils.js';

function cloneSvg(svgEl) {
    const clone = svgEl.cloneNode(true);
    if (!clone.getAttribute('xmlns'))
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const styleEl = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'style'
    );

    let cssText = '';
    const styleTags = svgEl.getRootNode().querySelectorAll('style');
    for (const style of styleTags) {
        for (const rule of style.sheet.cssRules) {
            if (rule.constructor !== CSSStyleRule) continue;
            if (svgEl.parentElement.querySelector(rule.selectorText))
                cssText += rule.cssText + '\n';
        }
    }

    styleEl.textContent = cssText;
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

export async function drawImage(ctx, imgEl, rootRect) {
    const rect = imgEl.getBoundingClientRect();
    const x = rect.left - rootRect.left;
    const y = rect.top - rootRect.top;
    ctx.drawImage(imgEl, x, y, rect.width, rect.height);
}
