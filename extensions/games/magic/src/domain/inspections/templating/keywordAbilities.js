import locatedAbilities from '../locatedAbilities.js';
import { hasRulesText } from '../faceTraits.js';

export default function keywordAbilities(face, card) {
    if (!hasRulesText(face)) return [];
    return [...locatedAbilities(face, card)]
        .filter(({ ability }) => ability.keywords?.names?.length);
}
