import CardImageArtifact from './src/CardImageArtifact.js';

export default class CardImagesExporter extends CardMagicianExporter {
    get defaultConfig() {
        return {
            imageType: 'image/jpg',
            quality: 0.92,
            scale: 1.5
        };
    }

    /**
     * @param {CardSheetArtifact} cardSheetArtifact
     * @yields {Promise<OutputItem>}
     */
    async *transform(cardSheetArtifact) {
        for await (const { card, cardCanvas } of cardSheetArtifact.cardOutputs) {
            const filePath = `${card.baseName}.${this.extension}`;
            const artifact = new CardImageArtifact(card, cardCanvas, this.config);
            yield { filePath, artifact };
        }
    }
}
