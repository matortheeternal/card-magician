import { emit } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../../components/ReactiveComponent.js';

export default class FieldComponent extends ReactiveComponent {
    #field = null;
    #model = null;
    #fieldWatch = null;
    #valueWatch = null;
    eventKey = 'sl-input';

    connectedCallback() {
        this.on(this.eventKey, event => this.onChange(event));
    }

    watchValue() {
        if (!this.model || !this.field) return;
        if (this.#valueWatch) this.#valueWatch.remove();
        this.#valueWatch = this.watch(this.model, this.field.id,
                                      () => this.loadValue()
        );
    }

    get field() {
        return this.#field;
    }

    set field(newValue) {
        this.#field = newValue;
        this.render();
        if (this.#fieldWatch) this.#fieldWatch.remove();
        this.#fieldWatch = this.watch(newValue, '', () => this.render());
        this.watchValue();
    }

    get model() {
        return this.#model;
    }

    set model(newValue) {
        this.#model = newValue;
        this.render();
        this.watchValue();
    }

    /**
     * @returns {any}
     */
    get value() {
        if (!this.model || !this.field) return null;
        return this.model[this.field.id];
    }

    set value(newValue) {
        if (!this.model || !this.field) return;
        this.model[this.field.id] = newValue;
        changed(this.model, this.field.id);
    }

    render() {
        if (!this.model || !this.field) return;
        this.innerHTML = '<div>Not implemented</div>';
        this.loadValue();
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
