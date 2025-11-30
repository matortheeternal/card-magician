import FieldElement from './fieldElement.js';
import { esc } from '../../utils.js';
import { registerField } from '../../services/fieldElementRegistry.js';

export default class TextField extends FieldElement {
    static tagName = 'cm-text';

    static matches(field) {
        return field.type === 'textarea';
    }

    render() {
        if (!this.field) return;
        this.innerHTML = (
            `<sl-textarea
              size="small"
              resize="auto"
              autocomplete="off"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              value="${esc(this.value)}"
              rows="2"
            ></sl-textarea>`
        );
    }
}

registerField(TextField);
