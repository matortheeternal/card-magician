import BaseCardModel from './BaseCardModel.js';

export default class SubcardModel extends BaseCardModel {
    isSubcard = true;

    constructor(id, parent) {
        super(id);
        this.parent = () => parent;
    }
}
