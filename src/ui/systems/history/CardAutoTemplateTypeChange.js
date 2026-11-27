import CardFieldChange from './CardFieldChange.js';
import {
    AUTO_TEMPLATE, isAutoTemplateField
} from '../../../domain/template/autoTemplate.js';
import { refreshAutoTemplate } from '../../../domain/projects/projectManager.js';
import { flushPendingCardSaves } from '../cardEditingSystem.js';

export default class CardAutoTemplateTypeChange extends CardFieldChange {
    static supports(event) {
        return super.supports(event)
            && !event.detail.modelKey
            && isAutoTemplateField(event.detail.fieldId);
    }

    async setValue(value) {
        if (selectedProjectCard !== this.card
            || activeEditorCard?.[this.faceId]?.template !== AUTO_TEMPLATE)
            return super.setValue(value);
        await flushPendingCardSaves();
        const saved = await super.setValue(value);
        if (saved) await refreshAutoTemplate(this.card);
        return saved;
    }
}
