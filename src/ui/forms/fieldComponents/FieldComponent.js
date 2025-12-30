import { emit } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../../ReactiveComponent.js';

export default class FieldComponent extends ReactiveComponent {
    #field = null;
    #model = '';
    #state = Alpine.reactive({ ready: false });
    eventKey = 'sl-input';

    connectedCallback() {
        this.on(this.eventKey, event => this.onChange(event));
        this.effect(() => { if (this.ready) this.render(); });
        this.effect(() => { if (this.ready) this.loadValue?.(); });
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
