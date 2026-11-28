import {
    DEFAULT_KEYWORDS, DEFAULT_TAG_SPECS, KEYWORD_CANON, KeywordFamilyEvaluator,
    canonicalTag
} from 'oracle-of-pie';
import tagAffinity from './oracleTagAffinity.json' with { type: 'json' };

const colorStyles = { W: 'ivory', U: 'blue', B: 'violet', R: 'red', G: 'green' };

const styleOverrides = {
    neutral: [
        'activated-ability', 'additional-cost', 'animate', 'animate-artifact',
        'evasion', 'keyword-counter', 'mana-rock', 'mana-sink', 'modal',
        'restricted-mana', 'triggered-ability'
    ],
    ivory: [
        'damage-prevention', 'lifegain', 'pridemate', 'repeatable-lifegain',
        'removal-exile', 'tapper-creature'
    ],
    blue: [
        'artifactfall', 'bounce', 'bounce-self', 'color-change', 'counterspell',
        'freeze-creature', 'mill-each', 'mill-opponent', 'reanimate-artifact',
        'removal-bounce', 'scry', 'shapechange', 'synergy-artifact', 'tutor-artifact'
    ],
    violet: [
        'death-trigger', 'death-trigger-self', 'discard', 'drain-life',
        'life-payment', 'opponent-loses-life', 'reanimate-creature', 'removal-creature',
        'removal-planeswalker', 'removal-sacrifice', 'removal-toughness', 'ritual',
        'sacrifice-outlet-creature', 'spot-removal'
    ],
    red: [
        'attack-trigger', 'attacking-matters-self', 'burn-any', 'burn-creature',
        'burn-planeswalker', 'burn-player', 'burn-player-each', 'burn-you',
        'discard-outlet', 'pinger', 'prevent-blocker', 'removal-land',
        'repeatable-rummage', 'rummage'
    ],
    green: [
        'adds-multiple-mana', 'animate-land', 'mana-dork', 'ramp', 'regrowth',
        'removal-artifact'
    ],
    teal: [
        'cantrip', 'combat-trick', 'draw', 'more-expensive-than-mv', 'pure-draw',
        'removal-enchantment', 'unblockable'
    ],
    amber: [
        'burst-draw', 'cheaper-than-mv', 'gives-castable-from-exile',
        'mass-regrowth', 'removal-nonland', 'repeatable-pp-counters',
        'repeatable-treasures'
    ],
    pink: [
        'cost-ignorer', 'discount-self', 'manaless-value',
        'mass-reanimation', 'potentially-free', 'repeatable-pure-draw',
        'repeatable-recursion', 'repeatable-removal', 'sweeper', 'sweeper-one-sided'
    ]
};

const overrides = new Map();
for (const [style, tags] of Object.entries(styleOverrides))
    tags.forEach(tag => overrides.set(tag, style));

export function tierStyle(tiers = {}) {
    const primary = Object.keys(tiers).filter(color => tiers[color] === 'primary');
    return primary.length === 1 ? colorStyles[primary[0]] : 'neutral';
}

function keywordStyle(keyword) {
    return tierStyle(KEYWORD_CANON[keyword.toLowerCase()]?.tiers);
}

function addTagFamily(defaults, spec) {
    const family = new KeywordFamilyEvaluator(spec);
    for (const keyword of DEFAULT_KEYWORDS) {
        const tag = family.tagFor(keyword);
        defaults.set(tag, overrides.get(tag) ?? keywordStyle(keyword));
    }
    return family;
}

function directStyle(tag) {
    return overrides.get(tag) ?? colorStyles[tagAffinity[tag]] ?? 'neutral';
}

const defaults = new Map();
export const keywordTagFamilies = [];
for (const spec of DEFAULT_TAG_SPECS) {
    if (spec.family) {
        keywordTagFamilies.push(addTagFamily(defaults, spec));
        continue;
    }
    if (canonicalTag(spec.tag) !== spec.tag) continue;
    defaults.set(spec.tag, directStyle(spec.tag));
}

export const oracleTagStyles = defaults;

export function defaultOracleTagStyle(tag) {
    return defaults.get(canonicalTag(tag)) ?? familyStyle(tag);
}

function familyStyle(tag) {
    if (keywordTagFamilies.some(family => family.ownsTag(tag))) return 'neutral';
}
