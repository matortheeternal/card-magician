import { watchFile } from '../../shared/fileWatcher.js';
import platform from '../../shared/platformAdapter.js';
import { loadTextFile } from '../../shared/fsUtils.js';
import SerializerAdapter from '../projects/adapters/SerializerAdapter.js';
import {
    registerAdapter,
    registerBinaryAdapter
} from '../projects/adapters/adapterRegistry.js';
import { initializeFields } from '../../ui/systems/fieldSystem.js';
import { registerModal } from '../../ui/modals/modalManager.js';
import { registerSettings } from '../../ui/settings/settingsRegistry.js';
import { loadFont } from '../template/dynamicFontLoader.js';
import hljs from 'highlight.js';
import * as styleManager from '../../ui/systems/styleManager.js';
import { manageCollection } from '../../shared/storageUtils.js';
import StatisticsRegistry from '../statistics/StatisticsRegistry.js';

/** @type {typeof platform & { watchFile: typeof watchFile }} */
const gamePlatform = Object.assign(Object.create(platform), { watchFile });

export default class CardMagicianGame {
    /**
     * @param {GameMetadata} metadata - Metadata loaded and parsed from game.json.
     */
    constructor(metadata) {
        this.gamePath = metadata.path;
        this.id = metadata.id;
        this.version = metadata.version;
        /** @type {string} */
        this.name = this.gamePath.split('/').pop();
        /** @type {CardMagicianCardConstructor} */
        this.Card = window.CardMagicianCard;
        /** @type {CardMagicianProjectConstructor} */
        this.Project = CardMagicianProject;
        this.statistics = new StatisticsRegistry();
    }

    initializeCardFace(face) {}

    get platform() {
        return gamePlatform;
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
        return loadTextFile(this.resolvePath(localPath));
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
     * Custom element name for the game's default Statistics page.
     *
     * @returns {string|null}
     *   Registered custom element name, or null when statistics are not provided.
     */
    get statisticsComponent() { return null; }

    /**
     * Registers a SerializerAdapter constructed by a passed factory
     * function with the adapter registry, allowing it to be used when
     * loading and saving set files.
     *
     * @param {function(SerializerAdapter)} factory
     * @param {boolean} [asBinaryAdapter=false]
     * @returns {object}
     */
    addSerializerAdapter(factory, asBinaryAdapter = false) {
        const register = asBinaryAdapter
            ? registerBinaryAdapter
            : registerAdapter;
        register(factory(SerializerAdapter));
    }

    /**
     * Creates a manager for a collection persisted as YAML on disk.
     * Await load() before accessing items. Manager mutations schedule debounced
     * saves; direct item edits require scheduleSave(). Await flush() to finish
     * pending writes.
     *
     * @param {CollectionOptions} options - Persistence and item callbacks.
     * @returns {CollectionManager}
     *   A new manager whose collection has not yet been loaded.
     */
    manageCollection(options) {
        return manageCollection(options);
    }

    /**
     * This function gets called when a user attempts to filter a set of cards.
     * Return an array of cards that match the query. For filter engine, consider
     * using sigil-sifter.
     *
     * @param {Array<card>} cards
     * @param {string} query
     * @returns {Array<card>}
     */
    filter(cards, query) {}

    /**
     * Initializes a set of fields on a passed object and returns a reference to the
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

    /**
     * Registers a settings tab in the settings modal. Every game should register a
     * project details settings tab.
     *
     * @param {CardMagicianSettings} SettingsClass
     */
    registerSettings(SettingsClass) {
        registerSettings(SettingsClass);
    }

    registerLanguage(languageName, language, css) {
        hljs.registerLanguage(languageName, language);
        styleManager.addStyle(`language-${languageName}`, css);
        return function update(updatedLanguage) {
            hljs.unregisterLanguage(languageName);
            hljs.registerLanguage(languageName, updatedLanguage);
        };
    }
}

window.CardMagicianGame = CardMagicianGame;
