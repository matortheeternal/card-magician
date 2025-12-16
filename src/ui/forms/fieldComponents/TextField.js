import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from './fieldComponentManager.js';

export default class TextField extends FieldComponent {
    static tagName = 'cm-text';

    static matches(field) {
        return field.type === 'textarea';
    }

    render() {
        if (!this.field || !this.model) return;
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
