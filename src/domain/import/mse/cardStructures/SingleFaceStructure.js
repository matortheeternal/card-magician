import BaseCardStructure from './BaseCardStructure.js';

export default class SingleFaceStructure extends BaseCardStructure {
    static match() {
        return true;
    }

    makeCard() {
        return this.cmCard;
    }
}
