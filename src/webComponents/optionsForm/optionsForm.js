import FaceForm from '../faceForm/faceForm.js';
import { renderFormField } from '../faceForm/faceFormHelpers.js';

class OptionsForm extends FaceForm {
    get fields() { return this._face.options }
    get form() { return this._face.optionsForm }

    renderFields() {
        if (!this.fields) return;
        this.fields.forEach(field => renderFormField(this.face, field, this));
        this.subcards.forEach(subcard => {
            subcard.options.forEach(
                field => renderFormField(subcard, field, this)
            );
        });
    }
}

customElements.define('cm-options-form', OptionsForm);
