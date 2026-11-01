import {
    createDirectory, sysopen,
    getJoinedPath, getParentPath, getPathParts,
    mount, readFile, unmount, writeFile
} from '../../shared/platformAdapter.js';
import { clear as clearFileWatchers, watchTextFile } from '../../shared/fileWatcher.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { checkFileExists, find } from '../../shared/fsUtils.js';
import * as progress from '../../ui/systems/progressSystem.js';

const report = createReporter({ unit: 'CardMagicianProject', label: 'Project' });

export default class CardMagicianProject {
    #filePath = '';
    #folderPath = '';
    #cardsFolderPath = '';
    #tagsPath = '';
    #symbolPath = '';

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
        await project.loadSymbol();
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
    get symbolPath() {
        return this.#symbolPath;
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
     * resource mounts so `/project` resolves to the project folder.
     *
     * @param {string} value
     * @returns {Promise<void>}
     */
    async setFilePath(value) {
        if (window.activeProject === this) clearFileWatchers();
        this.#filePath = value;
        this.#folderPath = await getParentPath(value);
        this.#cardsFolderPath = await getJoinedPath(this.folderPath, 'cards');
        this.#tagsPath = await getJoinedPath(this.folderPath, 'tags.yml');
        this.#symbolPath = await getJoinedPath(this.folderPath, 'symbol.svg');
        await createDirectory(this.#folderPath);
        await unmount('/project');
        await mount('/project', this.#folderPath);
        if (window.activeProject === this) await this.watchFiles();
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
            } catch (error) {
                report('loadCard', error, [filePath]);
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

    async loadSymbol() {
        if (await checkFileExists(this.symbolPath))
            this.updateSymbol(await readFile(this.symbolPath));
    }

    updateSymbol(source) {
        if (source === this.symbol) return;
        const document = new DOMParser().parseFromString(source, 'image/svg+xml');
        if (document.querySelector('parsererror')
            || document.documentElement?.localName !== 'svg') return;
        this.symbol = source;
        changed(this, 'symbol');
    }

    async watchFiles({ initial = false } = {}) {
        if (!this.symbolPath) return;
        try {
            await watchTextFile(this.symbolPath, source => this.updateSymbol(source), {
                initial
            });
        } catch (error) {
            report('watchSymbol', error, [this.symbolPath]);
        }
    }

    async saveCards(withImages = true) {
        for (const card of this.cards) {
            await card.save(this.cardsFolderPath);
            if (withImages)
                await card.saveImages(this.cardsFolderPath, true);
            progress.increment();
        }
    }

    async saveSymbol() {
        if (!this.symbol?.length) return;
        await writeFile(this.symbolPath, this.symbol);
    }

    async editSetSymbol() {
        if (!this.symbolPath) {
            await dialog.alert('You must save the project first.');
            return;
        }
        await sysopen(this.symbolPath);
    }

    async save() {
        const data = Object.assign({}, this);
        delete data.cards;
        delete data.symbol;
        await YAMLSerializer.save(this.filePath, data);
    }

    async saveAll(filePath) {
        progress.setStatus('Preparing cards');
        progress.setStatus('Saving cards');
        progress.setMax(this.cards.length + 2);
        await this.saveCards(true);
        progress.setStatus('Saving set symbol');
        await this.saveSymbol();
        progress.setStatus('Saving project file');
        await this.save();
        progress.increment();
        progress.setStatus('Remounting project');
        await this.setFilePath(filePath);
    }

    async afterLoad() {}
}

window.CardMagicianProject = CardMagicianProject;
