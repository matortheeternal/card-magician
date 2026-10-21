import FaceForm from '../faceForm/faceForm.js';

const L = localize('options-form');

class OptionsForm extends FaceForm {
    get fields() { return this.face.options; }
    get form() { return this.face.optionsForm; }

    getBaseHTML() {
        if (!this.face) return '';
        if (!this.form || !this.fields)
            return this.getMissingFormHTML();
        return '';
    }

    getFields(modelKey) {
        return modelKey ? this.face?.[modelKey]?.options : this.face.options;
    }

    focusFirstField() {
        const firstField = this.querySelector('form-field');
        if (!firstField) return;
        const input = firstField.querySelector('sl-input, sl-select, sl-textarea');
        if (!input) return;
        input.scrollIntoView(true);
        input.focus();
    }

    getMissingFormHTML() {
        return (
            `<div class="no-content-prompt">
                <span>${L`This face does not have any options to display.`}</span>
            </div>`
        );
    }
}

customElements.define('cm-options-form', OptionsForm);
