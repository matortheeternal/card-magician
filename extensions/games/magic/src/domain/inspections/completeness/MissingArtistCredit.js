import CardInspection from '../CardInspection.js';
import { COMPLETENESS } from '../categories.js';
import { hasArt, isBlank } from '../faceTraits.js';

const L = localize('game-magic');

export default class MissingArtistCredit extends CardInspection {
    constructor() {
        super({
            id: 'missing-artist-credit',
            title: L`Art used without credit`,
            field: 'illustrator',
            category: COMPLETENESS,
            description: L`It is considerate to provide a source for the artwork you use.`
        });
    }

    findingFor(face, card, project) {
        if (!hasArt(face)) return null;
        if (!isBlank(face.illustrator) || !isBlank(project?.illustrator)) return null;
        return this.description;
    }
}
