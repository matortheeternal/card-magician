import { ABILITY_WORDS, CHAPTERS, KEYWORDS, MACROS, TYPES } from './hljsConstants.js';

export default function mtg() {
    const typeRule = {
        className: 'type',
        begin: new RegExp(`\\b(${TYPES})( (${TYPES}))?\\b`, 'i')
    };

    const macroRule = {
        className: 'built_in',
        begin: new RegExp(`(?<!\\w)(${MACROS})(?!\\w)`)
    };

    const symbolRule = {
        className: 'symbol',
        begin: /\{[^}]+}/i
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
        /^LEVEL (?:\d+\+|\d+-\d+)\n[^\/\n]+\/[^\/\n]+\n/,
        /(?=^LEVEL)/
    );
    const stationBlockRule = blockRule(/^\d+\+ \| /);
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
