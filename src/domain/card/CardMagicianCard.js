import {
    getJoinedPath, getPathParts, writeBinaryFile
} from '../../shared/platformAdapter.js';
import YAMLSerializer from '../projects/serializers/YAMLSerializer.js';
import { updateBaseName } from '../projects/cardNamer.js';
import CardFiles from './CardFiles.js';
import ImageFieldValue from './ImageFieldValue.js';
import { waitForImageRetention } from './imageRetention.js';
import * as progress from '../../ui/systems/progressSystem.js';

export default class CardMagicianCard {
    #baseName;

    constructor(cardData = {}) {
        Object.assign(this, cardData);
        Object.defineProperty(this, 'files', {
            value: new CardFiles(this, this.fileDefinitions),
            enumerable: false,
            configurable: true,
        });
    }

    static async load(filePath) {
        const data = await YAMLSerializer.load(filePath);
        const projectCard = new this(data);
        await projectCard.setDataPath(filePath);
        return projectCard;
    }

    async setDataPath(filePath) {
        const { stem } = await getPathParts(filePath);
        await this.files.set('data', filePath);
        this.baseName = stem;
    }

    get fileDefinitions() {
        return [
            new window.CardFileDefinition('data', { extension: '.yml' })
        ];
    }

    get baseName() {
        return this.#baseName;
    }

    set baseName(value) {
        this.#baseName = value;
    }

    /**
     * @abstract
     * @returns {string}
     */
    get name() {
        throw new Error('Not implemented');
    }

    async loadFiles(filesByName) {
        await this.files.load(filesByName);
    }

    async renameFiles() {
        for (const [key] of this.files.entries)
            await this.files.moveToCanonicalPath(key);
    }

    async deleteFiles() {
        for (const [key] of this.files.entries)
            await this.files.remove(key);
    }

    async removeClearedImages() {
        for (const [key, field] of this.files.fields) {
            if (field.constructor !== ImageFieldValue) continue;
            if (!field?.imageUrl && this.files.has(key))
                await this.files.remove(key);
        }
    }

    async saveImages(saveAll = false) {
        for (const [key, image] of this.files.fields) {
            if (image.constructor !== ImageFieldValue) continue;
            if (!image?.imageUrl || !image.dirty && !saveAll) continue;
            const filePath = await this.files.getCanonicalPath(key);
            const data = await image.loadImageData();
            await writeBinaryFile(filePath, data);
            await this.files.set(key, filePath);
            delete image.dirty;
        }
    }

    async saveData() {
        const filePath = await getJoinedPath(
            window.activeProject.cardsFolderPath,
            `${this.baseName}.yml`
        );
        await YAMLSerializer.save(filePath, this);
        await this.files.set('data', filePath);
    }

    async save(saveAll = false) {
        await waitForImageRetention(this);
        if (!window.activeProject.cardsFolderPath) return;
        updateBaseName(this);
        progress.setOperation(`Saving card ${this.baseName}`);
        await this.removeClearedImages();
        await this.renameFiles();
        await this.saveData();
        await this.saveImages(saveAll);
    }
}

window.CardMagicianCard = CardMagicianCard;
