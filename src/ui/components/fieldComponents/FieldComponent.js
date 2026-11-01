import { emit } from '../../../shared/htmlUtils.js';
import ReactiveComponent from '../ReactiveComponent.js';

export default class FieldComponent extends ReactiveComponent {
    #field = null;
    #model = null;
    eventKey = 'sl-input';

    connectedCallback() {
        this.bind();
    }

    bind() {
        this.on(this.eventKey, event => this.onChange(event));
    }

    get field() {
        return this.#field;
    }

    get model() {
        return this.#model;
    }

    setModelAndField(model, field) {
        this.#model = model;
        this.#field = field;
        this.render();
        this.watch('field', field, '', () => this.render());
        this.watch('value', this.model, this.field.id, () => this.loadValue());
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

    inputValue(value) {}
    loadValue() {}

    async getChangedValue(event) {
        return event.target.value;
    }

    async onChange(event) {
        const newValue = await this.getChangedValue(event);
        if (newValue === this.value) return;
        const oldValue = this.value;
        this.value = newValue;
        this.field.onChange?.(this.model, newValue);
        emit(this, 'cm-field-changed', { fieldId: this.field.id, oldValue, newValue });
    }
}
