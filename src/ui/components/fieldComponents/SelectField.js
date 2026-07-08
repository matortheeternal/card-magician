import FieldComponent from './FieldComponent.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { esc } from '../../../shared/htmlUtils.js';

export default class SelectField extends FieldComponent {
    static tagName = 'cm-select';
    eventKey = 'sl-select';

    static matches(field) {
        return field.type === 'select';
    }

    get select() {
        return this.querySelector('sl-select');
    }

    renderOptions() {
        return this.field.options.map(opt => (
            `<sl-option value="${opt.id}">${opt.name}</sl-option>`
        )).join('\n');
    }

    render() {
        this.innerHTML = (
            `<sl-select
              size="small"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              value="${esc(this.value)}"
            >${this.renderOptions()}</sl-select>`
        );
    }

    updateSelectedClasses(groupId) {
        this.querySelectorAll('sl-menu-item').forEach(el => {
            el.classList.toggle('selected', this.isSelected(el, groupId));
        });
    }

    async getChangedValue(event) {
        return event.detail?.item?.value || this.value;
    }
}

registerField(SelectField);
