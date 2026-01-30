export default class CardImageArtifact extends ExportArtifact {
    constructor(cardCanvas, config) {
        super();
        this.cardCanvas = cardCanvas;
        this.config = config;
    }

    get imageType() {
        return this.config.imageType;
    }

    get imageQuality() {
        return parseFloat(this.config.quality);
    }

    async toBuffer() {
        const blob = await new Promise(resolve => {
            this.cardCanvas.toBlob(resolve, this.imageType, this.imageQuality);
        });
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}
