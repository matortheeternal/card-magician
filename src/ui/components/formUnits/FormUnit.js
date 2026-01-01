import ReactiveComponent from '../ReactiveComponent.js';
import { esc, escapeHTML } from '../../../shared/htmlUtils.js';

const L = localize('form-unit');

export default class FormUnit extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        if (this.error) return;
        this.handleEvents('click', {
            addUnit: this.addUnit,
            removeUnit: this.removeUnit
        });
        this.watch(this.model, this.showKey, () => this.update());
    }

    get provider() {
        return this._provider ??= this.closest('[data-form-provider]');
    }

    get modelKey() {
        return this._modelKey ??= this.getAttribute('model-key');
    }

    get model() {
        return this._model ??= (
            this.modelKey
                ? this.provider.model[this.modelKey]
                : this.provider.model
        );
    }

    get optional() {
        return this._optional ??= this.hasAttribute('optional');
    }

    removeButtonHTML() {
        return (
            `<sl-tooltip content="${L`Remove ${esc(this.label)}`}">
                <sl-icon-button
                    class="remove-btn"
                    name="x-lg"
                    data-click-action="removeUnit"></sl-icon-button>
            </sl-tooltip>`
        );
    }

    addButtonHTML() {
        return (
            `<sl-button
                class="add-btn"
                data-click-action="addUnit"
                size="small"
                variant="success"
                outline>
                <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                ${L`Add ${escapeHTML(this.label)}`}
            </sl-button>`
        );
    }

    update() {
        this.updateDisplay(this.show);
        if (!this.optional) return;
        this.toggle.innerHTML = this.show
            ? this.removeButtonHTML()
            : this.addButtonHTML();
    }

    generateToggleElement() {
        this.toggle = document.createElement('div');
        this.toggle.className = 'toggle-group';
        this.update();
        return this.toggle;
    }

    get error() {
        return (
            (!this.provider && 'Could not find form provider in HTML ancestors.')
            || (!this.model && 'Could not resolve data model from form provider.')
        );
    }

    renderError() {
        const path = [this.modelKey, this.label].filter(Boolean).join('/');
        this.innerHTML = (
            `<sl-tooltip content="${esc(this.error)}" placement="bottom">
                <div class="error">Error rendering ${escapeHTML(path)}</div>
            </sl-tooltip>`
        );
    }
}
