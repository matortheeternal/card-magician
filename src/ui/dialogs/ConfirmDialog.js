import Dialog from './Dialog.js';

const L = localize('dialogs');

export default class ConfirmDialog extends Dialog {
    /**
     * @override
     * @returns {DialogOptions} Defaults for this dialog type.
     */
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: L`Confirm`,
            cancelLabel: L`Cancel`
        };
    }

    /**
     * @override
     * @returns {boolean | string | null} Acceptance result, specialized by prompts.
     */
    get result() {
        return this.confirmed;
    }

    /**
     * @override
     * @returns {HTMLElement} Control that receives initial focus.
     */
    get autofocusTarget() {
        return this.cancelButton;
    }

    /**
     * @override
     * @returns {SlButton[]} Cancel and primary action buttons.
     */
    createActions() {
        this.cancelButton = this.createButton(
            this.options.cancelLabel, () => this.element.hide()
        );
        return [this.cancelButton, ...super.createActions()];
    }
}
