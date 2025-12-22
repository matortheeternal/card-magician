import { loadTextFile } from '../../shared/fsUtils.js';
import Alpine from 'alpinejs';
import SerializerAdapter from '../sets/adapters/SerializerAdapter.js';
import {
    registerAdapter,
    registerBinaryAdapter
} from '../sets/adapters/adapterRegistry.js';
import { initializeFields } from '../../ui/systems/fieldSystem.js';
import { registerModal } from '../../ui/modals/modalManager.js';
import { loadFont } from '../template/fontService.js';

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
     * Returns the id of the default template to use with this game.
     *
     * @abstract
     * @returns {string|undefined}
     */
    get defaultTemplateId() {
        return undefined;
    };

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
        return { front: {}, notes: '', tags: [] };
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

    /**
    * Returns the current active set
    *
    * @returns {object}
    */
    getActiveSet() {
        return Alpine.store('views').activeSet;
    }

    /**
     * Registers a SerializerAdapter constructed by a passed factory
     * function with the adapter registry, allowing it to be used when
     * loading and saving set files.
     *
     * @param {function(SerializerAdapter)} factory
     * @param {boolean=false} asBinaryAdapter
     * @returns {object}
     */
    addSerializerAdapter(factory, asBinaryAdapter = false) {
        const register = asBinaryAdapter
            ? registerBinaryAdapter
            : registerAdapter;
        register(factory(SerializerAdapter));
    }

    /**
     * This function gets called after the init function is called.
     * Use this function to configure SigilSifter to work with your game mode.
     *
     * @param {SigilSifter} sifter
     */
    setupSearch(sifter) {}

    /**
     * Initializes a set of fields on a passed object, and returns a reference to the
     * object. When no object is passed, it creates a new object.
     *
     * @param fields
     * @param {object=} obj
     * @returns {object}
     */
    initializeFields(fields, obj = {}) {
        return initializeFields(fields, obj);
    }

    /**
     * Registers a modal with the modal manager. Every game should register a
     * set info modal.
     *
     * @param {Modal} ModalClass
     */
    registerModal(ModalClass) {
        registerModal(ModalClass);
    }
}
