export default class EditableTooltip {
    #rect = null;

    constructor(field, editable) {
        this.field = field;
        this.editable = editable;
        this.hide = this.hide.bind(this);
        this.createElement();
        this.bind();
        this.publish();
    }

    get bindingTarget() {
        return this.editable.tagName === 'CM-EDITABLE-IMAGE'
            ? this.editable.controls
            : this.editable;
    }

    get positionInsideEditable() {
        return this.editable.tagName === 'CM-EDITABLE-IMAGE'
            || this.editable.hasAttribute('multiline');
    }

    cacheRect() {
        this.#rect = this.element.getBoundingClientRect();
    }

    get rect() {
        return this.#rect;
    }

    get height() {
        return this.#rect.height;
    }

    get width() {
        return this.#rect.width;
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.textContent = this.field.label;
        this.element.className = 'editable-tooltip';
    }

    hide() {
        this.element.classList.remove('show');
    }

    show() {
        this.element.classList.add('show');
    }

    bind() {
        this.bindingTarget.addEventListener('mouseenter', () => {
            if (this.bindingTarget.matches(':focus-within')) return;
            this.show();
        });
        this.bindingTarget.addEventListener('focus', this.hide)
        this.bindingTarget.addEventListener('mouseleave', this.hide);
    }

    publish() {
        document.body.appendChild(this.element);
    }

    remove() {
        this.element.remove();
    }
}
