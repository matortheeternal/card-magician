import { markInspectionTarget } from './inspectionTargets.js';

function segmentsOf(start, end, findings) {
    const boundaries = new Set([start, end]);
    for (const { location } of findings) {
        boundaries.add(Math.max(start, location.start));
        boundaries.add(Math.min(end, location.end));
    }
    return [...boundaries].sort((a, b) => a - b);
}

function markedSegment(text, findings) {
    if (!findings.length) return document.createTextNode(text);
    const span = document.createElement('span');
    const underlined = ({ location }) => location.style === 'underline';
    const highlighted = findings.some(item => !underlined(item));
    span.classList.toggle('inspection-highlight', highlighted);
    span.classList.toggle('hljs-unrecognized', findings.some(underlined));
    markInspectionTarget(span, findings);
    span.textContent = text;
    return span;
}

function markNode(node, start, end, findings) {
    const overlapping = findings.filter(({ location }) =>
        location.start < end && location.end > start);
    if (!overlapping.length) return;
    const fragment = document.createDocumentFragment();
    const boundaries = segmentsOf(start, end, overlapping);
    for (let index = 1; index < boundaries.length; index++) {
        const from = boundaries[index - 1];
        const to = boundaries[index];
        const covering = overlapping.filter(({ location }) =>
            location.start <= from && location.end >= to);
        const text = node.data.slice(from - start, to - start);
        fragment.append(markedSegment(text, covering));
    }
    node.replaceWith(fragment);
}

export function hasInspectionRange({ location }) {
    return location?.start < location?.end;
}

export function markInspectionRanges(editor, findings) {
    if (!findings.length) return;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let offset = 0;
    for (const node of nodes) {
        const end = offset + node.length;
        markNode(node, offset, end, findings);
        offset = end;
    }
}
