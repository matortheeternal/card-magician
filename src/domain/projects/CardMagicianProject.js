import platform from '../../shared/platformAdapter.js';
import { clear as clearFileWatchers, watchTextFile } from '../../shared/fileWatcher.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { find } from '../../shared/fsUtils.js';
import { compareCardOrder, hasSequence, highestSequence } from './cardOrder.js';
import * as progress from '../../ui/systems/progressSystem.js';

const YAML_EXTENSION_PATTERN = /.yml$/i;

const report = createReporter({ unit: 'CardMagicianProject', label: 'Project' });

export default class CardMagicianProject {
    #filePath = '';
    #folderPath = '';
    #cardsFolderPath = '';
    #tagsPath = '';
    #symbolPath = '';
    #exportInfoPath = '';
    #nextSequence = 1;

    constructor(data = {}) {
        Object.assign(this, {
            ...data,
            cards: [],
            exportInfo: {},
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
        await project.loadExportInfo();
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
    get exportInfoPath() {
        return this.#exportInfoPath;
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
        this.#folderPath = await platform.getParentPath(value);
        this.#cardsFolderPath = await platform.getJoinedPath(this.folderPath, 'cards');
        this.#tagsPath = await platform.getJoinedPath(this.folderPath, 'tags.yml');
        this.#symbolPath = await platform.getJoinedPath(this.folderPath, 'symbol.svg');
        this.#exportInfoPath = await platform.getJoinedPath(
            this.folderPath, 'dist', 'exports.json'
        );
        await platform.createDirectory(this.#folderPath);
        await platform.unmount('/project');
        await platform.mount('/project', this.#folderPath);
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
        const files = await find(this.cardsFolderPath, {
            matching: YAML_EXTENSION_PATTERN
        });
        for (const filePath of files) {
            try {
                const card = await this.loadCard(filePath);
                this.cards.push(card);
            } catch (error) {
                report('loadCard', error, [filePath]);
                log('state').error(`Failed to load card file ${filePath}`);
            }
        }
        this.orderLoadedCards();
    }

    orderLoadedCards() {
        this.cards.sort(compareCardOrder);
        this.#nextSequence = highestSequence(this.cards) + 1;
        for (const card of this.cards) this.numberCardIfMissing(card);
    }

    numberCard(card) {
        card.sequence = this.#nextSequence++;
    }

    numberCardIfMissing(card) {
        if (hasSequence(card)) return;
        this.numberCard(card);
    }

    async getFilesByName() {
        const filePaths = await find(this.cardsFolderPath);
        const filesByName = new Map();
        for (const filePath of filePaths) {
            const { filename } = await platform.getPathParts(filePath);
            filesByName.set(filename.toLowerCase(), filePath);
        }
        return filesByName;
    }

    async loadCardFiles() {
        const filesByName = await this.getFilesByName();
        for (const card of this.cards)
            await card.loadFiles(filesByName);
    }

    async loadExportInfo() {
        this.exportInfo = {};
        const exists = await platform.checkFileExists(this.exportInfoPath);
        if (!exists) return;
        const text = await platform.readFile(this.exportInfoPath);
        this.exportInfo = JSON.parse(text);
    }

    getImageExport(card, faceKey = 'front') {
        const cardInfo = this.exportInfo[card.baseName];
        if (!cardInfo) return {};
        return cardInfo.imageExports[faceKey];
    }

    trackExport(card, faceKey, filePath, hash) {
        const cardExportInfo = activeProject.exportInfo[card.baseName] ||= {};
        cardExportInfo.imageExports ||= {};
        cardExportInfo.imageExports[faceKey] = { filePath, hash };
    }

    async loadSymbol() {
        if (await platform.checkFileExists(this.symbolPath))
            this.updateSymbol(await platform.readFile(this.symbolPath));
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

    async saveExportInfo() {
        const text = JSON.stringify(this.exportInfo, null, 2);
        await platform.writeFile(this.exportInfoPath, text);
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
        await platform.writeFile(this.symbolPath, this.symbol);
    }

    async editSetSymbol() {
        if (!this.symbolPath) {
            await dialog.alert('You must save the project first.');
            return;
        }
        await platform.sysopen(this.symbolPath);
    }

    async save() {
        const data = Object.assign({}, this);
        delete data.cards;
        delete data.symbol;
        delete data.exportInfo;
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

    afterCardsChanged() {}
}

window.CardMagicianProject = CardMagicianProject;
