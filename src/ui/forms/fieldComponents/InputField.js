import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from './fieldComponentRegistry.js';

export default class InputField extends FieldComponent {
    static tagName = 'cm-input';

    static matches(field) {
        return field.type === 'input' || !field.type;
    }

    render() {
        if (!this.field || !this.model) return;
        this.innerHTML = (
            `<sl-input
              size="small"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              placeholder="${esc(this.field.placeholder || '')}"
              autocomplete="off"
              type="${this.field.inputType || 'text'}"
              value="${esc(this.value)}"
            ></sl-input>`
        );
    }
}

registerField(InputField);
