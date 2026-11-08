export async function flushPendingCardSaves() {
    await document.querySelector('cm-card-form')?.save.flush();
    await document.querySelector('cm-card-properties')?.save.flush();
}

export async function flushPendingCardEdits() {
    await document.querySelector('cm-card-list')?.flushSelection();
    await flushPendingCardSaves();
}
