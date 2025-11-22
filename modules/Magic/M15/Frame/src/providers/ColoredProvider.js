import Provider from './Provider.js';

export default class ColoredProvider extends Provider {
    get ext() {
        return '.jpg';
    }

    get hasLandTemplates() {
        return false;
    }

    /**
     * @abstract
     * @return string
     */
    get maskFolder() {
        throw new Error('Not implemented');
    }

    /**
     * @abstract
     * @return string
     */
    get folder() {
        throw new Error('Not implemented');
    }

    async resolve(key) {
        return await this.assetURL(`${this.folder}/${key}${this.ext}`);
    }
}
