import AlertDialog from '../dialogs/AlertDialog.js';
import ChoiceDialog from '../dialogs/ChoiceDialog.js';
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

export const dialogSystem = {
    get isOpen() {
        return activeDialog !== null;
    },

    alert(message, options = {}) {
        return enqueue(new AlertDialog(message, options));
    },

    confirm(message, options = {}) {
        return enqueue(new ConfirmDialog(message, options));
    },

    choose(message, options) {
        return enqueue(new ChoiceDialog(message, options));
    },

    prompt(message, options = {}) {
        return enqueue(new PromptDialog(message, options));
    },
};

window.dialog = dialogSystem;
