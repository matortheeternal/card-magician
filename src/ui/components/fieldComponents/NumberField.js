import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

export default class NumberField extends FieldComponent {
    static tagName = 'cm-number-field';

    static matches(field) {
        return field.type === 'number';
    }

    get input() {
        return this.querySelector('sl-input');
    }

    render() {
        this.innerHTML = `
            <sl-input
                size="small"
                type="number"
                value="${esc(this.value ?? '')}"
                min="${esc(this.field.min ?? '')}"
                max="${esc(this.field.max ?? '')}"
                step="${esc(this.field.step ?? '1')}"
                placeholder="${esc(this.field.placeholder || '')}"
                label="${esc(this.field.label || '')}"
            ></sl-input>
        `;
        this.loadValue();
    }

    loadValue() {
        if (!this.input) return;
        this.input.value = this.value;
    }
}

registerField(NumberField);
