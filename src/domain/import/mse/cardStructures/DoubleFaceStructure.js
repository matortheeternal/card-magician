import BaseCardStructure from './BaseCardStructure.js';

export default class DoubleFaceStructure extends BaseCardStructure {
    static match(mseCard) {
        return mseCard.linked_relation_1 === 'Back Face';
    }

    makeCard() {
        const backCard = this.cardsByUid.get(this.mseCard.linked_card_1);
        if (!backCard)
            throw new Error(`Could not find back face for "${this.mseCard.name}".`);
        this.cmCard.back = backCard.front;
        return this.cmCard;
    }
}
