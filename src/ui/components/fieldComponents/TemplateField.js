import FieldComponent from './FieldComponent.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { openModal } from '../../modals/modalManager.js';
import {
    getGameTemplates, getTemplate
} from '../../../domain/template/templateRegistry.js';
import { AUTO_TEMPLATE } from '../../../domain/template/autoTemplate.js';
import { templateLabel } from '../../modals/templatePickerModal/templateLabels.js';

const L = localize('card-form');

export default class TemplateField extends FieldComponent {
    static tagName = 'cm-template-field';

    static matches(field) {
        return field.type === 'template';
    }

    get button() {
        return this.querySelector('sl-button');
    }

    get templateName() {
        return this.querySelector('span');
    }

    get selectedTemplate() {
        return getTemplate(this.value)?.id ?? this.value;
    }

    get cardForm() {
        return this.closest('cm-card-form');
    }

    bind() {
        this.handleEvents('click', { chooseTemplate: () => this.openPicker() });
    }

    render() {
        this.innerHTML = (
            `<div>${this.field.label}</div>
            <span></span>
            <sl-button size="small" data-click-action="chooseTemplate">
                ${L`Change template…`}
            </sl-button>`
        );
        this.loadValue();
    }

    loadValue() {
        const resolvedName = templateLabel(this.model.resolvedTemplate);
        const label = this.value === AUTO_TEMPLATE
            ? L`Auto · ${resolvedName}`
            : templateLabel(getTemplate(this.value) ?? this.model.resolvedTemplate);
        this.templateName.innerHTML = label;
    }

    get card() {
        return this.model.parent().baseCard;
    }

    inputValue(value) {
        return this.cardForm.changeTemplate(this.card, this.model.id, value);
    }

    openPicker() {
        const { cardForm, card } = this;
        const faceId = this.model.id;
        openModal('cm-template-picker-modal', {
            templates: getGameTemplates(activeGame.id),
            selected: this.selectedTemplate,
            onSelect: value => cardForm.changeTemplate(card, faceId, value),
            onClose: () => cardForm.focusTemplateButton(card, faceId)
        });
    }
}

registerField(TemplateField);
