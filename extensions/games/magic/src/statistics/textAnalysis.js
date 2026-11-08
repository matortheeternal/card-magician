const SYMBOL_PATTERN = /\{[^{}]*}/g;
const CARD_NAME_PATTERN = /CARDNAME|LEGENDNAME|~|@/g;
const FORMATTING_PATTERN = /[_*]/g;
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’\/-][\p{L}\p{N}]+)*/gu;
const CREATURE_PATTERN = /\bcreature\b/i;
const TIME_LORD_PATTERN = /\btime\s+lord\b/gi;
const CAPITALIZATION_PATTERN = /(^|[- ])[a-z]/g;
const TIME_LORD_TOKEN = 'Time\u0000Lord';
const WORD_BUCKET_WIDTH = 20;
const MAX_WORD_BUCKET = 200;

export function countRulesWords(text = '') {
    const plain = String(text)
        .replace(SYMBOL_PATTERN, ' ')
        .replace(CARD_NAME_PATTERN, 'cardname')
        .replace(FORMATTING_PATTERN, '');
    return (plain.match(WORD_PATTERN) || []).length;
}

function normalizeSubtype(type) {
    return type.replace('\u0000', ' ').toLowerCase()
        .replace(CAPITALIZATION_PATTERN, letter => letter.toUpperCase());
}

export function creatureTypes(face) {
    if (!CREATURE_PATTERN.test(face.superType || '')) return [];
    const types = String(face.subType || '').trim()
        .replace(TIME_LORD_PATTERN, TIME_LORD_TOKEN)
        .split(/\s+/).filter(Boolean)
        .map(normalizeSubtype);
    const results = types.length ? types : ['No creature type'];
    return [...new Set(results)];
}

export function nonCreatureSubtypes(face) {
    if (CREATURE_PATTERN.test(face.superType || '')) return [];
    const types = String(face.subType || '').trim().split(/\s+/).filter(Boolean);
    return [...new Set(types.map(normalizeSubtype))];
}

export function median(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function max(values) {
    return values.length ? Math.max(...values) : null;
}

export function average(values) {
    if (!values.length) return null;
    return values.reduce(
        (sum, value) => sum + value, 0
    ) / values.length;
}

export function wordCountBucket(value) {
    if (value === 0) return 0;
    if (value < WORD_BUCKET_WIDTH) return 1;
    return Math.min(
        MAX_WORD_BUCKET,
        Math.floor(value / WORD_BUCKET_WIDTH) * WORD_BUCKET_WIDTH
    );
}

function getWordCountCategoryLabel(id) {
    if (id === 0) return '0';
    if (id === MAX_WORD_BUCKET) return `${MAX_WORD_BUCKET}+`;
    const max = id === 1 ? WORD_BUCKET_WIDTH - 1 : id + WORD_BUCKET_WIDTH - 1;
    return `${id}–${max}`;
}

export function wordCountCategories(records) {
    let max = 0;
    for (const record of records)
        max = Math.max(max, wordCountBucket(record.wordCount));
    const values = [0];
    if (max > 0) values.push(1);
    for (let value = WORD_BUCKET_WIDTH; value <= max; value += WORD_BUCKET_WIDTH)
        values.push(value);

    return values.map(id => ({
        id,
        label: getWordCountCategoryLabel(id)
    }));
}
