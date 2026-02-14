export default function mtg() {
    const KEYWORDS = [
        'Flying',
        'Trample',
        'Vigilance',
        'Indestructible',
        'Deathtouch',
        'Lifelink',
        'Haste',
        'Ward',
        'Station',
        'Level up'
    ].join('|');

    const ABILITY_WORDS = [
        'Landfall',
        'Raid',
        'Metalcraft',
        'Morbid',
        'Revolt',
        'Delirium'
    ].join('|');

    const TYPES = [
        'artifacts?',
        'enchantments?',
        'planeswalkers?',
        'creatures?',
        'instants?',
        'sorcer(?:y|ies)',
        'tokens?',
        'lands?',
        'legendary',
        'snow',
        'permanents?',
        'spells?',
        'cards?',
    ].join('|');

    const RESTRICTIONS = [
        'Activate only as a sorcery',
        'Activate only once each turn',
        'Only once each turn',
        'Only during your turn'
    ].join('|');

    const CHAPTERS = [
        'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
        'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'
    ].join('|');

    const chapterExpr = new RegExp(`^((${CHAPTERS})(?:, (${CHAPTERS}))*) [—-] `);
    const endChapterExpr = new RegExp(`(?=${chapterExpr.source})`);

    const typeRule = {
        className: 'type',
        begin: new RegExp(`\\b(${TYPES})( (${TYPES}))?\\b`, 'i')
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

    // Restrictions
    const restrictionRule = {
        className: 'meta',
        begin: new RegExp(`\\b(${RESTRICTIONS})\\b`)
    };

    const commentRule = {
        className: 'comment',
        begin: /\(/,
        end: /\)/,
        contains: [
            symbolRule
        ]
    };

    return {
        name: 'MTG',
        case_insensitive: false,
        contains: [
            commentRule,

            {
                className: 'block',
                begin: /^LEVEL (?:\d+\+|\d+-\d+)\n[^\/\n]+\/[^\/\n]+\n/,
                end: /(?=^LEVEL)/,
                endsParent: false,
                contains: [
                    commentRule,
                    symbolRule,
                    keywordRule,
                    abilityWordRule,
                    // restrictionRule,
                    typeRule,
                ]
            },

            {
                className: 'block',
                begin: /^\d+\+ \| /,
                end: /(?=^\d+\+ \| )/,
                endsParent: false,
                contains: [
                    commentRule,
                    symbolRule,
                    keywordRule,
                    abilityWordRule,
                    // restrictionRule,
                    typeRule,
                ]
            },

            {
                className: 'block',
                begin: chapterExpr,
                end: endChapterExpr,
                endsParent: false,
                contains: [
                    commentRule,
                    symbolRule,
                    keywordRule,
                    abilityWordRule,
                    // restrictionRule,
                    typeRule,
                ]
            },

            symbolRule,
            keywordRule,
            abilityWordRule,
            // restrictionRule,
            typeRule,
        ]
    };
}
