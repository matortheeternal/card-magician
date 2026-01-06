import { esc, escapeHTML } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../ReactiveComponent.js';

const L = localize('form-toggle');

export function removeButtonHTML(label) {
    return (
        `<sl-tooltip content="${L`Remove ${esc(label)}`}">
            <sl-icon-button
                class="remove-btn"
                name="x-lg"
                data-click-action="onRemoveClick"></sl-icon-button>
        </sl-tooltip>`
    );
}

export function addButtonHTML(label) {
    return (
        `<sl-button
            class="add-btn"
            data-click-action="onAddClick"
            size="small"
            variant="success"
            outline>
            <sl-icon slot="prefix" name="plus-lg"></sl-icon>
            ${L`Add ${escapeHTML(label)}`}
        </sl-button>`
    );
}

export default class FormToggle extends ReactiveComponent {
    static create(target, label) {
        const toggle = document.createElement('form-toggle');
        toggle.setAttribute('label', label);
        toggle.target = target;
        return toggle;
    }

    connectedCallback() {
        this.render();
        this.bind();
    }

    get label() {
        return this._label ??= this.getAttribute('label');
    }

    bind() {
        this.handleEvents('click', {
            onAddClick: () => this.target.toggleShow(true),
            onRemoveClick: () => this.target.toggleShow(false)
        });
    }

    render() {
        this.target.updateDisplay(this.target.show);
        this.innerHTML = this.target.show
            ? removeButtonHTML(this.label)
            : addButtonHTML(this.label);
    }
}

customElements.define('form-toggle', FormToggle);
