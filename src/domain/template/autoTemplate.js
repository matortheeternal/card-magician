export const AUTO_TEMPLATE = 'auto';

const matchFields = ['superType', 'subType'];
const whitespace = /\s+/u;

export function isAutoTemplateField(fieldId) {
    return matchFields.includes(fieldId);
}

function getWords(value) {
    return new Set(String(value ?? '').toLowerCase().split(whitespace));
}

function getMatchScore(rule, face) {
    if (!rule || Object.keys(rule).some(key => !isAutoTemplateField(key))) return 0;
    let score = 0;
    for (const [field, required] of Object.entries(rule)) {
        if (!Array.isArray(required) || !required.length) return 0;
        const words = getWords(face[field]);
        const terms = new Set(required.map(term => String(term).trim().toLowerCase()));
        if (terms.has('') || [...terms].some(term => !words.has(term))) return 0;
        score += terms.size;
    }
    return score;
}

export function matchAutoTemplate(templates, face) {
    let bestScore = 0;
    let best;
    for (const template of templates) {
        const score = getMatchScore(template.autoMatch, face);
        if (!score || score < bestScore) continue;
        if (score === bestScore && template.id >= best.id) continue;
        bestScore = score;
        best = template;
    }
    return best;
}
