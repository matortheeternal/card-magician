import { emit } from '../../../shared/htmlUtils.js';

class EditableText extends HTMLElement {
    composing = false;

    constructor() {
        super();
        this.onInput = this.onInput.bind(this);
    }

    connectedCallback() {
        this.bind();
    }

    get value() {
        return this.textContent;
    }

    get field() {
        return this.getAttribute('field');
    }

    bind() {
        this.addEventListener('input', this.onInput);
        this.addEventListener('paste', this.onPaste);
        this.addEventListener('compositionstart', () => {
            this.composing = true;
        });
        this.addEventListener('compositionend', () => {
            this.composing = false;
        });
    }

    onPaste(event) {
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
