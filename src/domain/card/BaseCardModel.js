import ImageFieldValue from './ImageFieldValue.js';

export default class BaseCardModel {
    fields = [];
    options = [];

    constructor(key) {
        this.id = key;
    }

    async saveField(field) {
        if (field.hasOwnProperty('save'))
            return await field.save(this[field.id]);
        if (field.type === 'image')
            return await this[field.id].save();
        return this[field.id];
    }

    async loadField(dataToLoad, field) {
        if (field.hasOwnProperty('load'))
            return await field.load(dataToLoad);
        if (field.type === 'image')
            return await ImageFieldValue.load(dataToLoad[field.id]);
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
