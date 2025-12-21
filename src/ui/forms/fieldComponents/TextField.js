import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

export default class TextField extends FieldComponent {
    static tagName = 'cm-text';

    static matches(field) {
        return field.type === 'textarea';
    }

    get textarea() {
        return this.querySelector('sl-textarea');
    }

    render() {
        this.innerHTML = (
            `<sl-textarea
              size="small"
              resize="auto"
              autocomplete="off"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              rows="2"
            ></sl-textarea>`
        );
    }

    loadValue() {
        if (!this.textarea) return;
        this.textarea.value = this.value;
    }
}

registerField(TextField);
