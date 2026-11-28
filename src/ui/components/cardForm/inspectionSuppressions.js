import { hasInspectionRange } from '../fieldComponents/inspectionRanges.js';

function textAnchor(text, { start, end }) {
    const lineStart = text.slice(0, start).lastIndexOf('\n') + 1;
    const nextLine = text.indexOf('\n', end);
    const context = text.slice(lineStart, nextLine < 0 ? text.length : nextLine);
    if (!context) return [start, end];
    let occurrence = 0;
    let count = 0;
    for (let index = text.indexOf(context); index >= 0;
        index = text.indexOf(context, index + context.length)) {
        if (index < lineStart) occurrence++;
        count++;
    }
    return [context, start - lineStart, end - lineStart, occurrence, count];
}

export function inspectionKey({ inspectionId, card, face, location, evidence, message }) {
    const side = face === card.back ? 'back' : 'front';
    const field = location?.field;
    const value = field ? String(face[field] ?? '') : '';
    const anchor = hasInspectionRange({ location })
        ? textAnchor(value, location)
        : [value, evidence ?? (field ? '' : message)];
    return JSON.stringify([inspectionId, side, field, anchor]);
}

function matchingIgnoredKey(finding, key) {
    const ignored = finding.card.ignoredInspections;
    if (ignored?.includes(key)) return key;
    if (!ignored?.length || !finding.evidence || !finding.location) return null;
    const previous = inspectionKey({ ...finding, location: null });
    return ignored.includes(previous) ? previous : null;
}

export function keyFindings(findings) {
    const counts = new Map();
    const offsets = new Map();
    const entries = findings.map(finding => {
        const anchorKey = inspectionKey(finding);
        counts.set(anchorKey, (counts.get(anchorKey) ?? 0) + 1);
        return { finding, anchorKey };
    });
    return entries.map(({ finding, anchorKey }) => {
        const index = offsets.get(anchorKey) ?? 0;
        const count = counts.get(anchorKey);
        offsets.set(anchorKey, index + 1);
        const key = count === 1 ? anchorKey : JSON.stringify([anchorKey, index, count]);
        const ignoredKey = matchingIgnoredKey(finding, key);
        return { ...finding, anchorKey, key, ignoredKey, ignored: Boolean(ignoredKey) };
    });
}
