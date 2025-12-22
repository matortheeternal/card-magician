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

const thisGainsRegex = (card, kw) => `(This ${card.getThisType()} (has|gains) ${kw})`;
const cardTypeRegex = `((${cardTypes.join('|')}) ?)+`;
const thatGainsRegex = kw => `Target ${cardTypeRegex} gains ${kw}`;
const counterRegex = kw => `put a ${kw} counter`;
const itRegex = (kw, card) => new RegExp(`${thisGainsRegex(card, kw)}|${thatGainsRegex(kw)}|${counterRegex(kw)}`, 'i');

const theyRegex = /Creatures|All .*? creatures|.*? or .*? you control|.*? you control|Each .*? you control/i;

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