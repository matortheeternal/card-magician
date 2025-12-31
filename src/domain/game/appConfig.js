import { getStoredData, storeData } from '../../shared/neutralinoAdapter.js';

const RECENT_FILE_MAX_COUNT = 10;
const SAVE_DELAY = 200;

export default class AppConfig {
    #data = {};
    #writeQueued = false;
    #loadPromise;

    constructor(game) {
        this.game = game;
        this.#loadPromise = this.load();
    }

    get key() {
        return `appConfig-${this.game.id}`;
    }

    async load() {
        try {
            const raw = await getStoredData(this.key);
            this.#data = JSON.parse(raw) || {};
        } finally {
            this.#data = {};
        }

        if (!Array.isArray(this.#data.recentFiles))
            this.#data.recentFiles = [];
    }

    async set(key, value) {
        await this.#loadPromise;
        this.#data[key] = value;
        this.queueSave();
    }

    get(key, fallback = null) {
        return key in this.#data ? this.#data[key] : fallback;
    }

    get recentFiles() {
        return this.#data.recentFiles.slice();
    }

    async addRecentFile(filePath) {
        await this.#loadPromise;

        this.#data.recentFiles = [
            filePath,
            ...this.#data.recentFiles.filter(f => f !== filePath),
        ].slice(0, RECENT_FILE_MAX_COUNT);

        this.queueSave();
    }

    queueSave() {
        if (this.#writeQueued) return;

        this.#writeQueued = true;
        setTimeout(async () => {
            this.#writeQueued = false;
            await this.save();
        }, SAVE_DELAY);
    }

    async save() {
        const value = JSON.stringify(this.#data);
        await storeData(this.key, value);
    }
}
