import {
    getJoinedPath,
    getPathParts, moveFile, rmrf, writeBinaryFile
} from '../../shared/neutralinoAdapter.js';
import YAMLSerializer from '../projects/serializers/YAMLSerializer.js';
import { updateBaseName } from '../projects/cardNamer.js';

export default class CardMagicianCard {
    constructor(data = {}) {
        Object.assign(this, data);
        this.files = {};
    }

    static async load(filePath) {
        const data = await YAMLSerializer.load(filePath);
        const card = new this(data);
        await card.setDataPath(filePath);
        return card;
    }

    async setDataPath(filePath) {
        const { stem } = await getPathParts(filePath);
        this.baseName = stem;
        this.files.data = filePath;
    }

    get name() {
        return '';
    }

    *getFileEntries(files) {
        for (const [key, value] of Object.entries(files)) {
            if (value && typeof value === 'object') {
                yield* this.getFileEntries(value);
                continue;
            }

            yield {
                change: v => { files[key] = v; },
                filePath: value
            };
        }
    }

    async renameFiles(cardsFolderPath) {
        if (!this.files.data) return;
        const prefixLength = this.files.data.length - 4;
        for (const entry of this.getFileEntries(this.files)) {
            const suffix = entry.filePath.slice(prefixLength);
            const newFileName = this.baseName + suffix;
            const newFilePath = await getJoinedPath(cardsFolderPath, newFileName);
            if (newFilePath === entry.filePath) continue;
            await moveFile(entry.filePath, newFilePath);
            entry.change(newFilePath);
        }
    }

    async deleteFiles() {
        for (const entry of this.getFileEntries(this.files))
            await rmrf(entry.filePath);
    }

    /**
     * @abstract
     * @param {boolean} saveAll
     * @returns {Promise<object>}
     */
    async getImages(saveAll) {
        throw new Error('Not implemented');
    }

    async saveImages(cardsFolderPath, saveAll = false) {
        const images = await this.getImages(saveAll);
        for (const { data, key, value } of images) {
            const filename = images.length > 1
                ? `${this.baseName} - ${key.toTitleCase()}.jpg`
                : `${this.baseName}.jpg`;
            const filePath = await getJoinedPath(cardsFolderPath, filename);
            await writeBinaryFile(filePath, data);
            const filenameUrlPart = encodeURIComponent(filename);
            value.imageUrl = await getJoinedPath('/project/cards', filenameUrlPart);
            delete value.dirty;
        }
    }

    async saveData(cardsFolderPath) {
        const basePath = await getJoinedPath(cardsFolderPath, this.baseName);
        const filePath = `${basePath}.yml`;
        await YAMLSerializer.save(filePath, this);
        this.files.data = filePath;
    }

    async save() {
        const cardsFolderPath = window.activeProject.cardsFolderPath;
        if (!cardsFolderPath) return;
        updateBaseName(this);
        await this.renameFiles(cardsFolderPath);
        await this.saveData(cardsFolderPath);
        await this.saveImages(cardsFolderPath);
    }
}

window.CardMagicianCard = CardMagicianCard;
