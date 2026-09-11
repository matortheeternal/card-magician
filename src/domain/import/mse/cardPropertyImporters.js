import { ActivationCost, ManaCost } from 'mana-scribe';
import ImageFieldValue from '../../card/ImageFieldValue.js';
import faceSymbolMap from './faceSymbolMap.js';

/**
 * Removes XML tags from the input string, preserving the text in the tags.
 *
 * @param {string} str
 * @returns {string}
 */
function stripTags(str) {
    if (!str) return '';
    return str.replaceAll(/<[^>]*>/g, '');
}

function convertSymbols(str) {
    if (!str) return '';
    const expr = /<sym(?:-auto)?>([^<]+)<\/sym(?:-auto)?>/g;
    return str.replaceAll(expr, (match, g1) => {
        return ActivationCost.parse(g1).toString(true);
    }).replaceAll('–', '-');
}

const colorSymbols = {
    white: 'w',
    blue: 'u',
    black: 'b',
    red: 'r',
    green: 'g',
    colorless: 'c',
    artifact: 'a',
    land: 'l',
    hybrid: 'h',
    multicolor: 'm'
};

const rarity = {
    'basic land': 'land',
    common: 'common',
    uncommon: 'uncommon',
    rare: 'rare',
    'mythic rare': 'mythic',
    special: 'special',
    masterpiece: 'special',
};

const levelKeys = [
    'level_1_text',
    'level_2_text',
    'level_3_text',
    'level_4_text',
    'level_5_text',
    'level_6_text',
];

export function combineLevelText(mseCard) {
    const text = [];
    for (const key of levelKeys) {
        if (!Object.hasOwn(mseCard, key)) break;
        const value = stripTags(convertSymbols(mseCard[key]));
        text.push(value);
    }
    return text;
}

export const tokenPropImporters = {
    casting_cost: (value, cmCardFace) => {
        const cost = ManaCost.parse(value);
        cmCardFace.colorOverride = cost.colors.map(c => c.toLowerCase());
    },
};

export default {
    notes: (value, cmCard) => cmCard.notes = stripTags(value),
    card_color: (value, cmCardFace) => {
        cmCardFace.colorOverride = value.split(', ')
            .map(key => colorSymbols[key])
            .filter(Boolean);
    },
    name: (value, cmCardFace) => cmCardFace.name = value,
    casting_cost: (value, cmCardFace) => {
        cmCardFace.manaCost = ManaCost.parse(value);
    },
    image: async (value, cmCardFace, adapter) => {
        const blob = await adapter.getImage(value);
        cmCardFace.artImage = await ImageFieldValue.fromFile(blob);
    },
    super_type: (value, cmCardFace) => {
        cmCardFace.superType = stripTags(value).trimEnd();
    },
    sub_type: (value, cmCardFace) => {
        cmCardFace.subType = stripTags(value).trimEnd();
    },
    rarity: (value, cmCardFace) => cmCardFace.rarity = rarity[value] || 'common',
    rule_text: (value, cmCardFace) => {
        cmCardFace.rulesText = stripTags(convertSymbols(value));
    },
    flavor_text: (value, cmCardFace) => {
        cmCardFace.flavorText = stripTags(convertSymbols(value));
    },
    power: (value, cmCardFace) => cmCardFace.power = value,
    toughness: (value, cmCardFace) => cmCardFace.toughness = value,
    transformation: (value, cmCardFace) => {
        const lastOption = value.split(', ').pop();
        cmCardFace.faceSymbol = faceSymbolMap[lastOption] || 'autodetect';
    },
};
