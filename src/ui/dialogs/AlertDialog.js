import Dialog from './Dialog.js';

const L = localize('dialogs');

export default class AlertDialog extends Dialog {
    /**
     * @override
     * @returns {DialogOptions} Defaults for this dialog type.
     */
    get defaultOptions() {
        return { ...super.defaultOptions, title: L`Alert` };
    }
}
