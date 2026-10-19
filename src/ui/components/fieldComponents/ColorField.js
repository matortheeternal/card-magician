import FieldComponent from './FieldComponent.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { esc } from '../../../shared/htmlUtils.js';

export default class ColorField extends FieldComponent {
    static tagName = 'cm-color';

    static matches(field) {
        return field.type === 'color';
    }

    get input() {
        return this.querySelector('sl-color-picker');
    }

    render() {
        this.innerHTML = (
            `<div class="field-label">${esc(this.field.label)}</div>
            <sl-color-picker
              size="small"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
            ></sl-color-picker>`
        );
        this.loadValue();
    }

    inputValue(value) {
        this.input.value = value;
        this.input.dispatchEvent(new Event(this.eventKey, { bubbles: true }));
    }

    loadValue() {
        if (!this.input) return;
        this.input.value = this.value;
    }
}

registerField(ColorField);
