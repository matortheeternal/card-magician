import { loadTextFile } from './services/fsHelpers.js';
import Alpine from 'alpinejs';

export default class CardMagicianGame {
    /**
     * @param {string} gamePath - Filesystem path of the game.
     */
    constructor(gamePath) {
        this.gamePath = gamePath;
        this.name = gamePath.split('/').pop();
    }

    /**
     * Returns a path for a file in this game's folder.
     *
     * @param {string} localPath - Path relative to the game's directory.
     * @returns {string} - Fully qualified path for the file.
     */
    resolvePath(localPath) {
        return [this.gamePath, localPath].join('/');
    }

    /**
     * Returns a path for a file in this game's assets folder.
     *
     * @param {string} assetPath - Path relative to the game's `assets` directory.
     * @returns {string} - Fully qualified path for the asset.
     */
    resolveAsset(assetPath) {
        return [this.gamePath, 'assets', assetPath].join('/');
    }

    /**
     * Loads a text file from inside the game folder.
     *
     * @async
     * @param {string} localPath - Path relative to the module root.
     * @returns {Promise<string>} Resolves with the file's text content.
     */
    async loadFile(localPath) {
        return await loadTextFile(this.resolvePath(localPath));
    }

    /**
     * Loads a font file from this game's folder and registers it.
     *
     * @async
     * @param {string} fontName - Name to register the loaded font under.
     * @param {string} localPath - Path inside the module's /assets folder.
     * @returns {Promise<void>}
     */
    async loadFont(fontName, localPath) {
        await loadFont(fontName, this.resolveAsset(localPath));
    }

    /**
     * Wraps an object in Alpine.js reactivity (deep reactive proxy).
     *
     * @param {object} obj - Object to make reactive.
     * @returns {object} The reactive proxy.
     */
    makeReactive(obj) {
        return Alpine.reactive(obj);
    }

    /**
     * Returns the id of the default template to use with this game..
     *
     * @abstract
     * @returns {string|undefined}
     */
    get defaultTemplateId() {};

    /**
     * Returns all column definitions this game.
     *
     * @abstract
     * @returns {Array<Column>}
     */
    get columns() { return []; }

    /**
     * Returns an object representing a new card for this game.
     *
     * @abstract
     * @returns {Object}
     */
    newCard() {
        return { model: { front: {} } };
    }

    /**
     * Returns an object representing a new set for this game.
     *
     * @abstract
     * @returns {Object}
     */
    newSet() {
        return { cards: [], info: {} };
    }

    /**
     * Patches a set object, ensuring required properties are present.
     * Use for backwards compatibility.
     *
     * @abstract
     * @param {Object} set - Set object.
     * @returns {Object}
     */
    loadSet(set) { return set; }

    /**
     * Returns an HTML string containing the form inputs to render
     * on the set info modal for this game.
     *
     * @abstract
     * @returns {string}
     */
    async renderSetInfo() { return ''; }
}
