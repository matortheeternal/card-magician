const MERGE_THRESHOLD = 10 * 1000;

export default class HistoryEntry {
    /**
     * @abstract
     * @param {CustomEvent} event
     * @returns {boolean}
     */
    static supports(event) {
        return false;
    }

    constructor() {
        this.timestamp = Date.now();
    }

    /**
     * @param {CardMagicianCard} card
     * @param {Event} event
     * @returns {boolean}
     */
    canCombine(card, event) {
        const timeSinceLastAction = Date.now() - this.timestamp;
        return timeSinceLastAction < MERGE_THRESHOLD
            && this.constructor.supports(event);
    }

    /**
     * @abstract
     * @param {CardMagicianCard} card
     * @param {object} detail
     * @returns {HistoryEntry|undefined}
     */
    combine(card, detail) {}

    /**
     * @abstract
     */
    revert() {
        throw new Error('Not implemented');
    }

    /**
     * @abstract
     */
    replay() {
        throw new Error('Not implemented');
    }
}
