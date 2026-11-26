import BaseCardModel from './BaseCardModel.js';

export default class SubcardModel extends BaseCardModel {
    isSubcard = true;

    constructor(id, parent) {
        super(id);
        this.parent = () => parent;
    }

    get pendingWork() {
        return this.parent().pendingWork;
    }

    get renderRoot() {
        return this.parent().dom.root;
    }

    get subcardKey() {
        return this.id;
    }
}
