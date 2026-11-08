export function countRulesWords(text = '') {
    const plain = String(text)
        .replace(/\{[^{}]*}/g, ' ')
        .replace(/CARDNAME|LEGENDNAME|~|@/g, 'cardname')
        .replace(/[_*]/g, '');
    return (plain.match(/[\p{L}\p{N}]+(?:['’\/-][\p{L}\p{N}]+)*/gu) || []).length;
}

export function creatureTypes(face) {
    if (!/\bcreature\b/i.test(face.superType || '')) return [];
    const types = String(face.subType || '').trim()
        .replace(/\btime\s+lord\b/gi, 'Time\u0000Lord')
        .split(/\s+/).filter(Boolean)
        .map(type => type.replace('\u0000', ' ').toLowerCase()
            .replace(/(^|[- ])[a-z]/g, letter => letter.toUpperCase()));
    const results = types.length ? types : ['No creature type'];
    return [...new Set(results)];
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
    return value < 20 ? 1 : Math.min(200, Math.floor(value / 20) * 20);
}

function getWordCountCategoryLabel(id) {
    if (id === 0) return '0';
    if (id === 200) return '200+';
    const max = id === 1 ? 19 : id + 19;
    return `${id}–${max}`;
}

export function wordCountCategories(records) {
    let max = 0;
    for (const record of records)
        max = Math.max(max, wordCountBucket(record.wordCount));
    const values = [0];
    if (max > 0) values.push(1);
    for (let value = 20; value <= max; value += 20)
        values.push(value);

    return values.map(id => ({
        id,
        label: getWordCountCategoryLabel(id)
    }));
}
