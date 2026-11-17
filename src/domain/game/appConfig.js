import { beforeExit } from '../../lifecycle.js';
import platform from '../../shared/platformAdapter.js';

const RECENT_PROJECT_MAX_COUNT = 10;
const SAVE_DELAY = 200;

function storageKey(gameId) {
    return `appConfig-${gameId}`;
}

async function readStoredConfig(gameId) {
    try {
        const raw = await platform.getStoredData(storageKey(gameId));
        return JSON.parse(raw) || {};
    } catch (error) {
        log('startup').info(`Could not load ${storageKey(gameId)}`, error);
        return {};
    }
}

async function findExistingProjects(projects) {
    const existing = [];
    for (const project of Array.isArray(projects) ? projects : []) {
        if (await platform.checkFileExists(project.filePath))
            existing.push(project);
    }
    return existing;
}

export async function readRecentProjects(gameId) {
    const { recentProjects } = await readStoredConfig(gameId);
    return findExistingProjects(recentProjects);
}

export default class AppConfig {
    #data = {};
    #writeQueued = false;
    #timer = null;
    #write = Promise.resolve();
    #activeWrites = 0;
    #recentProjectsChangedCallbacks = [];
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
        return storageKey(this.gameId);
    }

    async load() {
        this.#data = await readStoredConfig(this.gameId);
        this.#data.recentProjects = await findExistingProjects(this.#data.recentProjects);
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

    get recentProjects() {
        return this.#data?.recentProjects?.slice() || [];
    }

    async addRecentProject() {
        await this.#loadPromise;

        const filePath = activeProject.filePath;
        const title = activeProject.title;
        this.#data.recentProjects = [
            { filePath, title, openedAt: Date.now() },
            ...this.#data.recentProjects.filter(
                proj => proj.filePath !== filePath
            ),
        ].slice(0, RECENT_PROJECT_MAX_COUNT);

        for (const callback of this.#recentProjectsChangedCallbacks)
            callback(this.#data.recentProjects);

        this.queueSave();
    }

    onRecentProjectsChanged(callback) {
        this.#recentProjectsChangedCallbacks.push(callback);
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
            await platform.storeData(this.key, JSON.stringify(this.#data));
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
