import { getActiveGame } from '../game/gameManager.js';
import { loadTextFile } from '../../shared/fsUtils.js';
import { getActiveSet } from '../sets/setManager.js';
import { initializeFields } from '../../ui/systems/fieldSystem.js';

/**
 * @typedef OutputItem
 *
 * @property {string} filePath
 *  Relative file path to write the artifact to.
 * @property {ExportArtifact} artifact
 *  Artifact object to write to disk.
 */

export default class CardMagicianExporter {
    constructor(config, metadata) {
        this.config = Object.assign(this.defaultConfig, config || {});
        this.metadata = metadata;
    }

    get id() {
        return this.metadata.id;
    }

    get folder() {
        return this.metadata.folder || this.metadata.id;
    }

    get version() {
        return this.metadata.version;
    }

    get dependencies() {
        return this.metadata.dependencies || [];
    }

    get exporterPath() {
        return this.metadata.path;
    }

    get defaultConfig() {
        return initializeFields(this.constructor.options);
    }

    /**
     * Returns the current active set.
     *
     * @returns {object}
     */
    get activeSet() {
        return getActiveSet();
    }

    /**
     * Returns the current active game.
     *
     * @returns {object}
     */
    get activeGame() {
        return getActiveGame();
    }

    /**
     * Returns a path for a file in this module's folder.
     *
     * @param {string} localPath - Path relative to the module's directory.
     * @returns {string} - Fully qualified path for the file.
     */
    resolvePath(localPath) {
        return ['exporters', this.exporterPath, localPath].join('/');
    }

    /**
     * Returns a path for a file in this module's assets folder.
     *
     * @param {string} assetPath - Path relative to the module's `assets` directory.
     * @returns {string} - Fully qualified path for the asset.
     */
    resolveAsset(assetPath) {
        return ['exporters', this.exporterPath, 'assets', assetPath].join('/');
    }

    /**
     * Loads a text file from inside the module folder.
     *
     * @async
     * @param {string} localPath - Path relative to the module root.
     * @returns {Promise<string>} Resolves with the file's text content.
     */
    async loadFile(localPath) {
        return loadTextFile(this.resolvePath(localPath));
    }

    /**
     * Returns the option field definitions for this exporter.
     *
     * @abstract
     * @returns {Array<Field>}
     */
    get options() {
        return [];
    }

    /**
     * @abstract
     * Invoked once before transforms and manifest access.
     *
     * @returns {Promise<void>}
     */
    async prepare() {}

    /**
     * @abstract
     * Invoked with each artifact output from exporters this exporter depends on.
     *
     * @template {ExportArtifact} T
     * @param {T} artifact
     * @yields {Promise<OutputItem>}
     */
    async *transform(artifact) {}

    /**
     * @abstract
     * Asynchronously generates outputs to write to disk or pass to later exporters.
     *
     * @yields {Promise<OutputItem>}
     */
    async *produce() {}

    /**
     * @abstract
     * Returns the number of distinct artifacts this exporter will output given
     * a number of artifacts that will be passed to its transform function.
     * @param {number} inputCount
     * @returns {number}
     */
    getOutputCount(inputCount) {
        return 0;
    }
}

window.CardMagicianExporter = CardMagicianExporter;
