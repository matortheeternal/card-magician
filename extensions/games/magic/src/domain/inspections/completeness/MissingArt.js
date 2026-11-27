import CardInspection from '../CardInspection.js';
import { COMPLETENESS } from '../categories.js';
import { hasArt } from '../faceTraits.js';

const L = localize('game-magic');

export default class MissingArt extends CardInspection {
    constructor() {
        super({
            id: 'missing-art',
            title: L`Cards without art`,
            category: COMPLETENESS,
            description: L`Cards with no art image yet.`,
            enabledByDefault: false
        });
    }

    findingFor(face) {
        return hasArt(face) ? null : L`Card has no art.`;
    }
}
