const REMINDER_TEXT = /\([^()]*\)/g;

export function rarityOf(face) {
    return (face.rarity || 'common').toLowerCase();
}

export function hasRulesText(face) {
    return Boolean(face.rulesText?.trim());
}

export function hasArt(face) {
    return Boolean(face.artImage?.imageUrl);
}

export function withoutReminderText(text = '') {
    return text.replace(REMINDER_TEXT, '');
}

export function isBlank(value) {
    return !String(value ?? '').trim();
}
