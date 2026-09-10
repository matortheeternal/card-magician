import BaseCardStructure from './BaseCardStructure.js';

export default class SkipStructure extends BaseCardStructure {
    static match(mseCard) {
        return mseCard.linked_relation_1 === 'Front Face';
    }

    makeCard() {
        return null;
    }
}
