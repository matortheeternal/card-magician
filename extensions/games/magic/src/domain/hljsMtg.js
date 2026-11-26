import { ABILITY_WORDS, CHAPTERS, KEYWORDS, MACROS } from './hljsConstants.js';
import unrecognizedRanges from './unrecognizedRanges.js';

const MANA_SYMBOL_PATTERN = /\{[^}]+}/i;
const LEVEL_HEADER_PATTERN = /^LEVEL (?:\d+\+|\d+-\d+)\n[^\/\n]+\/[^\/\n]+\n/;
const NEXT_LEVEL_PATTERN = /(?=^LEVEL)/;
const STATION_HEADER_PATTERN = /^\d+\+ \| /;

export default function mtg() {
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
        begin: new RegExp(`\\b(${KEYWORDS})\\b`, 'i')
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
                keywordRule,
                abilityWordRule,
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
        contains: [
            commentRule,
            levelBlockRule,
            stationBlockRule,
            sagaBlockRule,
            symbolRule,
            keywordRule,
            abilityWordRule,
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
