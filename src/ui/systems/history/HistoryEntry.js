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
     * @param {HistoryEntry} entry
     * @returns {boolean}
     */
    canCombine(entry) {
        const timeSinceLastAction = entry.timestamp - this.timestamp;
        return timeSinceLastAction < MERGE_THRESHOLD
            && this.constructor === entry.constructor;
    }

    /**
     * @param {HistoryEntry} entry
     * @returns {HistoryEntry|undefined}
     */
    combine(entry) {}

    /**
     * @abstract
     * @returns Promise<any>
     */
    async revert() {
        throw new Error('Not implemented');
    }

    /**
     * @abstract
     * @returns Promise<any>
     */
    async replay() {
        throw new Error('Not implemented');
    }
}
