import { emit } from '../../utils.js';

export default class FieldElement extends HTMLElement {
    #field = null;
    #model = '';
    eventKey = 'sl-input';

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    connectedCallback() {
        this.render();
        this.addEventListener(this.eventKey, this.onChange);
        this.cleanupEffects = [
            Alpine.effect(this.render)
        ];
    }

    disconnectedCallback() {
        this.removeEventListener(this.eventKey, this.onChange);
        this.cleanupEffects.forEach(cleanup => cleanup());
    }

    get field() {
        return this.#field;
    }

    set field(value) {
        this.#field = value;
    }

    set model(value) {
        this.#model = value;
        this.render();
        this.loadValue?.();
    }

    get model() {
        return this.#model;
    }

    /**
     * @returns {any}
     */
    get value() {
        return this.#model[this.#field.id];
    }

    set value(value) {
        this.#model[this.#field.id] = value;
        this.loadValue?.();
    }

    render() {
        this.innerHTML = '<div>Not implemented</div>';
    }

    async getChangedValue(event) {
        return event.target.value;
    }

    async onChange(event) {
        const newValue = await this.getChangedValue(event);
        if (newValue === this.value) return;
        this.value = newValue;
        this.field.onChange?.(this.#model, newValue);
        emit(this, 'cm-field-changed');
    }
}
