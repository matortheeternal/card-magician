export default class CardImageArtifact extends ExportArtifact {
    constructor(cardCanvas, config) {
        super();
        this.cardCanvas = cardCanvas;
        this.config = config;
    }

    get imageType() {
        return `image/${this.config.imageType.id}`;
    }

    get imageQuality() {
        return parseFloat(this.config.quality);
    }

    async toBuffer() {
        const blob = await new Promise(resolve => {
            this.cardCanvas.toBlob(resolve, this.imageType, this.imageQuality);
        });
        if (!blob) return;
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}
