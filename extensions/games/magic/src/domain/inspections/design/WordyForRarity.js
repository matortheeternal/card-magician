import CardInspection from '../CardInspection.js';
import { DESIGN } from '../categories.js';
import { rarityOf, withoutReminderText } from '../faceTraits.js';
import { countRulesWords } from '../../../statistics/textAnalysis.js';

const L = localize('game-magic');
const DESCRIPTION = L`Commons over 50 words or uncommons over 70, without reminder text.`;
const WORD_LIMITS = { common: 50, uncommon: 70 };

export default class WordyForRarity extends CardInspection {
    constructor() {
        super({
            id: 'wordy-for-rarity',
            title: L`Rules text long for its rarity`,
            category: DESIGN,
            description: DESCRIPTION
        });
    }

    findingFor(face) {
        const limit = WORD_LIMITS[rarityOf(face)];
        const words = countRulesWords(withoutReminderText(face.rulesText));
        if (!limit || words <= limit) return null;
        return L`${words} words of rules text at ${rarityOf(face)}.`;
    }
}
