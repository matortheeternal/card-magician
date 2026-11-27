import CardInspection from '../CardInspection.js';
import { TEMPLATING, OUTDATED_WORDING } from '../categories.js';

const L = localize('game-magic');

export default class WordingInspection extends CardInspection {
    constructor({ pattern, replacement, ...metadata }) {
        super({ category: TEMPLATING, group: OUTDATED_WORDING, ...metadata });
        this.pattern = pattern;
        this.replacement = replacement;
    }

    findingFor(face) {
        const [wording] = face.rulesText?.match(this.pattern) ?? [];
        if (!wording) return null;
        return L`“${wording}” is now written “${this.replacement}”.`;
    }
}
