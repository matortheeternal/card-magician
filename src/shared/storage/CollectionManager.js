import { getJoinedPath } from '../neutralinoAdapter.js';
import YAMLSerializer from '../../domain/projects/serializers/YAMLSerializer.js';
import { checkFileExists } from '../fsUtils.js';

const L = localize('collection-manager');
const DEFAULT_DEBOUNCE_WAIT = 3000;

const report = createReporter({
    unit: 'CollectionManager',
    label: L`Data Persistence`
});

/**
 * @typedef {object} CollectionOptions
 * @property {function(): string[]} path - Returns YAML file path segments;
 *   evaluated for each load or save.
 * @property {function(any, any): boolean} matches - Tests a stored item against
 *   a lookup value, in that argument order.
 * @property {function(any): any} create - Builds an item from a lookup value.
 * @property {function(number): any} [next] - Generates a candidate lookup value
 *   from a one-based attempt count. Required by getNextValue() and when create()
 *   receives null or undefined. Must eventually produce a value with no match.
 * @property {number} [saveDelay=3000] - Debounce delay in milliseconds.
 *   Falsy values use the default delay.
 */

/**
 * Manages an in-memory array backed by a YAML file with debounced writes.
 * ImageFieldValue images are embedded in the YAML as data URLs.
 * Call load() before using the collection. Direct array or item edits require
 * scheduleSave(). Call flush() to finish pending writes.
 */
export default class CollectionManager {
    #collection = null;

    /**
     * @param {CollectionOptions} options - Persistence and item callbacks.
     */
    constructor(options) {
        this.options = options;
        this.save = this.save.debounce(options.saveDelay || DEFAULT_DEBOUNCE_WAIT);
    }

    /**
     * The mutable array of loaded items.
     *
     * @type {any[]}
     * @throws {Error} If the collection has not been loaded or assigned.
     */
    get collection() {
        if (!this.#collection)
            throw new Error('Collection has not been loaded yet.');
        return this.#collection;
    }

    /**
     * Replaces the in-memory collection without scheduling a save.
     *
     * @param {any[]} value - Items to manage.
     */
    set collection(value) {
        this.#collection = value;
    }

    /**
     * Resolves the current file path from the configured path segments.
     *
     * @type {Promise<string>}
     */
    get path() {
        const pathParts = this.options.path();
        return getJoinedPath(...pathParts);
    }

    /**
     * Replaces the collection with the YAML file contents, or an empty array
     * when the file does not exist. Discards unsaved in-memory changes.
     *
     * @returns {Promise<void>}
     */
    async load() {
        const filePath = await this.path;
        const exists = await checkFileExists(filePath);
        this.collection = exists
            ? await YAMLSerializer.load(filePath)
            : [];
    }

    /**
     * Writes the collection to its current path. The constructor debounces
     * this method so calls schedule a write and repeated calls reset the delay.
     *
     * @returns {Promise<void>} Resolves when the write completes.
     */
    async save() {
        const filePath = await this.path;
        await YAMLSerializer.save(filePath, this.collection, { embedImages: true });
    }

    /**
     * Schedules a debounced save and reports write failures.
     *
     * @returns {void}
     */
    scheduleSave() {
        this.save().catch(err => report('save', err, [this.collection]));
    }

    /**
     * Finds the first item accepted by the matches callback.
     *
     * @param {any} value - Lookup value passed to matches.
     * @returns {any|undefined} The matching item, if found.
     */
    find(value) {
        return this.collection.find(item => this.options.matches(item, value));
    }

    /**
     * Generates candidates with next(1), next(2), and so on until find() returns
     * a falsy result. Requires a loaded collection and the next callback.
     * Does not create an item or reserve the returned value.
     *
     * @returns {any} The first candidate without a truthy matching item.
     */
    getNextValue() {
        let tryCount = 1;
        let value = this.options.next(tryCount);
        while (this.find(value))
            value = this.options.next(++tryCount);
        return value;
    }

    /**
     * Builds and appends an item using the create callback, then schedules a save.
     *
     * @param {any} [value] - Input passed to the create callback. Null or undefined
     *   uses getNextValue() to generate an unused value.
     * @returns {any} The newly appended item.
     */
    create(value) {
        value ??= this.getNextValue();
        const newItem = this.options.create(value);
        this.collection.push(newItem);
        this.scheduleSave();
        return newItem;
    }

    /**
     * Returns the first matching item, or creates one if the match is falsy.
     *
     * @param {any} value - Lookup and creation input.
     * @returns {any} The existing or newly created item.
     */
    findOrCreate(value) {
        return this.find(value) || this.create(value);
    }

    /**
     * Removes the item if present and schedules a save if an item was removed.
     *
     * @param {any} item - Item to remove from the collection.
     * @returns {void}
     */
    remove(item) {
        const index = this.collection.indexOf(item);
        if (index === -1) return;
        this.collection.splice(index, 1);
        this.scheduleSave();
    }

    /**
     * Removes every matching item and schedules a save.
     *
     * @param {any} value - Lookup value passed to matches.
     * @returns {void}
     */
    removeAll(value) {
        this.collection = this.collection.filter(
            item => !this.options.matches(item, value)
        );
        this.scheduleSave();
    }

    /**
     * Immediately starts any scheduled save and waits for pending writes.
     * Does not schedule a write when none is pending.
     *
     * @returns {Promise<void>}
     */
    async flush() {
        return await this.save.flush();
    }
}
