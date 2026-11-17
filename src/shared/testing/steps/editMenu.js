import * as history from '../../../ui/systems/historySystem.js';
import { executeAction } from '../../../ui/systems/actionSystem.js';
import { waitForCardUpdates } from '../testUtils.js';

export function undo() {
    return history.undo();
}

export function redo() {
    return history.redo();
}

export function copy() {
    return executeAction('copy');
}

export async function paste() {
    await executeAction('paste');
    await waitForCardUpdates();
}

export function deleteSelectedCards() {
    return executeAction('delete-selected-cards');
}

export async function duplicateSelectedCards() {
    await executeAction('duplicate-selected-cards');
    await waitForCardUpdates();
}

export function filterCards(text) {
    return executeAction('filter', text);
}
