import rulesRange from '../rulesRange.js';
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

    findingsFor(face, card) {
        if (!hasRulesText(face)) return [];
        const parsed = parsedRules(face, card);
        const { source } = parsed.locator;
        return unrecognizedRanges(parsed).map(range => ({
            message: source.slice(range.start, range.end),
            location: rulesRange(range, 'underline')
        }));
    }
}
