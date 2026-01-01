import { resolveFieldComponent } from '../../systems/fieldComponentRegistry.js';
import { emit, toggleDisplay } from '../../../shared/htmlUtils.js';
import FormUnit from './FormUnit.js';

export default class FormField extends FormUnit {
    get fieldId() {
        return this._fieldId ??= this.getAttribute('field-id');
    }

    get field() {
        return this._field ??= (
            this.provider?.fields?.find(field => field.id === this.fieldId)
        );
    }

    get showKey() {
        return this.fieldId;
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

    updateDisplay(show) {
        toggleDisplay(show, this.fieldElement);
    }

    get error() {
        return (super.error()
            || (!this.field && 'Could not resolve field from form provider.')
        );
    }

    render() {
        if (this.error) return this.renderError();
        this.innerHTML = '';
        this.appendChild(this.generateFieldElement());
        if (!this.optional) return;
        this.appendChild(this.generateToggleElement());
    }

    addUnit() {
        this.model[this.fieldId] = this.field.initialValue || '';
        changed(this.model, this.fieldId);
        emit(this, 'cm-field-changed');
    }

    removeUnit() {
        this.model[this.fieldId] = null;
        changed(this.model, this.fieldId);
        emit(this, 'cm-field-changed');
    }
}

customElements.define('form-field', FormField);
