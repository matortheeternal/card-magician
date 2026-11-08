import { ABILITY_WORDS, CHAPTERS, KEYWORDS, MACROS } from './hljsConstants.js';

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
