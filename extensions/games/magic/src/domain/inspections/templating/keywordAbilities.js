import parsedRules from '../parsedRules.js';
import { hasRulesText } from '../faceTraits.js';

export default function keywordAbilities(face, card) {
    if (!hasRulesText(face)) return [];
    const { abilities } = parsedRules(face, card).text;
    return abilities.filter(ability => ability.keywords?.names?.length);
}
