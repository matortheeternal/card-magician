import FaceForm from '../faceForm/faceForm.js';

const L = localize('options-form');

class OptionsForm extends FaceForm {
    get fieldsKey() { return 'options'; }
    get fields() { return this.face.options; }
    get form() { return this.face.optionsForm; }

    getMissingFormHTML() {
        return (
            `<div class="no-content-prompt">
                <span>${L`This face does not have any options to display.`}</span>
            </div>`
        );
    }
}

customElements.define('cm-options-form', OptionsForm);
