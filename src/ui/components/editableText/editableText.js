import { emit } from '../../../shared/htmlUtils.js';
import { makeNavigationHandler } from '../../systems/editableNavigationSystem.js';

export default class EditableText extends HTMLElement {
    composing = false;

    constructor() {
        super();
        this.onInput = this.onInput.bind(this);
        this.pastePlainText = this.pastePlainText.bind(this);
        this.onKeyDown = makeNavigationHandler(this);
    }

    connectedCallback() {
        this.addEventListener('input', this.onInput);
        this.addEventListener('paste', this.pastePlainText);
        this.addEventListener('keydown', this.onKeyDown);
        this.addEventListener('compositionstart', () => {
            this.composing = true;
        });
        this.addEventListener('compositionend', () => {
            this.composing = false;
        });
    }

    get caretAtStart() {
        const sel = this.getRootNode().getSelection();
        return sel.isCollapsed
            && sel.anchorNode === (this.childNodes[0] || this)
            && sel.anchorOffset === 0;
    }

    get caretAtEnd() {
        const sel = this.getRootNode().getSelection();
        return sel.isCollapsed
            && sel.anchorNode === (this.childNodes[0] || this)
            && sel.anchorOffset === this.textContent.length;
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
