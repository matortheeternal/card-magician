import AlertDialog from '../dialogs/AlertDialog.js';
import ConfirmDialog from '../dialogs/ConfirmDialog.js';
import PromptDialog from '../dialogs/PromptDialog.js';

let pending = Promise.resolve();
let activeDialog = null;

async function showDialog(dialog) {
    activeDialog = dialog;
    try {
        return await dialog.show();
    } finally {
        activeDialog = null;
    }
}

function enqueue(dialog) {
    const result = pending.then(() => showDialog(dialog));
    pending = result.catch(() => {});
    return result;
}

/** Card Magician asynchronous dialog system. */
export const dialogSystem = {
    get isOpen() {
        return activeDialog !== null;
    },

    /** Resolves after the alert is dismissed. */
    alert(message, options = {}) {
        return enqueue(new AlertDialog(message, options));
    },

    /** Resolves true only when confirmed; all other dismissals resolve false. */
    confirm(message, options = {}) {
        return enqueue(new ConfirmDialog(message, options));
    },

    /** Resolves with the entered text when accepted, or null when cancelled. */
    prompt(message, options = {}) {
        return enqueue(new PromptDialog(message, options));
    },
};

window.dialog = dialogSystem;
