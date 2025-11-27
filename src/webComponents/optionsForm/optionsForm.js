import FaceForm from '../faceForm/faceForm.js';

class OptionsForm extends FaceForm {
    get fields() { return this._face.options }
    get form() { return this._face.optionsForm }
}

customElements.define('cm-options-form', OptionsForm);
