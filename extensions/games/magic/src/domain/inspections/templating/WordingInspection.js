import rulesRange from '../rulesRange.js';
import CardInspection from '../CardInspection.js';
import { TEMPLATING, OUTDATED_WORDING } from '../categories.js';

const L = localize('game-magic');

export default class WordingInspection extends CardInspection {
    constructor({ pattern, replacement, fix, ...metadata }) {
        const resolution = fix ? L`Update wording` : null;
        super({ category: TEMPLATING, group: OUTDATED_WORDING, resolution, ...metadata });
        this.pattern = pattern;
        this.replacement = replacement;
        this.fix = fix;
    }

    findingsFor(face) {
        const pattern = new RegExp(this.pattern.source, this.pattern.flags + 'g');
        return Array.from((face.rulesText ?? '').matchAll(pattern), match =>
            this.wordingFinding(match));
    }

    wordingFinding(match) {
        const [expected] = match;
        const start = match.index;
        const location = rulesRange({ start, end: start + expected.length });
        const preferred = this.replacement;
        const message = L`“${expected}” is now written “${preferred}”.`;
        const replacement = this.fix?.(expected);
        const resolution = replacement && {
            type: 'replace',
            label: L`Replace with “${replacement}”`,
            expected, replacement
        };
        return { message, location, resolution };
    }
}
