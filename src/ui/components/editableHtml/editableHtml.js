import { emit } from '../../../shared/htmlUtils.js';
import {
    getCursorSelectionOffset, setCursorPosition,
    applySelectionClasses, removeSelectionClasses,
    selectAll, selectRange,
} from '../../systems/htmlSelectionSystem.js';
import { onBeforeInput } from '../../systems/htmlInputSystem.js';

class EditableHtml extends HTMLElement {
    composing = false;

    constructor() {
        super();
        this.onBeforeInput = this.onBeforeInput.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }

    connectedCallback() {
        this.root = this.getRootNode();
        document.addEventListener('selectionchange', this.onSelectionChange);
        this.addEventListener('beforeinput', this.onBeforeInput);
        this.addEventListener('pointerdown', this.onPointerDown);
        this.addEventListener('pointermove', this.onPointerMove);
        this.addEventListener('pointerup', this.onPointerUp);
        this.addEventListener('dblclick', this.onDoubleClick);
    }

    disconnectedCallback() {
        document.removeEventListener('selectionchange', this.onSelectionChange);
    }

    get field() {
        return this.getAttribute('field');
    }

    get value() {
        return Array.from(this.childNodes).map(node => {
            return node.hasAttribute('data-src')
                ? node.dataset.src
                : node.textContent;
        }).join('');
    }

    set value(newValue) {
        emit(this, 'cm-field-changed', { fieldId: this.field, value: newValue });
    }

    onBeforeInput(event) {
        onBeforeInput(event, this);
    }

    onPointerDown(event) {
        if (event.target.contentEditable !== 'false') return;
        event.preventDefault();
        this.setPointerCapture(event.pointerId);
        const pos = getCursorSelectionOffset(event, this);
        if (pos === null) return;
        this.isDragging = true;
        this.dragAnchor = pos;
        setCursorPosition(this, pos);
    }

    onPointerMove(event) {
        if (!this.isDragging) return;
        const target = this.root.elementFromPoint(event.clientX, event.clientY);
        const focus = getCursorSelectionOffset(event, this, target);
        if (focus === null) return;
        selectRange(this, this.dragAnchor, focus);
    }

    onPointerUp(event) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.releasePointerCapture(event.pointerId);
    }

    onSelectionChange() {
        if (this.root.getSelection().anchorNode !== this) {
            removeSelectionClasses(this);
            return;
        }
        applySelectionClasses(this);
    }

    onDoubleClick(event) {
        event.preventDefault();
        selectAll(this);
    }
}

customElements.define('cm-editable-html', EditableHtml);
