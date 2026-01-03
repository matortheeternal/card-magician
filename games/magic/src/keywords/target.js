const cardTypes = [
    'creature',
    'artifact',
    'enchantment',
    'planeswalker',
    'battle',
    'land',
    'permanent',
    'legendary',
    'basic',
    'snow',
    'token'
];

const cardTypeRegex = `((${cardTypes.join('|')}) ?)+`;
const itPatterns = [
    (kw, card) => `(This ${card.getThisType()} (has|gains) ${kw})`,
    kw => `Target ${cardTypeRegex} gains ${kw}`,
    kw => `put a ${kw} counter`
];
const itRegexSource = (kw, card) => itPatterns.map(fn => fn(kw, card)).join('|');
const itRegex = (kw, card) => new RegExp(itRegexSource(kw, card), 'i');

const theyPatterns = [
    'Creatures',
    'All .*? creatures',
    '(Each )?.*?( or .*?)? you control'
];
const theyRegex = new RegExp(theyPatterns.join('|'), 'i');

export function getTarget(str, kw, card) {
    if (str.match(itRegex(kw, card))) return 'It';
    if (str.match(theyRegex)) return 'They';
    return `This ${card.getThisType()}`;
}

export function targetToObject(target, type) {
    if (target === 'They') return 'them';
    if (target === 'It') return 'it';
    return 'that ' + (type || 'permanent');
}

export function targetSpell(target) {
    if (target === 'It') return 'That spell';
    if (target === 'They') return 'Those spells';
    return 'This spell';
}

export function targetCard(target) {
    if (target === 'It') return 'That card';
    if (target === 'They') return 'Those cards';
    return 'This card';
}

export function targetWith(target, name) {
    if (target === 'They') return `A creature with ${name}`;
    return target;
}