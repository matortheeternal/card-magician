export default class CardImageArtifact extends ExportArtifact {
    constructor(baseCard, faceKey, cardCanvas, config) {
        super();
        this.baseCard = baseCard;
        this.faceKey = faceKey;
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

    async getExportFilePath(folder, localPath, output) {
        const hash = await this.hash(output);
        const fixedPath = localPath.replaceAll('[HASH]', hash);
        const filePath = await super.getExportFilePath(folder, fixedPath);
        this.baseCard.imageExports ||= {};
        this.baseCard.imageExports[this.faceKey] = fixedPath;
        this.baseCard.dirty = true;
        return filePath;
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
