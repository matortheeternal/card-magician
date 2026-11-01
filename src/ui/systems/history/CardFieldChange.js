import HistoryEntry from './HistoryEntry.js';
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';
import { executeAction } from '../actionSystem.js';

const report = createReporter({ unit: 'CardFieldChange' });

export default class CardFieldChange extends HistoryEntry {
    static supports(event) {
        return Boolean(event)
            && Boolean(event.detail)
            && event.type === 'cm-field-changed'
            && Object.hasOwn(event.detail, 'faceId')
            && Object.hasOwn(event.detail, 'fieldId')
            && Object.hasOwn(event.detail, 'oldValue')
            && Object.hasOwn(event.detail, 'newValue');
    }

    constructor(card, event) {
        super();
        this.card = card;
        this.faceId = event.detail.faceId;
        this.modelKey = event.detail.modelKey;
        this.fieldId = event.detail.fieldId;
        this.oldValue = this.copyValue(event.detail.oldValue);
        this.newValue = this.copyValue(event.detail.newValue);
    }

    canCombine(card, event) {
        return super.canCombine(card, event)
            && this.card === card
            && this.fieldId === event.detail.fieldId
            && this.modelKey === event.detail.modelKey
            && this.faceId === event.detail.faceId;
    }

    copyValue(value) {
        return value instanceof ImageFieldValue
            ? value.clone()
            : structuredClone(value);
    }

    combine(card, event) {
        if (!this.canCombine(card, event)) return;
        this.newValue = this.copyValue(event.detail.newValue);
        this.timestamp = Date.now();
        return this;
    }

    resolveModel(card) {
        const face = card[this.faceId];
        return this.modelKey ? face[this.modelKey] : face;
    }

    updateCard(card, value) {
        const model = this.resolveModel(card);
        model[this.fieldId] = this.copyValue(value);
        changed(model, this.fieldId);
    }

    async setValue(value) {
        const isSelected = selectedProjectCard === this.card;
        if (isSelected) this.updateCard(activeEditorCard, value);
        this.updateCard(this.card, value);
        try {
            executeAction('set-status', 'saving');
            await this.card.save();
            executeAction('set-status', 'saved');
            return true;
        } catch (error) {
            report('setValue', error, [this]);
            executeAction('set-status', 'failed');
            return false;
        }
    }

    async replay() {
        return await this.setValue(this.newValue);
    }

    async revert() {
        return await this.setValue(this.oldValue);
    }
}
