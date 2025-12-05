import FieldElement from './fieldElement.js';
import { esc } from '../../utils.js';
import { registerField } from '../../services/fieldElementRegistry.js';

export default class InputField extends FieldElement {
    static tagName = 'cm-input';

    static matches(field) {
        return field.type === 'input' || !field.type;
    }

    render() {
        if (!this.field) return;
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
