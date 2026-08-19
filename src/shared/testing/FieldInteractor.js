import { esc } from '../htmlUtils.js';

export default class FieldInteractor {
    constructor(fieldId, faceKey) {
        this.fieldId = fieldId;
        this.faceKey = faceKey;
    }

    /**
     * @returns {FormField}
     */
    get formField() {
        if (!this._formField?.parentElement)
            this._formField = null;
        return this._formField ||= document.querySelector(
            `cm-face-form[data-face-id="${esc(this.faceKey)}"] `
            + `form-field[field-id="${esc(this.fieldId)}"]`
        );
    }

    get exists() {
        return Boolean(this.formField);
    }

    /**
     * @returns {FieldComponent}
     */
    get fieldElement() {
        if (!this.formField?.fieldElement)
            throw new Error(`Field ${this.fieldId} not found.`);
        return this.formField.fieldElement;
    }

    setValue(value) {
        return new Promise(resolve => {
            this.fieldElement.addEventListener(
                'cm-field-changed',
                resolve,
                { once: true }
            );
            this.fieldElement.inputValue(value);
        });
    }

    get value() {
        return this.fieldElement.value;
    }

    clear() {
        this.fieldElement.clear();
    }

    remove() {
        if (!this.formField)
            throw new Error(`Field ${this.fieldId} does not exist.`);
        this.formField.toggleShow(false);
    }
}
