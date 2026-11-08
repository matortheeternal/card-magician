import ReactiveComponent from '../components/ReactiveComponent.js';
import { emit } from '../../shared/htmlUtils.js';

export default class CardMagicianSettings extends ReactiveComponent {
    /**
     * A unique identifier for this settings tab.
     *
     * @abstract
     * @type {string}
     */
    static id;

    /**
     * A localized string for the label for this settings group.
     *
     * @abstract
     * @type {string}
     */
    static label;

    /**
     * Parent to nest the settings tab under in navigation.
     * When null, settings will be top-level.
     *
     * @type {string|null}
     */
    static parentId = null;

    /**
     * Used when sorting, larger values sort first.
     *
     * @type {number}
     */
    static groupWeight = 0;

    /**
     * Returns true if a field or its options match a given query.
     *
     * @param {object} field
     * @param {string} query
     * @returns {boolean}
     */
    static fieldMatches(field, query) {
        const qlc = query.toLowerCase();
        const options = field.options || [];
        return [
            field.label,
            field.description,
            ...options.flatMap(opt => [opt.name, opt.label, opt.description])
        ].some(str => str && str.toLowerCase().includes(qlc));
    }

    /**
     * Returns an array of fields that match a search query.
     *
     * @abstract
     * @param {string} query
     * @returns {Array<object>}
     */
    static search(query) {
        throw new Error('Not implemented.');
    }

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {}

    emit(name, detail) {
        emit(this, name, detail);
    }

    /**
     * Renders the settings.
     *
     * @abstract
     */
    render() {
        this.innerHTML = `<div>NOT IMPLEMENTED.</div>`;
    }
}

window.CardMagicianSettings = CardMagicianSettings;
