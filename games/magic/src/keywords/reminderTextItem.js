const L = localize('game-magic');

export default class ReminderTextItem extends ComponentWithFields {
    #model;

    get model() {
        return this.#model;
    }

    set model(newValue) {
        this.#model = newValue;
    }

    getModel(subcardId) {
        const model = subcardId
            ? this.model[subcardId]
            : this.model;
        return model;
    }

    render() {
        this.innerHTML = `<div class="rt-label">Reminder text N</div>
            <form-field field-id="type" subcard-id="match"></form-field>
            <form-field field-id="template"></form-field>`;
        this.renderFields(this.model);
        this.hydrateFields();
    }

    get fields() {
        return [{
            id: 'template',
            label: L`Template`
        }, {
            id: 'type',
            label: L`Match Type`
        }];
    }
}

customElements.define('cm-reminder-text-item', ReminderTextItem);