import CardFieldChange from './CardFieldChange.js';
import { flushPendingCardSaves } from '../cardEditingSystem.js';
import { setActiveEditorCard } from '../../../domain/projects/projectManager.js';

export default class CardTemplateChange extends CardFieldChange {
    static supports(event) {
        return super.supports(event) && event.detail.fieldId === 'template';
    }

    constructor(card, event) {
        super(card, event);
        this.project = activeProject;
    }

    canCombine() {
        return false;
    }

    async setValue(value) {
        if (activeProject !== this.project)
            throw new Error('Cannot replay card history in another project.');
        await flushPendingCardSaves();
        const saved = await super.setValue(value);
        if (!saved) return false;
        if (selectedProjectCard === this.card)
            await setActiveEditorCard(this.card);
        return true;
    }
}
