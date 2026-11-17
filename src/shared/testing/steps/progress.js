import { eventually } from '../testUtils.js';

export async function finishProgress(operation) {
    const modal = await eventually(() => {
        return document.querySelector('cm-progress-modal.done, cm-progress-modal.error');
    }, { timeout: 20000 });
    expect(modal.matches('.done')).withContext(`${operation} finished without errors`)
        .toBeTrue();
    modal.querySelector('[data-click-action="close"]').click();
}
