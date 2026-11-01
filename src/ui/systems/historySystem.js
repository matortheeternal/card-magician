import { executeAction } from './actionSystem.js';

const L = localize('history-system');
const report = createReporter({ unit: 'HistorySystem', label: L`History` });

const past = [];
const future = [];

function getPreviousAction() {
    return past.length > 0
        ? past[past.length - 1]
        : null;
}

function canCombine(action, card, event) {
    if (!action) return false;
    return action.card === card
        && action.fieldId === event.detail.fieldId
        && action.modelKey === event.detail.modelKey
        && action.faceId === event.detail.faceId;
}

function combine(action, card, event) {
    if (!canCombine(action, card, event)) return;
    action.newValue = event.detail.newValue;
    return action;
}

function create(card, event) {
    const action = { card, ...event.detail, timestamp: Date.now() };
    past.push(action);
    return action;
}

// TODO: card deletion, card creation
export function push(card, event) {
    const previousAction = getPreviousAction();
    return combine(previousAction, card, event) || create(card, event);
}

function resolveModel(card, action) {
    const face = card[action.faceId];
    return action.modelKey ? face[action.modelKey] : face;
}

function updateCard(card, action, value) {
    const model = resolveModel(card, action);
    model[action.fieldId] = value;
    changed(model, action.fieldId);
}

function getSetValueCallback(action) {
    return value => {
        const isSelected = selectedProjectCard === action.card;
        if (isSelected) updateCard(activeEditorCard, action, value);
        updateCard(action.card, action, value);
        try {
            executeAction('set-status', 'saving');
            action.card.save();
            executeAction('set-status', 'saved');
        } catch (error) {
            report('setValue', error, [action]);
            executeAction('set-status', 'failed');
        }
    };
}

function revert(action) {
    const setValue = getSetValueCallback(action);
    setValue(action.oldValue);
}

export function undo() {
    const previousAction = getPreviousAction();
    if (!previousAction) return;
    revert(previousAction);
    past.pop();
    future.push(previousAction);
}

function apply(action) {
    const setValue = getSetValueCallback(action);
    setValue(action.newValue);
}

function getNextAction() {
    return future.length > 0
        ? future[future.length - 1]
        : null;
}

export function redo() {
    const nextAction = getNextAction();
    if (!nextAction) return;
    apply(nextAction);
    future.pop();
    past.push(nextAction);
}
