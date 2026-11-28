const ARCHETYPE_TEMPLATE = 'magic/M20/Archetypes';
const AD_RARITY = 'ad';

export const eligibilityFields = ['template', 'rarity'];

export function getCardFaces(card) {
    return [card?.front, card?.back].filter(Boolean);
}

export function getFaceModels(face) {
    const subcards = face.subcards ?? Object.values(face)
        .filter(value => typeof value?.rulesText === 'string');
    return [face, ...subcards];
}

function isExcludedFace(face) {
    return face.template === ARCHETYPE_TEMPLATE || face.rarity === AD_RARITY;
}

export function isOracleCard(card) {
    return !getCardFaces(card).some(isExcludedFace);
}
