import { getJoinedPath } from '../neutralinoAdapter.js';
import YAMLSerializer from '../../domain/projects/serializers/YAMLSerializer.js';
import { checkFileExists } from '../fsUtils.js';

const L = localize('collection-manager');
const DEFAULT_DEBOUNCE_WAIT = 3000;

const report = createReporter({
    unit: 'CollectionManager',
    label: L`Data Persistence`
});

export default class CollectionManager {
    #collection = null;

    constructor(options) {
        this.options = options;
        this.save = this.save.debounce(options.saveDelay || DEFAULT_DEBOUNCE_WAIT);
    }

    get collection() {
        if (!this.#collection)
            throw new Error('Collection has not been loaded yet.');
        return this.#collection;
    }

    set collection(value) {
        this.#collection = value;
    }

    get path() {
        const pathParts = this.options.path();
        return getJoinedPath(...pathParts);
    }

    async load() {
        const filePath = await this.path;
        const exists = await checkFileExists(filePath);
        this.collection = exists
            ? await YAMLSerializer.load(filePath)
            : [];
    }

    async save() {
        const filePath = await this.path;
        await YAMLSerializer.save(filePath, this.collection);
    }

    scheduleSave() {
        this.save().catch(err => report('save', err, [this.collection]));
    }

    find(value) {
        return this.collection.find(item => this.options.compare(item, value));
    }

    create(value) {
        const newItem = this.options.create(value);
        this.collection.push(newItem);
        this.scheduleSave();
        return newItem;
    }

    findOrCreate(value) {
        return this.find(value) || this.create(value);
    }

    removeFirst(value) {
        const index = this.collection.indexOf(
            item => this.options.compare(item, value)
        );
        if (index === -1) return;
        this.collection.splice(index, 1);
        this.scheduleSave();
    }

    removeAll(value) {
        this.collection = this.collection.filter(
            item => !this.options.compare(item, value)
        );
        this.scheduleSave();
    }

    async flush() {
        return await this.save.flush();
    }
}
