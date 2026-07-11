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

    async hash(buffer) {
        const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray
            .slice(0, 4)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
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
