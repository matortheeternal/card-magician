import rulesRange from '../rulesRange.js';
import CardInspection from '../CardInspection.js';
import { TEMPLATING, REMINDER_TEXT } from '../categories.js';
import keywordAbilities from './keywordAbilities.js';
import { isEvergreen } from './evergreenKeywords.js';

const L = localize('game-magic');
const PARENTHETICAL = /[ \t]*\(([^()]*)\)/g;

function reminderFinding(text, ability, range, label) {
    const keywords = ability.keywords.names.join(', ');
    const message = L`${keywords} doesn't need reminder text.`;
    if (!range) return { message, location: rulesRange(null) };
    const end = text.indexOf('\n', range.end);
    const line = text.slice(range.start, end < 0 ? text.length : end);
    const matches = [...line.matchAll(PARENTHETICAL)]
        .filter(match => ability.reminders.includes(match[1]));
    if (matches.length !== 1) return { message, location: rulesRange(range) };
    const [match] = matches;
    const start = range.start + match.index;
    const expected = match[0];
    return {
        message,
        location: rulesRange({ start, end: start + expected.length }),
        resolution: { type: 'replace', label, expected, replacement: '' }
    };
}

function explainsOnlyEvergreen(ability) {
    return ability.reminders.length > 0 && ability.keywords.names.every(isEvergreen);
}

export default class UnneededReminderText extends CardInspection {
    constructor() {
        super({
            id: 'unneeded-reminder-text',
            title: L`Reminder text on evergreen keywords`,
            resolution: L`Remove reminder text`,
            category: TEMPLATING,
            group: REMINDER_TEXT,
            description: L`Evergreen keywords such as flying that carry reminder text.`
        });
    }

    findingsFor(face, card) {
        return keywordAbilities(face, card)
            .filter(({ ability }) => explainsOnlyEvergreen(ability))
            .map(({ ability, range }) =>
                reminderFinding(face.rulesText, ability, range, this.resolution));
    }
}
