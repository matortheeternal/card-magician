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
    // Let the modal paint before starting filesystem work.
    await new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
});

export function beforeExit(callback, hasPending) {
    return exitManager.beforeExit(callback, hasPending);
}

/** Track a component's debounced writer, including work after it is detached. */
export function registerPendingSave(save) {
    const flush = async () => {
        await save.flush();
        while (save.pending) await save.flush();
    };
    const unregister = beforeExit(flush, () => save.pending);
    // Successful detached saves can release the component. Failed ones remain
    // registered so shutdown cannot silently skip them.
    return () => {
        void flush().then(unregister).catch(error => {
            createReporter({ unit: 'Persistence' })('save', error);
        });
    };
}

export function flushBeforeExit() {
    return exitManager.flush();
}

export function exitApp(code = 0) {
    return exitManager.exit(code);
}

export async function setupExitHandling() {
    await platform.onWindowClose(() => { void exitApp().catch(() => {}); });
}
