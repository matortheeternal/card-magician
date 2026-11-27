import { Query } from 'oracle-of-pie';
import parsedRules from '../parsedRules.js';
import { hasRulesText } from '../faceTraits.js';

const CREATE_TOKEN = Query.compile({ kind: 'CreateTokenEffect' });
const QUOTED = /"[^"]*"|“[^”]*”/g;
const NAMED = /\bnamed ([^,."]+)/;
const TYPE_WORDS = /((?:\b[A-Z][\w'’-]*\s+)+)/;
const TOKEN_TYPES = new RegExp(
    `${TYPE_WORDS.source}(?:(?:artifact|enchantment|land|creature)\\s+)*tokens?\\b`,
    'g'
);

function describedNames(description) {
    const text = description.replace(QUOTED, '');
    const named = NAMED.exec(text)?.[1];
    if (named) return [named.trim()];
    return Array.from(text.matchAll(TOKEN_TYPES), match => match[1].trim());
}

function tokenNames(effect) {
    if (effect.copySource) return [];
    return describedNames(effect.description ?? '');
}

function abilityTokenNames(ability) {
    const names = [];
    for (const [node, context] of ability.walk()) {
        if (!CREATE_TOKEN.test(node, context)) continue;
        names.push(...tokenNames(node));
    }
    return names;
}

export default function createdTokenNames(face, card) {
    if (!hasRulesText(face)) return [];
    const names = parsedRules(face, card).text.abilities.flatMap(abilityTokenNames);
    return [...new Set(names)];
}
