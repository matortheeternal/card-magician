import CardInspection from '../CardInspection.js';
import { TEMPLATING, REMINDER_TEXT } from '../categories.js';
import keywordAbilities from './keywordAbilities.js';
import { isEvergreen } from './evergreenKeywords.js';

const L = localize('game-magic');

function explainsOnlyEvergreen(ability) {
    return ability.reminders.length > 0 && ability.keywords.names.every(isEvergreen);
}

export default class UnneededReminderText extends CardInspection {
    constructor() {
        super({
            id: 'unneeded-reminder-text',
            title: L`Reminder text on evergreen keywords`,
            category: TEMPLATING,
            group: REMINDER_TEXT,
            description: L`Evergreen keywords such as flying that carry reminder text.`
        });
    }

    findingFor(face, card) {
        const ability = keywordAbilities(face, card).find(explainsOnlyEvergreen);
        if (!ability) return null;
        return L`${ability.keywords.names.join(', ')} doesn't need reminder text.`;
    }
}
