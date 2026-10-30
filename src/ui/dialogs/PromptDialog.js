import ConfirmDialog from './ConfirmDialog.js';

const L = localize('dialogs');

export default class PromptDialog extends ConfirmDialog {
    /**
     * @override
     * @returns {DialogOptions} Defaults for this dialog type.
     */
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: L`Prompt`,
            defaultValue: ''
        };
    }

    /**
     * @override
     * @returns {string | null} Entered text on acceptance, or null on cancellation.
     */
    get result() {
        return this.confirmed ? this.input.value : null;
    }

    /**
     * @override
     * @returns {HTMLElement} Control that receives initial focus.
     */
    get autofocusTarget() {
        return this.input;
    }

    /**
     * @override
     * @returns {SlInput} Text input with the message as its accessible label.
     */
    createContent() {
        this.input = document.createElement('sl-input');
        this.input.value = this.options.defaultValue ?? '';
        const label = this.createMessage();
        label.slot = 'label';
        this.input.append(label);
        this.input.addEventListener('keydown', event => this.onKeyDown(event));
        return this.input;
    }

    /**
     * @param {KeyboardEvent} event - Input key event; Enter accepts the prompt.
     * @returns {void}
     */
    onKeyDown(event) {
        if (event.key !== 'Enter' || event.isComposing) return;
        event.preventDefault();
        this.accept();
    }
}
