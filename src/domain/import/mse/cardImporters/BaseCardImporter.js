export default class BaseCardImporter {
    constructor(mseCard, cmCard, folderPath) {
        this.mseCard = mseCard;
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
     * @param mseCard
     * @param cmCard
     */
    import(mseCard, cmCard) {
        throw new Error('Not implemented');
    }
}
