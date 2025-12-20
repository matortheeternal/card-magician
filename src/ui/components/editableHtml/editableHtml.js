import { emit } from '../../../shared/htmlUtils.js';

function resolveSourceOffset(node, offset) {
    if (offset === 0) return 0;
    const child = node.childNodes[offset - 1];
    if (!child?.hasAttribute?.('data-src-end'))
        throw new Error('Error: Source end offset not found');
    return parseInt(child?.dataset?.srcEnd);
}

class EditableHtml extends HTMLElement {
    composing = false;

    constructor() {
        super();
        this.onBeforeInput = this.onBeforeInput.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }

    connectedCallback() {
        this.root = this.getRootNode();
        document.addEventListener('selectionchange', this.onSelectionChange);
        this.addEventListener('beforeinput', this.onBeforeInput);
        this.addEventListener('mousedown', this.onMouseDown);
    }

    disconnectedCallback() {
        document.removeEventListener('selectionchange', this.onSelectionChange);
    }

    get field() {
        return this.getAttribute('field');
    }

    get selectionRange() {
        const s = this.root.getSelection();
        if (!s || s.rangeCount === 0) throw new Error('No selection!?');
        const focus = resolveSourceOffset(s.focusNode, s.focusOffset);
        const anchor = resolveSourceOffset(s.anchorNode, s.anchorOffset);
        return [focus, anchor].sort();
    }

    get value() {
        return Array.from(this.childNodes).map(node => {
            return node.hasAttribute('data-src')
                ? node.dataset.src
                : node.textContent;
        }).join('');
    }

    afterNextDomMutation(callback) {
        const wrapped = () => {
            callback();
            this.removeEventListener('dom-morphed', wrapped);
        };
        this.addEventListener('dom-morphed', wrapped);
    }

    edit(textToInsert = '', startOffset = 0, endOffset = 0) {
        const [start, end] = this.selectionRange;
        const collapsed = start === end;
        const initialValue = this.value;
        const [sliceTo, sliceFrom] = collapsed
            ? [
                Math.max(start - startOffset, 0),
                Math.min(end + endOffset, initialValue.length)
            ]
            : [start, end];
        return [
            initialValue.slice(0, sliceTo),
            textToInsert,
            initialValue.slice(sliceFrom)
        ].join('');
    }

    getAnchorOffset() {
        const sel = this.root.getSelection();
        return sel.anchorOffset;
    }

    updateSelection(offset) {
        const sel = this.root.getSelection();
        const range = document.createRange();
        const maxOffset = this.childNodes.length;
        const clampedOffset = Math.max(0, Math.min(offset, maxOffset));
        range.setStart(this, clampedOffset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    handlePaste(event) {
        if (event.inputType !== 'insertFromPaste') return;
        event.preventDefault();
        const text = (event.dataTransfer
            ? event.dataTransfer.getData('text/plain')
            : event.data).trim();
        if (!text) return true;
        this.onChange(this.edit(text));
        const newOffset = this.getAnchorOffset() + text.length;
        this.afterNextDomMutation(() => this.updateSelection(newOffset));
        return true;
    }

    handleDeleteContentBackward(event) {
        if (event.inputType !== 'deleteContentBackward') return;
        event.preventDefault();
        this.onChange(this.edit('', 1));
        const newOffset = this.getAnchorOffset() - 1;
        this.afterNextDomMutation(() => this.updateSelection(newOffset));
        return true;
    }

    handleDeleteContentForward(event) {
        if (event.inputType !== 'deleteContentForward') return;
        event.preventDefault();
        this.onChange(this.edit('', 0, 1));
        return true;
    }

    handleLineBreakOrParagraph(event) {
        if (event.inputType !== 'insertLineBreak' &&
            event.inputType !== 'insertParagraph') return;
        event.preventDefault();
        return true;
    }

    handleInsertText(event) {
        if (event.inputType !== 'insertText') return;
        event.preventDefault();
        this.onChange(this.edit(event.data));
        const newOffset = this.getAnchorOffset() + event.data.length;
        this.afterNextDomMutation(() => this.updateSelection(newOffset));
        return true;
    }

    onBeforeInput(event) {
        if (event.isComposing) return;
        return this.handlePaste(event)
            || this.handleDeleteContentBackward(event)
            || this.handleDeleteContentForward(event)
            || this.handleLineBreakOrParagraph(event)
            || this.handleInsertText(event);
    }

    onMouseDown(event) {
        if (event.target.contentEditable !== 'false') return;
        const rect = event.target.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        if (event.clientX < midX) return;
        setTimeout(() => {
            const offset = this.getAnchorOffset();
            this.updateSelection(offset + 1);
        });
    }

    onSelectionChange() {
        if (this.root.getSelection().anchorNode !== this) return;
        const [start, end] = this.selectionRange;
        this.childNodes.forEach((node, i) => {
            const isSelected = i >= start && i < end;
            node.classList.toggle('selected', isSelected);
        });
    }

    onChange(value) {
        emit(this, 'cm-field-changed', { fieldId: this.field, value });
    }
}

customElements.define('cm-editable-html', EditableHtml);
