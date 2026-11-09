const LEGENDARY_PATTERN = /\blegendary\b/i;
const VEHICLE_PATTERN = /\bvehicle\b/i;
const SNOW_PATTERN = /\bsnow\b/i;
const CONSPIRACY_PATTERN = /\bconspiracy\b/i;
const TOKEN_PATTERN = /\btoken\b/i;
const EMBLEM_PATTERN = /\bemblem\b/i;
const BASIC_LAND_PATTERN = /\bbasic land\b/i;
const PERMANENT_PATTERN = /\b(artifact|battle|creature|enchantment|land|planeswalker)\b/i;
const TRIBAL_PATTERN = /\btribal\b/i;

export const CARD_TYPES = [
    'Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment',
    'Land', 'Planeswalker', 'Battle', 'Kindred', 'Other'
];
const CARD_TYPE_PATTERNS = new Map(CARD_TYPES.filter(type => type !== 'Other')
    .map(type => [type, new RegExp(`\\b${type}\\b`, 'i')]));
const BASIC_LAND_COLORS = [
    ['plains', 'w'], ['island', 'u'], ['swamp', 'b'],
    ['mountain', 'r'], ['forest', 'g']
].map(([type, color]) => ({ pattern: new RegExp(`\\b${type}\\b`, 'i'), color }));

function hasCardType(face, type) {
    return CARD_TYPE_PATTERNS.get(type).test(face.superType ?? '');
}

export function isLegendary(face) {
    return LEGENDARY_PATTERN.test(face.superType ?? '');
}

export function isLand(face) {
    return hasCardType(face, 'Land');
}

export function isCreature(face) {
    return hasCardType(face, 'Creature');
}

export function isArtifact(face) {
    return hasCardType(face, 'Artifact');
}

export function isEnchantment(face) {
    return hasCardType(face, 'Enchantment');
}

export function isVehicle(face) {
    return VEHICLE_PATTERN.test(face.subType ?? '');
}

export function isSnow(face) {
    return SNOW_PATTERN.test(face.superType ?? '');
}

export function isConspiracy(face) {
    return CONSPIRACY_PATTERN.test(face.superType ?? '');
}

export function isToken(face) {
    return TOKEN_PATTERN.test(face.superType ?? '');
}

export function isEmblem(face) {
    return EMBLEM_PATTERN.test(face.superType ?? '');
}

export function isBasicLand(face) {
    return BASIC_LAND_PATTERN.test(face.superType ?? '');
}

export function isPermanent(face) {
    return PERMANENT_PATTERN.test(face.superType ?? '');
}

export function getCardTypes(face) {
    const types = [...CARD_TYPE_PATTERNS.keys()]
        .filter(type => hasCardType(face, type));
    if (TRIBAL_PATTERN.test(face.superType ?? '') && !types.includes('Kindred'))
        types.push('Kindred');
    return types.length ? types : ['Other'];
}

export function getImplicitLandSymbols(face) {
    if (!isLand(face)) return [];
    return BASIC_LAND_COLORS.filter(({ pattern }) => pattern.test(face.subType ?? ''))
        .map(({ color }) => ({ colors: [color] }));
}
