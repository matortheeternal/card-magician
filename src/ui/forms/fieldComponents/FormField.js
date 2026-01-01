import { resolveFieldComponent } from '../../systems/fieldComponentRegistry.js';
import { esc, escapeHTML, toggleDisplay } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../../components/ReactiveComponent.js';

const L = localize('form-field');

export default class FormField extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        if (this.error || !this.optional) return;
        this.handleEvents('click', {
            addField: this.addField,
            removeField: this.removeField
        });
        this.watch(this.model, this.fieldId, () => this.updateToggle());
    }

    get provider() {
        return this._provider ??= this.closest('[data-form-provider]');
    }

    get fieldId() {
        return this._fieldId ??= this.getAttribute('field-id');
    }

    get field() {
        return this._field ??= (
            this.provider?.fields?.find(field => field.id === this.fieldId)
        );
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

    get show() {
        const value = this.model[this.fieldId];
        return value !== undefined
            && value !== null;
    }

    generateFieldElement() {
        const Component = resolveFieldComponent(this.field);
        this.fieldElement = document.createElement(Component.tagName);
        this.fieldElement.field = this.field;
        this.fieldElement.model = this.model;
        return this.fieldElement;
    }

    updateToggle() {
        const show = this.show;
        toggleDisplay(show, this.fieldElement);
        this.toggle.innerHTML = show ? (
            `<sl-tooltip content="${L`Remove ${esc(this.field.label)}`}">
                <sl-icon-button
                    class="remove-btn"
                    name="x-lg"
                    data-click-action="removeField"></sl-icon-button>
            </sl-tooltip>`
        ) : (
            `<sl-button
                class="add-field-btn"
                data-click-action="addField"
                size="small"
                variant="success"
                outline>
                <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                ${L`Add ${escapeHTML(this.field.label)}`}
            </sl-button>`
        );
    }

    generateToggleElement() {
        this.toggle = document.createElement('div');
        this.toggle.className = 'toggle-field';
        this.updateToggle();
        return this.toggle;
    }

    get error() {
        return (
            (!this.provider && 'Could not find form provider in HTML ancestors.')
            || (!this.model && 'Could not resolve data model from form provider.')
            || (!this.field && 'Could not resolve field from form provider.')
        );
    }

    renderError() {
        const path = [this.modelKey, this.fieldId].filter(Boolean).join('/');
        this.innerHTML = (
            `<sl-tooltip content="${esc(this.error)}">
                Error rendering ${escapeHTML(path)}
            </sl-tooltip>`
        );
    }

    render() {
        if (this.error) return this.renderError();
        this.innerHTML = '';
        this.appendChild(this.generateFieldElement());
        if (!this.optional) return;
        this.appendChild(this.generateToggleElement());
    }

    addField() {
        this.model[this.fieldId] = this.field.initialValue || '';
        changed(this.model, this.fieldId);
    }

    removeField() {
        this.model[this.fieldId] = null;
        changed(this.model, this.fieldId);
    }
}

customElements.define('form-field', FormField);
