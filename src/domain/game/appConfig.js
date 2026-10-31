import { beforeExit } from '../../lifecycle.js';
import { getStoredData, storeData } from '../../shared/neutralinoAdapter.js';

const RECENT_FILE_MAX_COUNT = 10;
const SAVE_DELAY = 200;

export default class AppConfig {
    #data = {};
    #writeQueued = false;
    #timer = null;
    #write = Promise.resolve();
    #activeWrites = 0;
    #recentFilesChangedCallbacks = [];
    #loadPromise;

    constructor(gameId) {
        this.gameId = gameId;
        this.#loadPromise = this.load();
        beforeExit(async () => {
            await this.#loadPromise;
            await this.flush();
        }, () => this.#writeQueued || this.#activeWrites > 0);
    }

    get key() {
        return `appConfig-${this.gameId}`;
    }

    async load() {
        try {
            const raw = await getStoredData(this.key);
            this.#data = JSON.parse(raw) || {};
        } catch(e) {
            log('startup').info(`Could not load ${this.key}`, e);
            this.#data = {};
        }

        if (!Array.isArray(this.#data.recentFiles))
            this.#data.recentFiles = [];
        this.queueSave();
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
        return this.#data?.recentFiles?.slice() || [];
    }

    async addRecentFile(filePath) {
        await this.#loadPromise;

        this.#data.recentFiles = [
            filePath,
            ...this.#data.recentFiles.filter(f => f !== filePath),
        ].slice(0, RECENT_FILE_MAX_COUNT);

        for (const callback of this.#recentFilesChangedCallbacks)
            callback(this.#data.recentFiles);

        this.queueSave();
    }

    onRecentFilesChanged(callback) {
        this.#recentFilesChangedCallbacks.push(callback);
    }

    queueSave() {
        if (this.#writeQueued) return;

        this.#writeQueued = true;
        this.#timer = setTimeout(() => {
            void this.save().catch(error => {
                createReporter({ unit: 'AppConfig' })('save', error);
            });
        }, SAVE_DELAY);
    }

    save() {
        clearTimeout(this.#timer);
        this.#timer = null;
        this.#writeQueued = false;
        this.#activeWrites++;
        this.#write = this.#write.catch(() => undefined).then(async () => {
            await storeData(this.key, JSON.stringify(this.#data));
        }).catch(error => {
            this.#writeQueued = true;
            throw error;
        }).finally(() => { this.#activeWrites--; });
        return this.#write;
    }

    async flush() {
        clearTimeout(this.#timer);
        this.#timer = null;
        if (this.#writeQueued) await this.save();
        await this.#write;
        while (this.#writeQueued) await this.save();
    }
}
