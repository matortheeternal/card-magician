import { Query } from 'oracle-of-pie';
import locatedAbilities from '../locatedAbilities.js';
import parsedRules from '../parsedRules.js';
import { hasRulesText } from '../faceTraits.js';

const CREATE_TOKEN = Query.compile({ kind: 'CreateTokenEffect' });
const QUOTED = /"[^"]*(?:"|$)|“[^”]*(?:”|$)/g;
const VARIABLE_QUANTITY = /^X\s+(?=\S)/;
const NAMED = /\bnamed\s+(?:"([^"]+)"|“([^”]+)”|([^,."]+))/d;
const TYPE_WORDS = /((?:\b[A-Z][\w'’-]*\s+)+)/;
const TOKEN_TYPES = new RegExp(
    `${TYPE_WORDS.source}(?:(?:artifact|enchantment|land|creature)\\s+)*tokens?\\b`,
    'dg'
);

function tokenAt(description, bounds, offset) {
    const [start, end] = bounds;
    const name = description.slice(start, end).trimEnd();
    const range = offset === null ? null : {
        start: offset + start, end: offset + start + name.length
    };
    return { name, range };
}

function describedTokens(description, offset) {
    const masked = description.replace(QUOTED, quote => ' '.repeat(quote.length));
    const named = NAMED.exec(description);
    if (named && masked.slice(named.index, named.index + 5) === 'named') {
        const bounds = named.indices.slice(1).find(Boolean);
        return [tokenAt(description, bounds, offset)];
    }
    return Array.from(masked.matchAll(TOKEN_TYPES), match => {
        const [start, end] = match.indices[1];
        const quantity = VARIABLE_QUANTITY.exec(match[1])?.[0] ?? '';
        return tokenAt(description, [start + quantity.length, end], offset);
    });
}

function locateDescription(locator, description, range, start) {
    if (!range) return null;
    const pattern = new RegExp(locator.pattern(description), 'g');
    pattern.lastIndex = start;
    const match = pattern.exec(locator.source);
    if (!match || match.index + match[0].length > range.end) return null;
    return match;
}

function* abilityTokens(ability, range, locator) {
    let start = range?.start;
    for (const [node, context] of ability.walk()) {
        if (!CREATE_TOKEN.test(node, context) || node.copySource || !node.description)
            continue;
        const match = locateDescription(locator, node.description, range, start);
        yield* describedTokens(match?.[0] ?? node.description, match?.index ?? null);
        if (match) start = match.index + match[0].length;
    }
}

export default function createdTokens(face, card) {
    if (!hasRulesText(face)) return [];
    const { locator } = parsedRules(face, card);
    const tokens = [];
    for (const { ability, range } of locatedAbilities(face, card))
        tokens.push(...abilityTokens(ability, range, locator));
    return tokens;
}
