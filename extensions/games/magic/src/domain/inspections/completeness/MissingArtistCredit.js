import CardInspection from '../CardInspection.js';
import { COMPLETENESS } from '../categories.js';
import { hasArt, isBlank } from '../faceTraits.js';

const L = localize('game-magic');

export default class MissingArtistCredit extends CardInspection {
    constructor() {
        super({
            id: 'missing-artist-credit',
            title: L`Art without an artist credit`,
            category: COMPLETENESS,
            description: L`Cards with art but no illustrator on the card or the project.`
        });
    }

    findingFor(face, card, project) {
        if (!hasArt(face)) return null;
        if (!isBlank(face.illustrator) || !isBlank(project?.illustrator)) return null;
        return L`Art has no artist credit.`;
    }
}
