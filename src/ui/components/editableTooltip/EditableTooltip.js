export default class EditableTooltip {
    constructor(field, editable) {
        this.field = field;
        this.editable = editable;
        this.createElement();
        this.bind();
        this.publish();
    }

    get positionInsideEditable() {
        return this.editable.tagName === 'CM-EDITABLE-IMAGE'
            || this.editable.hasAttribute('multiline');
    }

    getTopOffset(rect) {
        return this.positionInsideEditable
            ? rect.bottom - 17 + 'px'
            : rect.bottom + 2 + 'px';
    }

    createElement() {
        const rect = this.editable.getBoundingClientRect();
        this.element = document.createElement('div');
        this.element.textContent = this.field.label;
        this.element.className = 'editable-tooltip';
        this.element.style.left = rect.left + 'px';
        this.element.style.top = this.getTopOffset(rect);
    }

    bind() {
        this.editable.addEventListener('mouseenter', () => {
            if (this.editable.matches(':focus-visible')) return;
            this.element.classList.add('show');
        });
        this.editable.addEventListener('focus', () => {
            this.element.classList.remove('show');
        })
        this.editable.addEventListener('mouseleave', () => {
            this.element.classList.remove('show');
        });
    }

    publish() {
        document.body.appendChild(this.element);
    }

    remove() {
        this.element.remove();
    }
}
