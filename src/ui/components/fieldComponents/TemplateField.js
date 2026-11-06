import SelectField from './SelectField.js';
import { executeAction } from '../../systems/actionSystem.js';
import { flushPendingCardSaves } from '../../systems/cardEditingSystem.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import {
    getTemplates, templateRegistry
} from '../../../domain/template/templateRegistry.js';

export default class TemplateField extends SelectField {
    static tagName = 'cm-template-field';

    static matches(field) {
        return field.type === 'template';
    }

    connectedCallback() {
        super.connectedCallback();
        this.watch('templates', templateRegistry, 'templates', () => this.render());
    }

    get options() {
        return getTemplates().map(template => ({
            id: template.id,
            name: template.label || template.id
        }));
    }

    async onChange(event) {
        const newValue = await this.getChangedValue(event);
        if (newValue === this.value) return;
        const faceId = this.model.id;
        await flushPendingCardSaves();
        await super.onChange(event);
        await flushPendingCardSaves();
        await executeAction('change-template', faceId, newValue);
    }
}

registerField(TemplateField);
