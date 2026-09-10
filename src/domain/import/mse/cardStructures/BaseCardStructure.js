export default class BaseCardStructure {
    constructor(mseCard, cmCard, cardsByUid) {
        this.mseCard = mseCard;
        this.cmCard = cmCard;
        this.cardsByUid = cardsByUid;
    }

    /**
     * @abstract
     */
    static match(mseCard, cmCard, cardsByUid) {
        return false;
    }

    /**
     * @abstract
     * @returns CardMagicianCard
     */
    makeCard() {
        throw new Error('Not implemented');
    }
}
