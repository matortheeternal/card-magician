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
    }

    get model() {
        return this.#model;
    }

    get value() {
        return this.#model[this.#field.id];
    }

    set value(value) {
        this.#model[this.#field.id] = value;
    }

    render() {
        this.innerHTML = '<div>Not implemented</div>';
    }

    getChangedValue(event) {
        return event.target.value;
    }

    onChange(event) {
        const newValue = this.getChangedValue(event);
        if (newValue === this.value) return;
        this.value = newValue;
        emit(this, 'cm-field-changed');
    }
}
