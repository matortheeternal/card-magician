import CardInspection from '../CardInspection.js';
import { TEMPLATING } from '../categories.js';
import { hasRulesText } from '../faceTraits.js';
import parsedRules from '../parsedRules.js';
import unrecognizedRanges from '../../unrecognizedRanges.js';

const L = localize('game-magic');

export default class UnrecognizedText extends CardInspection {
    constructor() {
        super({
            id: 'unrecognized-text',
            title: L`Unrecognized rules text`,
            category: TEMPLATING,
            description: L`Rules text the Oracle parser can't read as Magic templating.`
        });
    }

    findingFor(face, card) {
        if (!hasRulesText(face)) return null;
        const parsed = parsedRules(face, card);
        const [range] = unrecognizedRanges(parsed);
        if (!range) return null;
        const text = parsed.locator.source.slice(range.start, range.end);
        return L`Unrecognized text: “${text}”`;
    }
}
