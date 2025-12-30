import matchers from './matcherComponents.js'; // To register custom elements

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

    render(index) {
        const matchHtml = this.model.match ? '<cm-matcher></cm-matcher>': '';

        this.innerHTML
            = `<form-group group-id="rt-${index}" class="with-border">
                <label>Reminder Text ${index}</label>
                <form-field field-id="type" subcard-id="match"></form-field>
                ${matchHtml}
                <form-field field-id="template"></form-field>
            </form-group>`;


        this.renderFields(this.model);

        this.querySelectorAll('cm-matcher').forEach((matcher) => {
            matcher.model = this.model.match;
            matcher.render();
        });
    }

    get fields() {
        return [{
            id: 'template',
            label: L`Template`,
            type: 'textarea'
        }];
    }

    getSelector(field, model) {
        const s = `form-field[field-id="${field.id}"]` + (field.subcardId
            ? `[subcard-id="${field.subcardId}"]`
            : ':not([subcard-id])');

        return s;
    }

    fullModel() {
        const matches = [];
        this.querySelectorAll('cm-matcher').forEach((matcher) => {
            matches.push(matcher.fullModel());
        });

        this.model.match = matches.length === 1 ? matches[0] : matches;
        return this.model;
    }
}

customElements.define('cm-reminder-text-item', ReminderTextItem);
