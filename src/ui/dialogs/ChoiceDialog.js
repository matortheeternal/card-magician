import Dialog from './Dialog.js';

const L = localize('dialogs');

export default class ChoiceDialog extends Dialog {
    result = null;

    get autofocusTarget() {
        return this.cancelButton;
    }

    createActions() {
        this.cancelButton = this.createButton(L`Cancel`, () => this.element.hide());
        const choices = this.options.choices.map(({ label, value }) => {
            return this.createButton(label, () => this.choose(value));
        });
        return [this.cancelButton, ...choices];
    }

    choose(value) {
        this.result = value;
        this.element.hide();
    }
}
