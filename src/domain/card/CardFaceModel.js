import BaseCardModel from './BaseCardModel.js';
import DOMBuilder from './DomBuilder.js';

export default class CardFaceModel extends BaseCardModel {
    dom = new DOMBuilder();
    form = new DOMBuilder();
    optionsForm = new DOMBuilder();
    subcards = [];

    async save() {
        const cardData = await super.save();
        for (const subCard of this.subcards)
            cardData[subCard.id] = await subCard.save();
        return cardData;
    }

    async load(cardData) {
        await super.load(cardData);
        for (const subcard of this.subcards) {
            if (!cardData.hasOwnProperty(subcard.id)) continue;
            await subcard.load(cardData[subcard.id]);
        }
    }
}
