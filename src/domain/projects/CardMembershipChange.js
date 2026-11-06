import CardFileSnapshot from '../card/CardFileSnapshot.js';
import { flushPendingCardEdits } from '../../ui/systems/cardEditingSystem.js';

/** Apply card membership changes, retaining files and positions for reversal. */
export default class CardMembershipChange {
    constructor(project, cards, creating) {
        this.project = project;
        this.cards = [...new Set(cards)];
        this.creating = creating;
        this.backups = new Map();
    }

    prepareChange() {
        if (this.positions) return;
        this.positions = this.cards.map((card, offset) => ({
            card,
            index: this.creating
                ? this.project.cards.length + offset
                : this.project.cards.indexOf(card)
        })).sort((a, b) => a.index - b.index);

        if (this.positions.some(({ index }) => index < 0))
            throw new Error('Cannot delete a card outside this project.');
        if (this.creating && this.cards.some(card => this.project.cards.includes(card)))
            throw new Error('Cannot create a card already in this project.');
    }

    async captureBackups() {
        const backups = new Map();
        for (const card of this.cards)
            backups.set(card, await CardFileSnapshot.capture(card));
        return backups;
    }

    async deleteFiles() {
        for (const card of this.cards) await card.deleteFiles();
    }

    async restoreBackups(backups) {
        for (const backup of backups.values()) await backup.restore();
    }

    detachCard(card, backup) {
        backup?.restoreImages();
        card.files.detach();
        this.project.cards.splice(this.project.cards.indexOf(card), 1);
    }

    async remove() {
        const backups = await this.captureBackups();
        try {
            await this.deleteFiles();
        } catch (error) {
            await this.restoreBackups(backups);
            throw error;
        }
        this.backups = backups;
        for (const [card, backup] of backups) this.detachCard(card, backup);
    }

    async saveCard(card) {
        const backup = this.backups.get(card);
        backup?.restoreImages();
        await card.save(true);
        await backup?.restoreAdditionalFiles();
    }

    async removeInsertedCard(card) {
        await card.deleteFiles();
        this.detachCard(card, this.backups.get(card));
    }

    async rollbackInsert() {
        for (const card of this.cards) await this.removeInsertedCard(card);
        changed(this.project, 'cards');
    }

    async insert() {
        for (const { card, index } of this.positions)
            this.project.cards.splice(index, 0, card);
        try {
            for (const card of this.cards) await this.saveCard(card);
        } catch (error) {
            await this.rollbackInsert();
            throw error;
        }
    }

    applyMembership(forward) {
        if (this.creating === forward) return this.insert();
        return this.remove();
    }

    async change(forward) {
        if (window.activeProject !== this.project)
            throw new Error('Cannot replay card history in another project.');
        await flushPendingCardEdits();
        this.prepareChange();
        await this.applyMembership(forward);
        changed(this.project, 'cards');
        await flushPendingCardEdits();
        return true;
    }

    async replay() {
        return await this.change(true);
    }

    async revert() {
        return await this.change(false);
    }
}
