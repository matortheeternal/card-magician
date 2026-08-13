import CardFileDefinition from './CardFileDefinition.js';

export default class CardImageFileDefinition extends CardFileDefinition {
    constructor(key, options = {}) {
        super(key, options);
        this.fieldPath ||= key.split('.');
        this.extension ||= '.jpg';
    }

    async setFieldValue(card, value) {
        const field = this.getField(card);
        if (!field) return;
        field.imageUrl = await this.filePathToUrl(value);
    }

    async clearFieldValue(card) {
        const field = this.getField(card);
        if (!field) return;
        field.imageUrl = null;
    }

    async getLegacyFilePath(card) {
        const field = this.getField(card);
        if (!field.imageUrl) return;
        return this.urlToFilePath(field.imageUrl);
    }
}

window.CardImageFileDefinition = CardImageFileDefinition;
