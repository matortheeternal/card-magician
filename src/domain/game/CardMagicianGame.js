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

export default class CardMagicianGame {
    /**
     * @param {string} gamePath - Filesystem path of the game.
     */
    constructor(gamePath) {
        this.gamePath = gamePath;
        this.name = gamePath.split('/').pop();
        this.Card = window.CardMagicianCard;
        this.Project = CardMagicianProject;
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
     * This function gets called when a user attempts to search a set of cards.
     * Return an array of cards that match the query. For search engine, consider
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
