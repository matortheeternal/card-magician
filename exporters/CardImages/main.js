import CardImageArtifact from './src/CardImageArtifact.js';

const L = localize('card-images-exporter');

export default class CardImagesExporter extends CardMagicianExporter {
    saveOutputs = true;

    static get options() {
        return [{
            id: 'imageType',
            label: L`Image Type`,
            type: 'select',
            options: [
                { id: 'image/jpg', name: L`JPG` },
                { id: 'image/png', name: L`PNG` },
            ]
        }, {
            id: 'quality',
            label: L`Image Quality`,
            default: '0.92'
        }, {
            id: 'scale',
            label: L`Scale`,
            default: '2'
        }];
    }

    get extension() {
        return this.config.imageType.split('/').pop();
    }

    /**
     * @param {CardSheetArtifact} cardSheetArtifact
     * @yields {Promise<OutputItem>}
     */
    async *transform(cardSheetArtifact) {
        for await (const { card, cardCanvas } of cardSheetArtifact.cardOutputs({
            scale: this.scale
        })) {
            const hasBackFace = Object.hasOwn(card.card.baseCard, 'back');
            const suffix = hasBackFace ? ` - ${card.faceKey}` : '';
            const filePath = `${card.card.baseCard.baseName}${suffix}.${this.extension}`;
            const artifact = new CardImageArtifact(cardCanvas, this.config);
            yield { filePath, artifact };
        }
    }

    getOutputCount() {
        return this.activeSet.cards.reduce((total, card) => {
            return total + 1 + (Object.hasOwn(card, 'back') ? 1 : 0);
        }, 0);
    }
}
