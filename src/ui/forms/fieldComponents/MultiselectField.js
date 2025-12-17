import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from './fieldComponentManager.js';

export default class MultiselectField extends FieldComponent {
    static tagName = 'cm-multiselect';
    eventKey = 'sl-change';

    static matches(field) {
        return field.type === 'multiselect';
    }

    render() {
        if (!this.field || !this.model) return;
        this.innerHTML = (
            `<sl-select
              size="small"
              label="${esc(this.field.label)}"
              value="${esc(this.value.join?.(' '))}"
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
    }
}

registerField(MultiselectField);
