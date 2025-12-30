import { emit } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../../ReactiveComponent.js';

export default class FieldComponent extends ReactiveComponent {
    #state = Alpine.reactive({ ready: false, field: null, model: null });
    eventKey = 'sl-input';

    connectedCallback() {
        this.on(this.eventKey, event => this.onChange(event));
        this.effect(() => { if (this.ready) this.render(); });
        this.effect(() => { if (this.ready) this.loadValue(); });
    }

    get ready() {
        return this.#state.ready;
    }

    get field() {
        return this.#state.field;
    }

    set field(newValue) {
        this.#state.field = newValue;
        this.#state.ready = Boolean(this.#state.field && this.#state.model);
    }

    set model(newValue) {
        this.#state.model = newValue;
        this.#state.ready = Boolean(this.#state.field && this.#state.model);
    }

    get model() {
        return this.#state.model;
    }

    /**
     * @returns {any}
     */
    get value() {
        return this.model[this.field.id];
    }

    set value(newValue) {
        this.model[this.field.id] = newValue;
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
        this.field.onChange?.(this.model, newValue);
        emit(this, 'cm-field-changed');
    }
}
