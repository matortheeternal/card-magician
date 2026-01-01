import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

export default class MultiselectField extends FieldComponent {
    static tagName = 'cm-multiselect';
    eventKey = 'sl-change';

    static matches(field) {
        return field.type === 'multiselect';
    }

    get select() {
        return this.querySelector('sl-select');
    }

    render() {
        this.innerHTML = (
            `<sl-select
              size="small"
              label="${esc(this.field.label)}"
              placeholder="No selection"
              maxOptionsVisible="5"
              clearable
              multiple
              hoist
            >
            ${this.field.options.map(opt => (
                `<sl-option value="${esc(opt.id)}">${opt.name}</sl-option>`
            )).join('\n')}
            </sl-select>`
        );
        this.loadValue();
    }

    loadValue() {
        if (!this.select) return;
        this.select.value = this.value?.join?.(' ') || '';
    }
}

registerField(MultiselectField);
