import Alpine from 'alpinejs';
import ImageValue from './ImageValue.js';

export async function loadImage(model, dataToLoad, field) {
    const existingUrl = model[field.id]?.imageUrl;
    if (existingUrl) URL.revokeObjectURL(existingUrl);

    const stored = dataToLoad[field.id];
    return await ImageValue.load(stored);
}

class DOMBuilder {
    root = document.createElement('div');
    style = document.createElement('style');
    styles = [];

    setHTML(html) {
        this.root.innerHTML = html;
        this.root.prepend(this.style);
    }

    addCSS(css) {
        this.styles.push(css);
        this.style.innerHTML = this.styles.join('\n\n');
    }
}

class BaseCardModel {
    fields = [];
    options = [];

    constructor(key) {
        this.id = key;
    }

    async saveField(field) {
        if (field.hasOwnProperty('save'))
            return await field.save();
        if (field.type === 'image')
            return await this[field.id].save();
        return this[field.id];
    }

    async loadField(dataToLoad, field) {
        if (field.hasOwnProperty('load'))
            return await field.load(dataToLoad);
        if (field.type === 'image')
            return await loadImage(this, dataToLoad, field);
        return dataToLoad[field.id];
    }

    async save() {
        const cardData = {};
        for (const field of this.fields.concat(this.options))
            cardData[field.id] = await this.saveField(field);
        return cardData;
    }

    async load(cardData) {
        if (!cardData) return;
        for (const field of this.fields.concat(this.options)) {
            if (!cardData.hasOwnProperty(field.id)) continue;
            this[field.id] = await this.loadField(cardData, field);
        }
    }
}

class CardFaceModel extends BaseCardModel {
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

class SubCardModel extends BaseCardModel {
    isSubcard = true;
}

export function initCardFace(key) {
    return Alpine.reactive(new CardFaceModel(key));
}

export function initSubCardFace(key) {
    return Alpine.reactive(new SubCardModel(key));
}
