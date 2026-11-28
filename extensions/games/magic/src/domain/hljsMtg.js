import { DEFAULT_KEYWORDS, RulesDefinitions } from 'oracle-of-pie';
import { ABILITY_WORDS, CHAPTERS, MACROS } from './hljsConstants.js';
import unrecognizedRanges from './unrecognizedRanges.js';

const MANA_SYMBOL_PATTERN = /\{[^}]+\}/;
const LEVEL_HEADER_PATTERN = /^LEVEL (?:\d+\+|\d+-\d+)\n[^\/\n]+\/[^\/\n]+\n/;
const NEXT_LEVEL_PATTERN = /(?=^LEVEL)/;
const STATION_HEADER_PATTERN = /^\d+\+ \| /;

const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;
const WORD_CHARACTER = '[\\p{L}\\p{N}_]';

const stockDefinitions = RulesDefinitions.withDefaults();
const stockNames = [
    ...DEFAULT_KEYWORDS,
    ...stockDefinitions.keywords.definitions.map(({ name }) => name),
    ...stockDefinitions.actions.definitions.map(({ name }) => name)
];
const keywordFamilies = stockDefinitions.keywords.definitions
    .filter(definition => definition.pattern)
    .map(definition => definition.patternSource);

function keywordPattern(customNames) {
    const names = [...stockNames, ...customNames].map(name => name.toLowerCase());
    const sources = [...new Set(names)]
        .sort((a, b) => b.length - a.length)
        .map(name => name.replace(REGEX_SPECIAL, '\\$&'));
    const terms = [...sources, ...keywordFamilies].join('|');
    return new RegExp(`(?<!${WORD_CHARACTER})(?i:${terms})(?!${WORD_CHARACTER})`, 'u');
}

export default function mtg(customNames = []) {
    const macroRule = {
        className: 'built_in',
        begin: new RegExp(`(?<!\\w)(${MACROS})(?!\\w)`)
    };

    const symbolRule = {
        className: 'symbol',
        begin: MANA_SYMBOL_PATTERN
    };

    const abilityWordRule = {
        className: 'ability-word',
        begin: new RegExp(`\\b(${ABILITY_WORDS})\\b(?=\\s+[—-])`, 'i')
    };

    const keywordRule = {
        className: 'keyword',
        begin: keywordPattern(customNames)
    };

    const commentRule = {
        className: 'comment',
        begin: /\(/,
        end: /\)/,
        contains: [symbolRule]
    };

    function blockRule(begin, end) {
        return {
            className: 'block',
            begin,
            end: end || new RegExp(`(?=${begin.source})`),
            endsParent: false,
            contains: [
                commentRule,
                symbolRule,
                abilityWordRule,
                keywordRule,
                // typeRule,
                macroRule,
            ]
        };
    }

    const levelBlockRule = blockRule(
        LEVEL_HEADER_PATTERN,
        NEXT_LEVEL_PATTERN
    );
    const stationBlockRule = blockRule(STATION_HEADER_PATTERN);
    const sagaBlockRule = blockRule(
        new RegExp(`^(${CHAPTERS})(?:, (${CHAPTERS}))* [—-] `)
    );

    return {
        name: 'MTG',
        case_insensitive: false,
        unicodeRegex: true,
        contains: [
            commentRule,
            levelBlockRule,
            stationBlockRule,
            sagaBlockRule,
            symbolRule,
            abilityWordRule,
            keywordRule,
            // typeRule,
            macroRule,
        ]
    };
}

function markTextNode(node, start, end) {
    const span = document.createElement('span');
    span.className = 'hljs-unrecognized';
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    range.surroundContents(span);
}

function markNodeRanges({ node, start, end }, ranges) {
    for (const range of ranges) {
        if (range.start >= end) continue;
        if (range.end <= start) break;
        markTextNode(node, Math.max(range.start - start, 0),
                     Math.min(range.end, end) - start);
    }
}

export function markUnrecognizedText(editor, parsed) {
    const ranges = unrecognizedRanges(parsed).reverse();
    if (!ranges.length) return;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let offset = 0;
    const textNodes = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        const end = offset + node.length;
        if (!node.parentElement.closest('.hljs-comment'))
            textNodes.push({ node, start: offset, end });
        offset = end;
    }
    for (const node of textNodes) markNodeRanges(node, ranges);
}
