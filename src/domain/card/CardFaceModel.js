import BaseCardModel from './BaseCardModel.js';
import DOMBuilder from './DomBuilder.js';
import PendingWork from './PendingWork.js';

export default class CardFaceModel extends BaseCardModel {
    dom = new DOMBuilder();
    form = new DOMBuilder();
    optionsForm = new DOMBuilder();
    subcards = [];
    pendingWork = new PendingWork();

    dispose() {
        super.dispose();
        this.subcards.forEach(subcard => subcard.dispose());
    }

    async save() {
        const cardFaceData = await super.save();
        for (const subcard of this.subcards)
            cardFaceData[subcard.id] = await subcard.save();
        return cardFaceData;
    }

    async load(cardFaceData) {
        await super.load(cardFaceData);
        for (const subcard of this.subcards) {
            if (!Object.hasOwn(cardFaceData, subcard.id)) continue;
            await subcard.load(cardFaceData[subcard.id]);
        }
    }
}
