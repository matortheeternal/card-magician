import FieldComponent from './FieldComponent.js';
import { emit, esc } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

export default class CheckboxListField extends FieldComponent {
    static tagName = 'cm-checkbox-list';

    static matches(field) {
        return field.type === 'checkboxlist';
    }

    get checkboxes() {
        return this.querySelectorAll('sl-checkbox');
    }

    render() {
        this.innerHTML = (
            `<div class="label">${this.field.label}</div>
            <div class="checkbox-list">
                ${this.field.options.map(opt => `
                    <sl-checkbox
                        data-id="${esc(opt.id)}"
                        size="small"
                        ${opt.disabled ? 'disabled' : ''}>
                        ${opt.label}
                    </sl-checkbox>
                `).join('')}
            </div>`
        );
        this.loadValue();
    }

    loadValue() {
        if (!this.checkboxes.length) return;
        this.checkboxes.forEach(checkbox => {
            const optionId = checkbox.dataset.id;
            checkbox.value = this.value[optionId];
        });
    }

    async onChange(e) {
        const optionId = e.target.dataset?.id;
        if (!optionId) return;
        this.value = { ...this.value, [optionId]: e.target.checked };
        emit(this, 'cm-field-changed');
    }
}

registerField(CheckboxListField);
