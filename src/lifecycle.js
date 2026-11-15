import ExitManager from './shared/ExitManager.js';
import platform from './shared/platformAdapter.js';
import { getActiveModal, openModal } from './ui/modals/modalManager.js';
import * as progress from './ui/systems/progressSystem.js';

const exitManager = new ExitManager(code => platform.terminateApp(code), error => {
    const bar = getActiveModal()?.querySelector('sl-progress-bar');
    if (bar) bar.indeterminate = false;
    progress.onError(error);
    log('state').error('Unable to save changes before exiting.', error);
    createReporter({ unit: 'Application', label: 'Exit' })('exit', error);
}, async () => {
    const L = localize('application-exit');
    openModal('cm-progress-modal', { title: L`Closing Card Magician` });
    progress.setStatus(L`Saving pending changes…`);
    const bar = getActiveModal()?.querySelector('sl-progress-bar');
    if (bar) bar.indeterminate = true;
    await new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
});

export function beforeExit(callback, hasPending) {
    return exitManager.beforeExit(callback, hasPending);
}

export function registerPendingSave(save) {
    const flush = async () => {
        await save.flush();
        while (save.pending) await save.flush();
    };
    const unregister = beforeExit(flush, () => save.pending);
    return () => {
        void flush().then(unregister).catch(error => {
            createReporter({ unit: 'Persistence' })('save', error);
        });
    };
}

/**
 * @returns {Promise<any>}
 */
export function flushBeforeExit() {
    return exitManager.flush();
}

export function exitApp(code = 0) {
    return exitManager.exit(code);
}

export async function setupExitHandling() {
    await platform.onWindowClose(() => { void exitApp().catch(() => {}); });
}
