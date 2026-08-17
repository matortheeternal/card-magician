import { esc } from '../htmlUtils.js';

export default class FieldInteractor {
    constructor(fieldId) {
        this.fieldId = fieldId;
    }

    /**
     * @returns {FormField}
     */
    get formField() {
        if (!this._formField?.parentElement)
            this._formField = null;
        return this._formField ||= document.querySelector(
            `form-field[field-id="${esc(this.fieldId)}"]`
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

    set value(value) {
        this.fieldElement.inputValue(value);
    }

    get value() {
        return this.fieldElement.value;
    }

    clear() {
        this.fieldElement.clear();
        this.fieldElement.dispatchChangeEvent();
    }

    remove() {
        if (!this.formField)
            throw new Error(`Field ${this.fieldId} does not exist.`);
        this.formField.toggleShow(false);
    }
}
