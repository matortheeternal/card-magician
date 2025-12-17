import FaceForm from '../faceForm/faceForm.js';

const L = localize('options-form');

class OptionsForm extends FaceForm {
    get fields() { return this.face.options }
    get form() { return this.face.optionsForm }

    missingFormHTML() {
        return (
            `<div class="no-content-prompt">
                <span>${L`This face does not have any options to display.`}</span>
            </div>`
        );
    }

    resolveFields(obj) {
        return obj.options;
    }

    getField(subcardId, fieldId) {
        const target = subcardId
            ? this.subcards.find(s => s.id === subcardId)
            : this.face;
        return target.options.find(field => field.id === fieldId);
    }
}

customElements.define('cm-options-form', OptionsForm);
