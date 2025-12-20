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
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp   = this.onPointerUp.bind(this);
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

    get selectionRange() {
        const s = this.root.getSelection();
        if (!s || s.rangeCount === 0) throw new Error('No selection!?');
        const focus = resolveSourceOffset(s.focusNode, s.focusOffset);
        const anchor = resolveSourceOffset(s.anchorNode, s.anchorOffset);
        return [focus, anchor].sort();
    }

    get selectionCollapsed() {
        const s = this.root.getSelection();
        return s.focusNode === s.anchorNode
            && s.focusOffset === s.anchorOffset;
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
        return Math.min(sel.anchorOffset, sel.focusOffset);
    }

    setCursorPosition(offset) {
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
        this.afterNextDomMutation(() => this.setCursorPosition(newOffset));
        return true;
    }

    handleDeleteContentBackward(event) {
        if (event.inputType !== 'deleteContentBackward') return;
        event.preventDefault();
        const diff = this.selectionCollapsed ? 1 : 0;
        this.onChange(this.edit('', 1));
        const newOffset = this.getAnchorOffset() - diff;
        this.afterNextDomMutation(() => this.setCursorPosition(newOffset));
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
        this.afterNextDomMutation(() => this.setCursorPosition(newOffset));
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

    getRelativeCursorOffset(event) {
        const rect = this.getBoundingClientRect();
        if (event.clientX <= rect.left) return 0;
        if (event.clientX >= rect.right) return this.childNodes.length;
        // NOTE: selecting to the start is preferred here, and the null case
        // should effectively never occur.
        if (event.clientY <= rect.bottom) return 0;
        if (event.clientY >= rect.top) return this.childNodes.length;
        return null;
    }

    getCursorSelectionOffset(event, target = event.target) {
        const index = Array.from(this.childNodes).indexOf(target);
        if (index === -1) return this.getRelativeCursorOffset(event);
        const rect = target.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const offset = event.clientX < midX ? 0 : 1;
        return index + offset;
    }

    onPointerDown(event) {
        if (event.target.contentEditable !== 'false') return;
        event.preventDefault();
        this.setPointerCapture(event.pointerId);
        const pos = this.getCursorSelectionOffset(event);
        if (pos === null) return;
        this.isDragging = true;
        this.dragAnchor = pos;
        this.setCursorPosition(pos);
    }

    selectRange(anchor, focus) {
        const sel = this.root.getSelection();
        const range = document.createRange();
        range.setStart(this, Math.min(anchor, focus));
        range.setEnd(this, Math.max(anchor, focus));
        sel.removeAllRanges();
        sel.addRange(range);
    }

    onPointerMove(event) {
        if (!this.isDragging) return;
        const target = this.root.elementFromPoint(event.clientX, event.clientY);
        const focus = this.getCursorSelectionOffset(event, target);
        if (focus === null) return;
        this.selectRange(this.dragAnchor, focus);
    }

    onPointerUp(event) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.releasePointerCapture(event.pointerId);
    }

    applySelectionClasses() {
        const [start, end] = this.selectionRange;
        this.childNodes.forEach((node, i) => {
            const isSelected = i >= start && i < end;
            node.classList.toggle('selected', isSelected);
        });
    }

    onSelectionChange() {
        if (this.root.getSelection().anchorNode !== this) return;
        this.applySelectionClasses();
    }

    selectAll() {
        const sel = this.root.getSelection();
        const range = document.createRange();
        range.setStart(this, 0);
        range.setEnd(this, this.childNodes.length);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    onDoubleClick(event) {
        event.preventDefault();
        this.selectAll();
    }

    onChange(value) {
        emit(this, 'cm-field-changed', { fieldId: this.field, value });
    }
}

customElements.define('cm-editable-html', EditableHtml);
