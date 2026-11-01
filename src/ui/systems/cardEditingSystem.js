/** Save the editor being left before changing its selected card. */
export async function flushPendingCardSaves() {
    await document.querySelector('cm-card-form')?.save.flush();
    await document.querySelector('cm-card-properties')?.save.flush();
}

/** Finish selection updates and edits before changing card membership. */
export async function flushPendingCardEdits() {
    await document.querySelector('cm-set-view')?.flushSelection();
    await flushPendingCardSaves();
}
