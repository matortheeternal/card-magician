const RECENT_FILE_MAX_COUNT = 10;
const SAVE_DELAY = 200;

class AppConfig {
    constructor() {
        this._data = {};
        this._writeQueued = false;
        this._loadPromise = this.load();
    }

    async load() {
        try {
            const raw = await Neutralino.storage.getData('appConfig');
            this._data = JSON.parse(raw) || {};
        } catch (err) {
            this._data = {};
        }

        if (!Array.isArray(this._data.recentFiles)) {
            this._data.recentFiles = [];
        }
    }

    async set(key, value) {
        await this._loadPromise;
        this._data[key] = value;
        this.queueSave();
    }

    get(key, fallback = null) {
        return key in this._data ? this._data[key] : fallback;
    }

    get recentFiles() {
        return this._data.recentFiles.slice();
    }

    async addRecentFile(filePath) {
        await this._loadPromise;

        this._data.recentFiles = [
            filePath,
            ...this._data.recentFiles.filter(f => f !== filePath),
        ].slice(0, RECENT_FILE_MAX_COUNT);

        this.queueSave();
    }

    queueSave() {
        if (this._writeQueued) return;

        this._writeQueued = true;
        setTimeout(async () => {
            this._writeQueued = false;
            await this.save();
        }, SAVE_DELAY);
    }

    async save() {
        await Neutralino.storage.setData('appConfig', JSON.stringify(this._data));
    }
}

export default new AppConfig();
