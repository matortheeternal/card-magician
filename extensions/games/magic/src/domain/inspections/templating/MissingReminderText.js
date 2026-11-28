import rulesRange from '../rulesRange.js';
import CardInspection from '../CardInspection.js';
import { TEMPLATING, REMINDER_TEXT } from '../categories.js';
import { rarityOf } from '../faceTraits.js';
import keywordAbilities from './keywordAbilities.js';
import { isEvergreen } from './evergreenKeywords.js';

const L = localize('game-magic');

function unexplainedKeyword(ability) {
    if (ability.reminders.length) return null;
    return ability.keywords.names.find(keyword => !isEvergreen(keyword)) ?? null;
}

export default class MissingReminderText extends CardInspection {
    constructor() {
        super({
            id: 'missing-reminder-text',
            title: L`Commons without keyword reminder text`,
            category: TEMPLATING,
            group: REMINDER_TEXT,
            description: L`Commons with non-evergreen keywords that lack reminder text.`
        });
    }

    findingsFor(face, card) {
        if (rarityOf(face) !== 'common') return [];
        const findings = [];
        for (const { ability, range } of keywordAbilities(face, card)) {
            const keyword = unexplainedKeyword(ability);
            if (!keyword) continue;
            const name = keyword[0].toUpperCase() + keyword.slice(1);
            findings.push({
                message: L`${name} is missing reminder text.`,
                location: rulesRange(range)
            });
        }
        return findings;
    }
}
