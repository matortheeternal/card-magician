import {
    getJoinedPath, getParentPath, getPathParts,
    mount, unmount
} from '../../shared/neutralinoAdapter.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { checkFileExists, find } from '../../shared/fsUtils.js';
import { getTags, loadTags } from '../game/tagManager.js';
import * as progress from '../../ui/systems/progressSystem.js';
import { updateBaseNames } from './cardNamer.js';

export default class CardMagicianProject {
    #filePath = '';
    #folderPath = '';
    #cardsFolderPath = '';
    #tagsPath = '';

    constructor(data = {}) {
        Object.assign(this, {
            ...data,
            cards: [],
        });
        this.export ??= this.defaultExportConfig;
    }

    /**
     * Loads a project from the file found at the provided file path.
     *
     * @param {string} filePath
     * @returns {CardMagicianProject}
     */
    static async load(filePath) {
        const data = await YAMLSerializer.load(filePath);
        const project = new this(data);
        await project.setFilePath(filePath);
        await project.loadCards();
        await project.loadCardFiles();
        await project.loadTags();
        await project.afterLoad();
        return project;
    }

    /**
     * @returns {object}
     */
    get defaultExportConfig() {
        return { CardImagesExporter: {} };
    }

    /**
     * @returns {string}
     */
    get tagsPath() {
        return this.#tagsPath;
    }

    /**
     * @returns {string}
     */
    get cardsFolderPath() {
        return this.#cardsFolderPath;
    }

    /**
     * @returns {string}
     */
    get folderPath() {
        return this.#folderPath;
    }

    /**
     * @returns {string}
     */
    get filePath() {
        return this.#filePath;
    }

    /**
     * Sets the project's file path and all paths that derive from it. Updates
     * neutralino filesystem mounts so `/project` resolves to the project folder.
     *
     * @param {string} value
     * @returns {Promise<void>}
     */
    async setFilePath(value) {
        this.#filePath = value;
        this.#folderPath = await getParentPath(value);
        this.#cardsFolderPath = await getJoinedPath(this.folderPath, 'cards');
        this.#tagsPath = await getJoinedPath(this.folderPath, 'tags.yml');
        await unmount('/project');
        await mount('/project', this.folderPath);
    }

    /**
     * @abstact
     * @param {string} filePath
     * @returns {Promise<CardMagicianCard>}
     */
    async loadCard(filePath) {
        throw new Error('Not implemented');
    }

    async loadCards() {
        const files = await find(this.cardsFolderPath, { matching: /.yml$/i });
        for (const filePath of files) {
            try {
                const card = await this.loadCard(filePath);
                this.cards.push(card);
            } catch {
                log('state').error(`Failed to load card file ${filePath}`);
            }
        }
    }

    async getFilesByName() {
        const filePaths = await find(this.cardsFolderPath);
        const filesByName = new Map();
        for (const filePath of filePaths) {
            const { filename } = await getPathParts(filePath);
            filesByName.set(filename.toLowerCase(), filePath);
        }
        return filesByName;
    }

    async loadCardFiles() {
        const filesByName = await this.getFilesByName();
        for (const card of this.cards)
            await card.loadFiles(filesByName);
    }

    async loadTags() {
        const fileExists = await checkFileExists(this.tagsPath);
        const projectTags = fileExists
            ? await YAMLSerializer.load(this.tagsPath)
            : [];
        loadTags(projectTags);
    }

    async saveCards() {
        for (const card of this.cards) {
            progress.setOperation(`Saving card ${card.baseName}`);
            await card.saveImages(this.cardsFolderPath, true);
            await card.save(this.cardsFolderPath);
            progress.increment();
        }
    }

    async saveTags() {
        const projectTags = getTags();
        if (!projectTags.length) return;
        await YAMLSerializer.save(this.tagsPath, projectTags);
    }

    async save() {
        const data = Object.assign({}, this);
        delete data.cards;
        await YAMLSerializer.save(this.filePath, data);
    }

    async saveAll(filePath) {
        progress.setStatus('Preparing cards');
        updateBaseNames(this.cards);
        progress.setStatus('Saving cards');
        progress.setMax(this.cards.length + 2);
        await this.saveCards();
        progress.setStatus('Saving tags');
        await this.saveTags();
        progress.setStatus('Saving project file');
        await this.save();
        progress.increment();
        progress.setStatus('Remounting project');
        await this.setFilePath(filePath);
    }

    async afterLoad() {}
}

window.CardMagicianProject = CardMagicianProject;
