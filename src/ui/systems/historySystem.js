import { executeAction } from './actionSystem.js';
import ImageFieldValue from '../../domain/card/ImageFieldValue.js';

const L = localize('history-system');
const report = createReporter({ unit: 'HistorySystem', label: L`History` });
const MERGE_THRESHOLD = 10 * 1000;

let lock = Promise.resolve();
let past = [];
let future = [];

function getPreviousAction() {
    return past.length > 0
        ? past[past.length - 1]
        : null;
}

function canCombine(action, card, detail) {
    if (!action) return false;
    const timeSinceLastAction = Date.now() - action.timestamp;
    if (timeSinceLastAction > MERGE_THRESHOLD) return false;
    return action.card === card
        && action.fieldId === detail.fieldId
        && action.modelKey === detail.modelKey
        && action.faceId === detail.faceId;
}

function copyValue(value) {
    return value instanceof ImageFieldValue
        ? value.clone()
        : structuredClone(value);
}

function combine(action, card, detail) {
    if (!canCombine(action, card, detail)) return;
    action.newValue = copyValue(detail.newValue);
    action.timestamp = Date.now();
    return action;
}

function create(card, detail) {
    const action = { card, ...detail, timestamp: Date.now() };
    past.push(action);
    return action;
}

function canUndo(event) {
    return Boolean(event.detail?.fieldId)
        && Boolean(event.detail?.faceId);
}

async function withLock(callback) {
    const operation = lock.then(callback);
    lock = operation.catch(() => {});
    return operation;
}

// TODO: card deletion, card creation
export function push(card, event) {
    if (!canUndo(event)) return;
    const detail = {
        ...event.detail,
        oldValue: copyValue(event.detail.oldValue),
        newValue: copyValue(event.detail.newValue),
    };
    return withLock(() => {
        future = [];
        const previousAction = getPreviousAction();
        return combine(previousAction, card, detail) || create(card, detail);
    });
}

function resolveModel(card, action) {
    const face = card[action.faceId];
    return action.modelKey ? face[action.modelKey] : face;
}

function updateCard(card, action, value) {
    const model = resolveModel(card, action);
    model[action.fieldId] = copyValue(value);
    changed(model, action.fieldId);
}

function getSetValueCallback(action) {
    return async value => {
        const isSelected = selectedProjectCard === action.card;
        if (isSelected) updateCard(activeEditorCard, action, value);
        updateCard(action.card, action, value);
        try {
            executeAction('set-status', 'saving');
            await action.card.save();
            executeAction('set-status', 'saved');
            return true;
        } catch (error) {
            report('setValue', error, [action]);
            executeAction('set-status', 'failed');
            return false;
        }
    };
}

async function revert(action) {
    const setValue = getSetValueCallback(action);
    return await setValue(action.oldValue);
}

export async function undo() {
    await withLock(async () => {
        const previousAction = getPreviousAction();
        if (!previousAction) return;
        if (!await revert(previousAction)) return;
        past.pop();
        future.push(previousAction);
    });
}

async function apply(action) {
    const setValue = getSetValueCallback(action);
    return await setValue(action.newValue);
}

function getNextAction() {
    return future.length > 0
        ? future[future.length - 1]
        : null;
}

export async function redo() {
    await withLock(async () => {
        const nextAction = getNextAction();
        if (!nextAction) return;
        if (!await apply(nextAction)) return;
        future.pop();
        past.push(nextAction);
    });
}

export async function reset() {
    await withLock(() => {
        future = [];
        past = [];
    });
}
