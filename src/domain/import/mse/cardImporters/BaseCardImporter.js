export default class BaseCardImporter {
    constructor(mseCard, cmCard, mseSet, folderPath) {
        this.mseCard = mseCard;
        this.mseSet = mseSet;
        this.cmCard = cmCard;
        this.folderPath = folderPath;
    }

    /**
     * @abstract
     * @param mseCard
     * @param mseSet
     * @returns {boolean}
     */
    static match(mseCard, mseSet) {
        return false;
    }

    /**
     * @abstract
     * @returns {string}
     */
    get template() {
        throw new Error('Not implemented');
    }

    /**
     * @desc Returns styling data for the card.
     * @returns {object}
     */
    get stylingData() {
        return this.mseCard.has_styling === 'false'
            ? this.mseSet.styling?.[`magic-${this.mseCard.stylesheet}`]
            : this.mseCard.styling_data;
    }

    /**
     * @abstract
     * @param mseCard
     * @param cmCard
     */
    import(mseCard, cmCard) {
        throw new Error('Not implemented');
    }
}
