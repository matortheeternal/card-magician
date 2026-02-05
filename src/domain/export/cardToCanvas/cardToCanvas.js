import { drawImage, drawSvg } from './drawImage.js';
import { drawText } from './drawText.js';
import { drawBackground } from './drawBackground.js';

function isHidden(node, style) {
    return style.display === 'none'
        || node.tagName === 'STYLE';
}

function findAllShadowRoots(startElement) {
    if (startElement.tagName === 'CM-CARD-FACE')
        return [startElement.shadowRoot];
    return Array.from(startElement.querySelectorAll('cm-card-face')).filter(node => {
        return node.shadowRoot?.mode === 'open';
    }).map(node => node.shadowRoot);
}

function getZIndex(style) {
    const zIndex = parseInt(style.zIndex, 10);
    return isNaN(zIndex) ? 0 : zIndex;
}

async function paintNode(node, style, ctx, rootRect) {
    if (isHidden(node, style)) return;
    if (style.backgroundImage !== 'none')
        await drawBackground(ctx, node, style, rootRect);
    if (node instanceof SVGElement)
        await drawSvg(ctx, node, rootRect);
    if (node instanceof Image)
        await drawImage(ctx, node, rootRect);
    for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE)
            drawText(ctx, child, style, rootRect);
    }
}

function resolveChildNodes(parent) {
    if (parent.tagName === 'svg') return [];
    const childNodes = [];
    Array.from(parent.children).forEach(node => {
        if (node.tagName === 'STYLE') return;
        childNodes.push({ node, style: getComputedStyle(node) });
    });
    return childNodes;
}

async function paintElements(groupedNodes, ctx, rootRect) {
    const nodes = Array.from(groupedNodes.keys())
        .sort((a, b) => a - b)
        .map(key => groupedNodes.get(key))
        .flat();
    for (const { node, style } of nodes) {
        await paintNode(node, style, ctx, rootRect);
        if (node.children.length && createsStackingContext(style))
            await paintChildren(node, ctx, rootRect);
    }
}

function createsStackingContext(style) {
    return (style.position !== 'static' && style.zIndex !== 'auto')
        || parseFloat(style.opacity) < 1
        || style.transform !== 'none';
}

function stackNodes(elementNodes, groupedNodes) {
    elementNodes.forEach(element => {
        const zIndex = getZIndex(element.style);
        if (!groupedNodes.has(zIndex))
            groupedNodes.set(zIndex, []);
        groupedNodes.get(zIndex).push(element);
        if (!createsStackingContext(element.style))
            stackNodes(resolveChildNodes(element.node), groupedNodes);
    });
}

async function paintChildren(parent, ctx, rootRect) {
    const elementNodes = resolveChildNodes(parent);
    const groupedNodes = new Map();
    stackNodes(elementNodes, groupedNodes);
    groupedNodes.get(0)?.sort?.((a, b) => {
        const aNotInFlow = a.style.position !== 'static' ? 1 : 0;
        const bNotInFlow = b.style.position !== 'static' ? 1 : 0;
        return aNotInFlow - bNotInFlow;
    });
    await paintElements(groupedNodes, ctx, rootRect);
}

export async function cardToCanvas(root, { scale = 2 } = {}) {
    const rootRect = root.getBoundingClientRect();
    const canvas = document.createElement('canvas');

    canvas.width = Math.ceil(rootRect.width * scale);
    canvas.height = Math.ceil(rootRect.height * scale);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const shadowRoot of findAllShadowRoots(root))
        await paintChildren(shadowRoot, ctx, rootRect);

    return canvas;
}
