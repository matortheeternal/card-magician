import FieldComponent from './FieldComponent.js';
import { emit, esc } from '../../../shared/htmlUtils.js';
import { registerField } from './fieldComponentRegistry.js';

export default class CheckboxListField extends FieldComponent {
    static tagName = 'cm-checkbox-list';

    static matches(field) {
        return field.type === 'checkboxlist';
    }

    render() {
        if (!this.field) return;
        this.innerHTML = (
            `<div class="label">${this.field.label}</div>
            <div class="checkbox-list">
                ${this.field.options.map(opt => `
                    <sl-checkbox
                        data-id="${esc(opt.id)}"
                        size="small"
                        ${this.value[opt.id] ? 'checked' : ''}
                        ${opt.disabled ? 'disabled' : ''}>
                        ${opt.label}
                    </sl-checkbox>
                `).join('')}
            </div>`
        );
    }

    async onChange(e) {
        const optionId = e.target.dataset?.id;
        if (!optionId) return;
        this.value = { ...this.value, [optionId]: e.target.checked };
        emit(this, 'cm-field-changed');
    }
}

registerField(CheckboxListField);
