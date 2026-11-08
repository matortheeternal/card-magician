import ImageFieldValue from './ImageFieldValue.js';
import { retainImage } from './imageRetention.js';
import platform from '../../shared/platformAdapter.js';

/** File/content backup independent of history grouping and card-list changes. */
export default class CardFileSnapshot {
    constructor(card) {
        this.card = card;
        this.files = new Map();
        this.images = [];
    }

    static async capture(card) {
        const snapshot = new this(card);
        await snapshot.captureFiles();
        await snapshot.captureImages();
        return snapshot;
    }

    async captureFiles() {
        for (const [key, path] of this.card.files.entries) {
            const blob = new Blob([await platform.readBinaryFile(path)]);
            this.files.set(key, { key, path, blob });
        }
    }

    async captureImage(key, image) {
        if (!(image instanceof ImageFieldValue) || !image.imageUrl) return;
        const value = await retainImage(image, this.files.get(key)?.blob);
        this.images.push({ image, value });
    }

    async captureImages() {
        for (const [key, image] of this.card.files.fields)
            await this.captureImage(key, image);
    }

    restoreImages() {
        for (const { image, value } of this.images) {
            image.imageUrl = value.imageUrl;
            image.dirty = true;
        }
    }

    async restoreFile(file, path) {
        await platform.writeBinaryFile(path, await file.blob.arrayBuffer());
        await this.card.files.set(file.key, path);
    }

    /** Roll back a failed deletion to the original paths. */
    async restore() {
        this.restoreImages();
        for (const file of this.files.values())
            await this.restoreFile(file, file.path);
    }

    async restoreAdditionalFile(file) {
        if (file.key === 'data' || this.card.files.has(file.key)) return;
        const path = await this.card.files.getCanonicalPath(file.key);
        await this.restoreFile(file, path);
    }

    /** Card.save() regenerates data/images; restore any other tracked files. */
    async restoreAdditionalFiles() {
        for (const file of this.files.values())
            await this.restoreAdditionalFile(file);
    }
}
