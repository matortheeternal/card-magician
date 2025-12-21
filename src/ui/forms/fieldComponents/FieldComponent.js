import { emit } from '../../../shared/htmlUtils.js';

export default class FieldComponent extends HTMLElement {
    #field = null;
    #model = '';
    #state = Alpine.reactive({ ready: false });
    eventKey = 'sl-input';


    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    connectedCallback() {
        this.addEventListener(this.eventKey, this.onChange);
        this.cleanupEffects = [
            Alpine.effect(() => { if (this.ready) this.render() }),
            Alpine.effect(() => { if (this.ready) this.loadValue() })
        ];
    }

    disconnectedCallback() {
        this.removeEventListener(this.eventKey, this.onChange);
        this.cleanupEffects.forEach(cleanup => cleanup());
    }

    get ready() {
        return this.#state.ready;
    }

    get field() {
        return this.#field;
    }

    set field(newValue) {
        this.#field = newValue;
        this.#state.ready = Boolean(this.#field && this.#model);
    }

    set model(newValue) {
        this.#model = newValue;
        this.#state.ready = Boolean(this.#field && this.#model);
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

    set value(newValue) {
        this.#model[this.#field.id] = newValue;
    }

    render() {
        this.innerHTML = '<div>Not implemented</div>';
    }

    loadValue() {}

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
