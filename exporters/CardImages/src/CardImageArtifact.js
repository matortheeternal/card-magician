export default class CardImageArtifact extends ExportArtifact {
    constructor(card, cardCanvas, config) {
        super();
        this.card = card;
        this.cardCanvas = cardCanvas;
        this.config = config;
    }

    async toBuffer() {
        const blob = await new Promise(resolve => {
            this.cardCanvas.toBlob(resolve, this.config.imageType, this.config.quality);
        });
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}
