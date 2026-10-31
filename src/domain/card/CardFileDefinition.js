import { getJoinedPath, getPathParts } from '../../shared/platformAdapter.js';

export default class CardFileDefinition {
    constructor(key, options = {}) {
        this.key = key;
        this.suffix = options.suffix || '';
        this.fieldPath = options.fieldPath;
        this.extension = options.extension;
    }

    getField(card) {
        return this.fieldPath?.reduce(
            (value, property) => value?.[property],
            card
        );
    }

    async filePathToUrl(filePath) {
        const { filename } = await getPathParts(filePath);
        return `/project/cards/${encodeURIComponent(filename)}`;
    }

    async urlToFilePath(mountedUrl) {
        const filename = mountedUrl.split('/').pop();
        return getJoinedPath(
            window.activeProject.cardsFolderPath,
            decodeURIComponent(filename)
        );
    }

    /**
     * @abstract
     * @param filePath
     */
    async refresh(filePath) {}

    /**
     * @abstract
     * @param card
     * @param value
     */
    setFieldValue(card, value) {
        if (!this.fieldPath) return;
        throw new Error('Not implemented');
    }

    /**
     * @abstract
     * @param card
     * @returns {Promise<void>}
     */
    async clearFieldValue(card) {
        if (!this.fieldPath) return;
        throw new Error('Not implemented');
    }

    getFilename(card) {
        return card.baseName + this.suffix + this.extension;
    }

    /**
     * @abstract
     * @param card
     * @param filesByName
     * @returns {string|undefined}
     */
    getLegacyFilePath(card, filesByName) {}
}

window.CardFileDefinition = CardFileDefinition;
