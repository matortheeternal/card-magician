import HistoryEntry from './HistoryEntry.js';

/** Track an already completed membership change, including batch operations. */
export default class CardListChange extends HistoryEntry {
    static supports(event) {
        return ['cm-cards-created', 'cm-cards-deleted'].includes(event?.type)
            && Boolean(event.detail?.change);
    }

    constructor(project, event) {
        super();
        this.change = event.detail.change;
    }

    async replay() {
        return await this.change.replay();
    }

    async revert() {
        return await this.change.revert();
    }
}
