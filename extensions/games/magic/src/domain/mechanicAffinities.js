import Oracle from 'oracle-of-pie';
import Keyword from 'oracle-of-pie/src/values/Keyword.js';
import KeywordActionEffect from 'oracle-of-pie/src/effects/KeywordActionEffect.js';
import { getPrintedColors } from './ColorIdentity.js';

function keyFor(kind, name) {
    return `${kind}:${name.toLowerCase()}`;
}

function mechanicKey(node) {
    if (node instanceof Keyword) return keyFor('keywords', node.name);
    if (node instanceof KeywordActionEffect) return keyFor('actions', node.action);
    return null;
}

function faceMechanics(face, oracle) {
    const { name, rulesText: text } = face;
    const pending = [oracle.parseFace({ name: name ?? '', text }).text];
    const keys = new Set();
    for (const node of pending) {
        const key = mechanicKey(node);
        if (key) keys.add(key);
        pending.push(...node.children);
    }
    return keys;
}

function cardEvidence(card, oracle) {
    const evidence = new Map();
    for (const face of card.faces) {
        if (!face.rulesText?.trim()) continue;
        const [color, other] = getPrintedColors(face);
        if (!color || other) continue;
        const keys = evidence.get(color) ?? new Set();
        for (const key of faceMechanics(face, oracle)) keys.add(key);
        evidence.set(color, keys);
    }
    return evidence;
}

function countEvidence(counts, color, key) {
    const countsByColor = counts.get(key);
    if (!countsByColor) return;
    countsByColor[color] = (countsByColor[color] ?? 0) + 1;
}

function countCard(counts, evidence) {
    for (const [color, keys] of evidence)
        keys.forEach(key => countEvidence(counts, color, key));
}

function tierFor(count, peak) {
    if (count === peak) return 'primary';
    if (count >= peak / 2) return 'secondary';
    return 'tertiary';
}

function inferEntry(entry, counts) {
    if (Object.hasOwn(entry.definition, 'tiers')) return entry;
    const byColor = counts.get(keyFor(entry.kind, entry.definition.name));
    const peak = Math.max(0, ...Object.values(byColor ?? {}));
    if (!peak) return entry;
    const tiers = Object.fromEntries(Object.entries(byColor).map(([color, count]) =>
        [color, tierFor(count, peak)]));
    return { ...entry, definition: { ...entry.definition, tiers } };
}

export function inferMechanicAffinities(entries, cards) {
    const counts = new Map();
    const definitions = { keywords: [], actions: [] };
    for (const { kind, definition } of entries) {
        if (definition.disabled) continue;
        definitions[kind].push({ name: definition.name });
        if (!Object.hasOwn(definition, 'tiers'))
            counts.set(keyFor(kind, definition.name), {});
    }
    if (!counts.size) return entries;
    const oracle = new Oracle({ definitions });
    for (const card of cards) countCard(counts, cardEvidence(card, oracle));
    return entries.map(entry => inferEntry(entry, counts));
}
