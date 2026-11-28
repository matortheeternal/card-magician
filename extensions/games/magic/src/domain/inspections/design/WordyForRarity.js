import rulesRange from '../rulesRange.js';
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

    findingsFor(face) {
        const rarity = rarityOf(face);
        const limit = WORD_LIMITS[rarity];
        if (!limit) return [];
        const text = face.rulesText ?? '';
        const words = countRulesWords(withoutReminderText(text));
        if (words <= limit) return [];
        const message = L`${words} words of rules text at ${rarity}.`;
        return [{ message, location: rulesRange({ start: 0, end: text.length }) }];
    }
}
