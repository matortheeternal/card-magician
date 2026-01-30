import CardImageArtifact from './src/CardImageArtifact.js';

const L = localize('card-images-exporter');

export default class CardImagesExporter extends CardMagicianExporter {
    get options() {
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
        for await (const { card, cardCanvas } of cardSheetArtifact.cardOutputs()) {
            const filePath = `${card.card.baseCard.baseName}.${this.extension}`;
            const artifact = new CardImageArtifact(cardCanvas, this.config);
            yield { filePath, artifact };
        }
    }
}
