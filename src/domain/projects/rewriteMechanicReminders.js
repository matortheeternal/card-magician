import { flushPendingCardEdits } from '../../ui/systems/cardEditingSystem.js';
import { setActiveEditorCard } from './projectManager.js';

const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;
const PARAMETER = '(?: (?:\\{[^}]+\\})+| (?:\\d+|X))?';
const QUALIFIER = '(?: until end of turn)?';
const KEYWORD_BOUNDARY = /(?<![\w'-])/;

function reminderMatcher(name, text) {
    const keyword = name.replace(REGEX_SPECIAL, '\\$&');
    const reminder = text.replace(REGEX_SPECIAL, '\\$&');
    return new RegExp(
        `${KEYWORD_BOUNDARY.source}(${keyword}${PARAMETER}${QUALIFIER}\\.?)`
        + `[ \\t]+\\(${reminder}\\)`, 'gi'
    );
}

function cardFaces(card) {
    return [card.front, card.back].filter(Boolean).flatMap(face => [
        face, ...Object.values(face).filter(value => typeof value?.rulesText === 'string')
    ]);
}

async function updateCard(card, pattern, replacement) {
    const updates = [];
    for (const face of cardFaces(card)) {
        const { rulesText } = face;
        const text = rulesText?.replace(pattern, (_, prefix) =>
            replacement ? `${prefix} (${replacement})` : prefix);
        if (text === rulesText) continue;
        updates.push({ face, rulesText });
        face.rulesText = text;
    }
    if (!updates.length) return false;
    try {
        await card.save();
        return true;
    } catch (error) {
        for (const { face, rulesText } of updates) face.rulesText = rulesText;
        throw error;
    }
}

export async function rewriteMechanicReminders(project, name, oldText, replacement) {
    await flushPendingCardEdits();
    if (window.activeProject !== project) return false;
    const pattern = reminderMatcher(name, oldText);
    let refresh = false;
    try {
        for (const card of project.cards) {
            const updated = await updateCard(card, pattern, replacement);
            refresh ||= updated && card === window.selectedProjectCard;
        }
    } finally {
        if (refresh && window.activeProject === project)
            await setActiveEditorCard(window.selectedProjectCard);
    }
    changed(project, 'cards');
    return true;
}
