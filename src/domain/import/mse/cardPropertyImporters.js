import { ActivationCost, ManaCost } from 'mana-scribe';
import { getJoinedPath } from '../../../shared/neutralinoAdapter.js';
import { loadImageFile } from '../../../shared/fsUtils.js';
import ImageFieldValue from '../../card/ImageFieldValue.js';

/**
 * Removes HTML tags from the input string, preserving the text in the tags.
 *
 * @param {string} str
 * @returns {string}
 */
function stripTags(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '');
}

function convertSymbols(str) {
    if (!str) return '';
    return str.replace(/<sym-auto>([^<]+)<\/sym-auto>/g, (match, g1) => {
        return ActivationCost.parse(g1).toString(true);
    });
}

const knownColors = ['white', 'blue', 'black', 'red', 'green'];

export default {
    notes: (value, cmCard) => cmCard.notes = stripTags(value),
    card_color: (value, cmCardFace) => {
        cmCardFace.colorOverride = value.split(', ').filter(color => {
            return knownColors.includes(color);
        });
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
    rarity: (value, cmCardFace) => cmCardFace.rarity = value,
    rule_text: (value, cmCardFace) => {
        cmCardFace.rulesText = stripTags(convertSymbols(value));
    },
    flavor_text: (value, cmCardFace) => {
        cmCardFace.flavorText = stripTags(convertSymbols(value));
    },
    power: (value, cmCardFace) => cmCardFace.power = value,
    toughness: (value, cmCardFace) => cmCardFace.toughness = value,
};
