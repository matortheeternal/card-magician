import HistoryEntry from './HistoryEntry.js';
import { flushPendingCardEdits } from '../cardEditingSystem.js';
import { setActiveEditorCard } from '../../../domain/projects/projectManager.js';

function assignValue(model, key, value) {
    changed(model, key);
    if (value === undefined) return delete model[key];
    model[key] = structuredClone(value);
}

function assignValues(model, values) {
    for (const [key, value] of Object.entries(values)) assignValue(model, key, value);
}

export default class CardBatchChange extends HistoryEntry {
    static supports(event) {
        return event?.type === 'cm-cards-edited'
            && Array.isArray(event.detail?.changes)
            && event.detail.changes.length > 0;
    }

    constructor(project, event) {
        super();
        this.project = project;
        this.changes = event.detail.changes.map(change => ({
            card: change.card,
            model: change.model ?? change.card,
            oldValues: structuredClone(change.oldValues),
            newValues: structuredClone(change.newValues)
        }));
        this.cards = [...new Set(this.changes.map(change => change.card))];
    }

    applyValues(key) {
        for (const change of this.changes) assignValues(change.model, change[key]);
    }

    async saveCards(previousKey) {
        const saved = [];
        try {
            for (const card of this.cards) {
                await card.save();
                saved.push(card);
            }
        } catch (error) {
            this.applyValues(previousKey);
            for (const card of saved) await card.save();
            throw error;
        }
    }

    async refreshEditor() {
        if (!this.cards.includes(window.selectedProjectCard)) return;
        await setActiveEditorCard(window.selectedProjectCard);
    }

    async change(key, previousKey) {
        if (window.activeProject !== this.project)
            throw new Error('Cannot replay card history in another project.');
        await flushPendingCardEdits();
        this.applyValues(key);
        await this.saveCards(previousKey);
        await this.refreshEditor();
        changed(this.project, 'cards');
        return true;
    }

    async replay() {
        return await this.change('newValues', 'oldValues');
    }

    async revert() {
        return await this.change('oldValues', 'newValues');
    }
}
