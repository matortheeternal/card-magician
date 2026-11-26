import { autodetectMechanics } from './projectMechanics.js';

const STATIC = 'Whenever this creature becomes blocked, draw a card.';
const GRANTED = 'Whenever it becomes blocked, draw a card.';

function project(customKeywords = []) {
    const rulesText = `Retreat (${STATIC})\n`
        + `Target creature gains retreat until end of turn. (${GRANTED})`;
    return { customKeywords, cards: [{ name: 'Fall Back', front: { rulesText } }] };
}

function detect(customKeywords) {
    const entries = customKeywords.map(definition => ({ kind: 'keywords', definition }));
    const [entry] = autodetectMechanics(project(customKeywords), null, entries);
    return entry.definition.reminderTypes;
}

describe('mechanic autodetection reminder types', () => {
    it('types newly discovered reminders by where they were printed', () => {
        expect(detect([])).toEqual({ [STATIC]: 'static', [GRANTED]: 'granted' });
    });

    it('keeps reminder types the designer already chose', () => {
        const saved = { name: 'Retreat', reminders: [STATIC, GRANTED],
            reminderTypes: { [GRANTED]: 'anthem' } };
        expect(detect([saved])).toEqual({ [STATIC]: 'static', [GRANTED]: 'anthem' });
    });
});
