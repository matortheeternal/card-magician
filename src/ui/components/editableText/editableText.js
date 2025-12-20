import { emit } from '../../../shared/htmlUtils.js';

export default class EditableText extends HTMLElement {
    composing = false;

    constructor() {
        super();
        this.onInput = this.onInput.bind(this);
        this.pastePlainText = this.pastePlainText.bind(this);
    }

    connectedCallback() {
        this.addEventListener('input', this.onInput);
        this.addEventListener('paste', this.pastePlainText);
        this.addEventListener('compositionstart', () => {
            this.composing = true;
        });
        this.addEventListener('compositionend', () => {
            this.composing = false;
        });
    }

    get value() {
        return this.textContent;
    }

    get field() {
        return this.getAttribute('field');
    }

    pastePlainText(event) {
        event.preventDefault();
        event.stopPropagation();
        const text = event.clipboardData.getData('text/plain');
        if (!text) return;
        document.execCommand('insertText', false, text);
        this.onInput();
    }

    onInput() {
        emit(this, 'cm-field-changed', { fieldId: this.field, value: this.value });
    }
}

customElements.define('cm-editable-text', EditableText);
