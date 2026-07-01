import { ActivationCost, ManaCost } from 'mana-scribe';
import { getJoinedPath } from '../../../shared/neutralinoAdapter.js';
import { loadImageFile } from '../../../shared/fsUtils.js';
import ImageFieldValue from '../../card/ImageFieldValue.js';

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
    });
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
    'basic land': 'common',
    common: 'common',
    uncommon: 'uncommon',
    rare: 'rare',
    'mythic rare': 'mythic',
    special: 'special',
    masterpiece: 'mythic',
};

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
    image: async (value, cmCardFace, folderPath) => {
        const imagePath = await getJoinedPath(folderPath, value);
        const blob = await loadImageFile(imagePath);
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
};
