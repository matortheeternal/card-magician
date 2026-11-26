import { drawImage, drawSvg } from './drawImage.js';
import { drawText } from './drawText.js';
import { drawBackground } from './drawBackground.js';
import drawListMarker from './drawListMarker.js';

function isHidden(node, style) {
    return style.display === 'none'
        || node.visibility === 'hidden'
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
    const res = isNaN(zIndex) ? 0 : zIndex;
    if (res !== 0) return res;
    return style.position !== 'static' ? 0.5 : 0;
}

async function paintNode(node, style, ctx, rootRect) {
    if (isHidden(node, style)) return;
    if (style.background !== 'none')
        await drawBackground(ctx, node, style, rootRect);
    if (node instanceof SVGElement)
        await drawSvg(ctx, node, rootRect);
    if (node instanceof Image)
        await drawImage(ctx, node, rootRect);
    if (style.display === 'list-item')
        await drawListMarker(ctx, node, style, rootRect);
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

async function paintElements(transforms, groupedNodes, ctx, rootRect) {
    const nodes = Array.from(groupedNodes.keys())
        .sort((a, b) => a - b)
        .map(key => groupedNodes.get(key))
        .flat();

    for (const { node, style } of nodes) {
        ctx.save();

        const transform = transforms.get(node)?.transform || 'none';
        if (transform !== 'none') {
            const mtx = transforms.get(node).resolvedTransform;
            ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.e, mtx.f);
        }

        await paintNode(node, style, ctx, rootRect);
        if (node.children.length && createsStackingContext(transforms, node, style))
            await paintChildren(transforms, node, ctx, rootRect);

        ctx.restore();
    }
}

function createsStackingContext(transforms, node, style) {
    const transform = transforms.get(node)?.transform || 'none';
    return (style.position !== 'static' && style.zIndex !== 'auto')
        || parseFloat(style.opacity) < 1
        || transform !== 'none';
}

function stackNodes(transforms, elementNodes, groupedNodes) {
    elementNodes.forEach(element => {
        const zIndex = getZIndex(element.style);
        if (!groupedNodes.has(zIndex))
            groupedNodes.set(zIndex, []);
        groupedNodes.get(zIndex).push(element);
        if (createsStackingContext(transforms, element.node, element.style)) return;
        const stack = new Map();
        stackNodes(transforms, resolveChildNodes(element.node), stack);
        const orderedKeys = Array.from(stack.keys()).sort((a, b) => a - b);
        for (const key of orderedKeys) {
            if (!groupedNodes.has(key))
                groupedNodes.set(key, []);
            const fixedKey = key < zIndex ? zIndex : key;
            groupedNodes.get(fixedKey).push(...stack.get(key));
        }
    });
}

async function paintChildren(transforms, parent, ctx, rootRect) {
    const elementNodes = resolveChildNodes(parent);
    const groupedNodes = new Map();
    stackNodes(transforms, elementNodes, groupedNodes);
    await paintElements(transforms, groupedNodes, ctx, rootRect);
}

function resolveTransform(transform, origin, node, rootRect) {
    const [originX, originY] = origin.split(' ').map(parseFloat);
    const rect = node.getBoundingClientRect();
    const x = rect.left - rootRect.left + originX;
    const y = rect.top - rootRect.top + originY;

    return new DOMMatrix()
        .translate(x, y)
        .multiply(new DOMMatrix(transform))
        .translate(-x, -y);
}

function removeTransforms(transforms, node, rootRect) {
    if (node.tagName === 'svg') return;
    if (node instanceof Element) {
        const style = getComputedStyle(node);
        const transform = style?.transform || 'none';
        if (transform !== 'none') {
            node.style.transform = 'none';
            transforms.set(node, {
                resolvedTransform: resolveTransform(
                    transform, style.transformOrigin, node, rootRect
                ),
                transform,
            });
        }
    }
    Array.from(node.children).forEach(
        node => removeTransforms(transforms, node, rootRect)
    );
}

function applyTransforms(transforms) {
    for (const [key, val] of transforms)
        key.style.transform = val.transform;
    transforms.clear();
}

export async function cardToCanvas(root, { scale = 2 } = {}) {
    const rootRect = root.getBoundingClientRect();

    const transforms = new Map();
    findAllShadowRoots(root).forEach(
        node => removeTransforms(transforms, node, rootRect)
    );

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
        await paintChildren(transforms, shadowRoot, ctx, rootRect);

    applyTransforms(transforms);

    return canvas;
}
