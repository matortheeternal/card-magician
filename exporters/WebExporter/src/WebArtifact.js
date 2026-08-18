import { getPropertyWriter } from './propertyWriters.js';

export default class WebArtifact extends ExportArtifact {
    constructor(activeProject, config) {
        super();
        this.activeProject = activeProject;
        this.baseUrl = config.baseUrl;
    }

    exportCardFace(card, faceKey) {
        return Object.entries(card[faceKey]).reduce((output, [key, value]) => {
            const writer = getPropertyWriter(value);
            const outValue = writer.write(value);
            if (outValue) output[key] = outValue;
            return output;
        }, {});
    }

    get cards() {
        return this.activeProject.cards.map(card => {
            const exportedCard = { ...card };
            exportedCard.front = this.exportCardFace(card, 'front');
            if (card.back)
                exportedCard.back = this.exportCardFace(card, 'back');
            exportedCard.baseName = card.baseName;
            return exportedCard;
        });
    }

    get set() {
        return {
            ...this.activeProject,
            cards: this.cards,
            baseUrl: this.baseUrl
        }
    }

    async toBuffer() {
        return JSON.stringify(this.set);
    }
}
