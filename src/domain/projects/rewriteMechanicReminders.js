import { flushPendingCardEdits } from '../../ui/systems/cardEditingSystem.js';
import * as history from '../../ui/systems/historySystem.js';

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

function reminderChanges(card, pattern, replacement) {
    const changes = [];
    for (const face of cardFaces(card)) {
        const { rulesText } = face;
        const text = rulesText?.replace(pattern, (_, prefix) =>
            replacement ? `${prefix} (${replacement})` : prefix);
        if (text === rulesText) continue;
        changes.push({
            card, model: face, oldValues: { rulesText }, newValues: { rulesText: text }
        });
    }
    return changes;
}

export async function rewriteMechanicReminders(project, name, oldText, replacement) {
    await flushPendingCardEdits();
    if (window.activeProject !== project) return false;
    const pattern = reminderMatcher(name, oldText);
    const changes = project.cards.flatMap(card =>
        reminderChanges(card, pattern, replacement));
    if (!changes.length) return true;
    const event = new CustomEvent('cm-cards-edited', { detail: { changes } });
    return await history.execute(project, event) ?? false;
}
