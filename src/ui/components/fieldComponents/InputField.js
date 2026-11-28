import { markInspectionTarget } from './inspectionTargets.js';
import FieldComponent from './FieldComponent.js';
import { esc } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

const L = localize('card-form');

export default class InputField extends FieldComponent {
    static tagName = 'cm-input';
    #inspectionFindings = [];

    static matches(field) {
        return field.type === 'input' || !field.type;
    }

    setModelAndField(model, field) {
        this.eventKey = field.eventKey ?? 'sl-input';
        super.setModelAndField(model, field);
    }

    get input() {
        return this.querySelector('sl-input');
    }

    get inspectionButton() {
        return this.input.querySelector('sl-icon-button[slot="suffix"]');
    }

    setInspectionFindings(findings) {
        this.#inspectionFindings = findings;
        this.renderInspectionWarning();
    }

    createInspectionButton() {
        const icon = document.createElement('sl-icon-button');
        icon.slot = 'suffix';
        icon.name = 'exclamation-triangle';
        icon.label = L`Inspection warning`;
        icon.setAttribute('aria-haspopup', 'dialog');
        this.input.append(icon);
        return icon;
    }

    renderInspectionWarning() {
        const findings = this.#inspectionFindings;
        this.input.classList.toggle('inspection-warning', findings.length > 0);
        if (!findings.length) {
            this.inspectionButton?.remove();
            return;
        }
        const icon = this.inspectionButton ?? this.createInspectionButton();
        markInspectionTarget(icon, findings);
    }

    render() {
        this.innerHTML = (
            `<sl-input
              size="small"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              placeholder="${esc(this.field.placeholder || '')}"
              autocomplete="off"
              type="${this.field.inputType || 'text'}"
            ></sl-input>`
        );
        this.loadValue();
        this.renderInspectionWarning();
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

registerField(InputField);
