import { resolveFieldComponent } from '../../systems/fieldComponentRegistry.js';
import { emit, esc, escapeHTML, toggleDisplay } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../ReactiveComponent.js';
import FormToggle from './FormToggle.js';

export default class FormField extends ReactiveComponent {
    connectedCallback() {
        this.render();
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

    get fieldId() {
        return this._fieldId ??= this.getAttribute('field-id');
    }

    get fields() {
        return this.provider?.getFields?.(this.modelKey)
            || this.model?.fields
            || this.provider?.fields;
    }

    get field() {
        return this._field ??= (
            this.fields?.find(field => field.id === this.fieldId)
        );
    }

    get label() {
        return this.field?.label || this.fieldId;
    }

    get show() {
        const value = this.model[this.fieldId];
        return value !== undefined
            && value !== null;
    }

    get error() {
        return (
            (!this.provider && 'Could not find form provider in HTML ancestors.')
            || (!this.model && 'Could not resolve data model from form provider.')
            || (!this.field && 'Could not resolve field from form provider.')
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

    generateFieldElement() {
        const Component = resolveFieldComponent(this.field);
        this.fieldElement = document.createElement(Component.tagName);
        this.fieldElement.field = this.field;
        this.fieldElement.model = this.model;
        return this.fieldElement;
    }

    updateDisplay(show) {
        toggleDisplay(show, this.fieldElement);
    }

    render() {
        if (this.error) return this.renderError();
        this.innerHTML = '';
        this.appendChild(this.generateFieldElement());
        if (!this.optional) return;
        this.toggle = FormToggle.create(this, this.label);
        this.appendChild(this.toggle);
        this.watch('value', this.model, this.fieldId, () => this.toggle.render());
    }

    toggleShow(show) {
        this.model[this.fieldId] = show
            ? this.field.initialValue || ''
            : null;
        changed(this.model, this.fieldId);
        emit(this, 'cm-field-changed');
    }
}

customElements.define('form-field', FormField);
