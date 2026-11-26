import { esc } from '../htmlUtils.js';

const formSelectors = [
    ({ faceKey }) => {
        if (faceKey !== 'front' && faceKey !== 'back')
            throw new Error(`Unexpected face key option "${faceKey}"`);
        return `cm-face-form[data-face-id="${esc(faceKey)}"]`;
    },
    () => `cm-card-properties`,
    () => `cm-settings-workspace`,
];

export const CARD_FACE_FORM = 0;
export const CARD_PROPERTIES = 1;
export const SETTINGS = 2;

export default class FieldInteractor {
    constructor(fieldId, options = {}) {
        this.fieldId = fieldId;
        const getSelector = formSelectors[options.mode] || formSelectors[0];
        this.formSelector = getSelector?.(options);
    }

    get fieldSelector() {
        return `form-field[field-id="${esc(this.fieldId)}"]`;
    }

    /**
     * @returns {FormField}
     */
    get formField() {
        if (!this._formField?.parentElement)
            this._formField = null;
        return this._formField ||= document.querySelector(
            `${this.formSelector} ${this.fieldSelector}`
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
            throw new Error(`Field "${this.fieldId}" not found.`);
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

    addIfMissing() {
        if (!this.formField?.toggle) return;
        this.formField.toggleShow(true);
    }

    remove() {
        if (!this.formField)
            throw new Error(`Field "${this.fieldId}" does not exist.`);
        this.formField.toggleShow(false);
    }
}
