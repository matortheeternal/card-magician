import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

export default class InputField extends FieldComponent {
    static tagName = 'cm-input';

    static matches(field) {
        return field.type === 'input' || !field.type;
    }

    get input() {
        return this.querySelector('sl-input');
    }

    render() {
        this.innerHTML = (
            `<sl-input
              size="small"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              placeholder="${esc(this.field.placeholder || '')}"
              autocomplete="off"
              type="${this.field.inputType || 'text'}"
            ></sl-input>`
        );
        this.loadValue();
    }

    loadValue() {
        if (!this.input) return;
        this.input.value = this.value;
    }
}

registerField(InputField);
