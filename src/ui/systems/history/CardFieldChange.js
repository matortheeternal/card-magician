import HistoryEntry from './HistoryEntry.js';
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';
import {
    prepareImageRetention, retainImage
} from '../../../domain/card/imageRetention.js';
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

    prepare() {
        if (!(this.oldValue instanceof ImageFieldValue)
            && !(this.newValue instanceof ImageFieldValue)) return super.prepare();
        this.preparation ||= prepareImageRetention(this.card, () => this.retainValues());
        return this.preparation;
    }

    retainValue(value) {
        if (value instanceof ImageFieldValue) return retainImage(value);
        return Promise.resolve(value);
    }

    hasSameImageSource() {
        return this.oldValue instanceof ImageFieldValue
            && this.newValue instanceof ImageFieldValue
            && this.oldValue.imageUrl === this.newValue.imageUrl;
    }

    async retainNewValue(oldValue) {
        if (!this.hasSameImageSource()) return this.retainValue(this.newValue);
        const retained = this.newValue.clone();
        retained.imageUrl = (await oldValue).imageUrl;
        return retained;
    }

    async retainValues() {
        const oldValue = this.retainValue(this.oldValue);
        const newValue = this.retainNewValue(oldValue);
        [this.oldValue, this.newValue] = await Promise.all([oldValue, newValue]);
    }

    canCombine(entry) {
        return super.canCombine(entry)
            && this.card === entry.card
            && this.fieldId === entry.fieldId
            && this.modelKey === entry.modelKey
            && this.faceId === entry.faceId;
    }

    copyValue(value) {
        return value instanceof ImageFieldValue
            ? value.clone()
            : structuredClone(value);
    }

    combine(entry) {
        if (!this.canCombine(entry)) return;
        this.newValue = this.copyValue(entry.newValue);
        this.timestamp = entry.timestamp;
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
        await this.prepare();
        return await this.setValue(this.newValue);
    }

    async revert() {
        await this.prepare();
        return await this.setValue(this.oldValue);
    }
}
