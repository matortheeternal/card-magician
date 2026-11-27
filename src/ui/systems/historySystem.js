import CardTemplateChange from './history/CardTemplateChange.js';
import CardFieldChange from './history/CardFieldChange.js';
import CardListChange from './history/CardListChange.js';
import CardBatchChange from './history/CardBatchChange.js';

const historyEntryClasses = [
    CardTemplateChange, CardFieldChange, CardListChange, CardBatchChange
];

let lock = Promise.resolve();
let past = [];
let future = [];

function getPreviousAction() {
    return past.length > 0
        ? past[past.length - 1]
        : null;
}

function findMatchingClass(event) {
    for (const HistoryEntryClass of historyEntryClasses) {
        if (HistoryEntryClass.supports(event))
            return HistoryEntryClass;
    }
}

async function withLock(callback) {
    const operation = lock.then(callback);
    lock = operation.catch(() => {});
    return operation;
}

function withPreparedEntry(entry, callback) {
    const preparation = entry.prepare();
    preparation.catch(() => {});
    return withLock(async () => {
        await preparation;
        return callback();
    });
}

export function push(card, event) {
    const HistoryEntryClass = findMatchingClass(event);
    if (!HistoryEntryClass) return;
    const entry = new HistoryEntryClass(card, event);
    return withPreparedEntry(entry, () => {
        future = [];
        const previousAction = getPreviousAction();
        const combined = previousAction?.combine(entry);
        if (!combined) past.push(entry);
    });
}

export function execute(target, event) {
    const Entry = findMatchingClass(event);
    if (!Entry) return;
    const entry = new Entry(target, event);
    return withPreparedEntry(entry, async () => {
        if (!await entry.replay()) return false;
        future = [];
        past.push(entry);
        return true;
    });
}

export async function undo() {
    await withLock(async () => {
        const previousAction = getPreviousAction();
        if (!previousAction) return;
        if (!await previousAction.revert()) return;
        past.pop();
        future.push(previousAction);
    });
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
        if (!await nextAction.replay()) return;
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
