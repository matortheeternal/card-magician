export const KEYWORDS = [
    'Flying',
    'Trample',
    'Vigilance',
    'Indestructible',
    'Deathtouch',
    'Lifelink',
    'Haste',
    'Ward',
    'Station',
    'Level up'
].join('|');

export const ABILITY_WORDS = [
    'Landfall',
    'Raid',
    'Metalcraft',
    'Morbid',
    'Revolt',
    'Delirium'
].join('|');

export const TYPES = [
    'artifacts?',
    'enchantments?',
    'planeswalkers?',
    'creatures?',
    'instants?',
    'sorcer(y|ies)',
    'tokens?',
    'lands?',
    'legendary',
    'snow',
    'permanents?',
    'spells?',
    'cards?',
].join('|');

export const CHAPTERS = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'
].join('|');

export const MACROS = [
    '@',
    '~',
    '#("[^"]+"|[^,\\s]+)(,("[^"]+"|[^,\\s]+))*',
    '#',
].join('|');
