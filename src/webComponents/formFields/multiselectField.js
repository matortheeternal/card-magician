import FieldElement from './fieldElement.js';
import { esc } from '../../utils.js';
import { registerField } from '../../services/fieldElementRegistry.js';

export default class MultiselectField extends FieldElement {
    static tagName = 'cm-multiselect';
    eventKey = 'sl-change';

    static matches(field) {
        return field.type === 'multiselect';
    }

    render() {
        if (!this.field) return;
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
