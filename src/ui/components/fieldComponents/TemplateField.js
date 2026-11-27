import SelectField from './SelectField.js';
import { executeAction } from '../../systems/actionSystem.js';
import { flushPendingCardSaves } from '../../systems/cardEditingSystem.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { getTemplates } from '../../../domain/template/templateRegistry.js';

export default class TemplateField extends SelectField {
    static tagName = 'cm-template-field';

    static matches(field) {
        return field.type === 'template';
    }

    get options() {
        return getTemplates().map(template => ({
            id: template.id,
            name: template.label || template.id
        }));
    }

    get isEditingCurrentCard() {
        const editorCard = this.model.parent();
        return this.isConnected
            && activeEditorCard === editorCard
            && selectedProjectCard === editorCard.baseCard;
    }

    async onChange(event) {
        const newValue = event.target.value;
        if (newValue === this.value) return;
        await flushPendingCardSaves();
        if (!this.isEditingCurrentCard || newValue === this.value) return;
        this.applyChange(newValue);
        await flushPendingCardSaves();
        if (!this.isEditingCurrentCard || newValue !== this.value) return;
        await executeAction('change-template', this.model.id, newValue);
    }
}

registerField(TemplateField);
