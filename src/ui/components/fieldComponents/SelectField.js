import FieldComponent from './FieldComponent.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { esc } from '../../../shared/htmlUtils.js';

export default class SelectField extends FieldComponent {
    static tagName = 'cm-select';
    eventKey = 'sl-change';

    static matches(field) {
        return field.type === 'select';
    }

    get select() {
        return this.querySelector('sl-select');
    }

    get options() {
        return this.field.options;
    }

    renderOptions() {
        return this.options.map(opt => (
            `<sl-option value="${opt.id}">${opt.name}</sl-option>`
        )).join('\n');
    }

    render() {
        this.innerHTML = (
            `<sl-select
              size="small"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              hoist
            >${this.renderOptions()}</sl-select>`
        );
        this.loadValue();
    }

    loadValue() {
        this.select.value = this.value;
    }

    inputValue(value) {
        this.select.value = value;
        this.select.dispatchEvent(new Event(this.eventKey, { bubbles: true }));
    }

    updateSelectedClasses(groupId) {
        this.querySelectorAll('sl-menu-item').forEach(el => {
            el.classList.toggle('selected', this.isSelected(el, groupId));
        });
    }

    async getChangedValue(event) {
        return event.target.value;
    }
}

registerField(SelectField);
