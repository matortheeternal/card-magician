import CardInspection from '../CardInspection.js';
import { COMPLETENESS } from '../categories.js';
import { hasRulesText } from '../faceTraits.js';
import { isCreature, isLand } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');

export default class MissingRulesText extends CardInspection {
    constructor() {
        super({
            id: 'missing-rules-text',
            title: L`Cards without rules text`,
            category: COMPLETENESS,
            description: L`Noncreature, nonland cards with no rules text.`
        });
    }

    findingFor(face) {
        if (isCreature(face) || isLand(face) || hasRulesText(face)) return null;
        return L`Card has no rules text.`;
    }
}
