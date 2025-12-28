import matchers from "./matcherComponents.js"; // To register custom elements

const L = localize('game-magic');

const matchTypeOptions = [
    { id: 'cardProp', name: L`Card Property` },
    { id: 'numberIsX', name: L`Number is X`},
    { id: 'isPlural', name: L`Is Plural`},
    { id: 'targetsOther', name: L`Targets Other`},
    { id: 'costHasX', name: L`Cost has X`},
    { id: 'hasPt', name: L`Has PT`},
    { id: 'hasTarget', name: L`Has a Target`},
    { id: 'hasPPCounters', name: L`Has Modular`}
];

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
        console.log('model', model, this.model, subcardId);
        return model;
    }

    render(index) {
        let paramHtml = '';
        for (const paramName of Object.keys(this.model.match?.params || {})) {
            paramHtml += `<cm-matcher data-param="${paramName}"></cm-matcher>`;
        }

        this.innerHTML = 
            `<form-group group-id="rt-${index}" class="with-border">
                <label>Reminder Text ${index}</label>
                <form-field field-id="type" subcard-id="match"></form-field>
                <div class="match-params">${paramHtml}</div>
                <form-field field-id="template" class="large-input"></form-field>
            </form-group>`;
        
        console.log('RENDERING', this.getModel());
        this.renderFields(this.getModel());
        this.hydrateFields();

        const matchers = this.querySelectorAll('cm-matcher');
        matchers.forEach((matcher) => {
            matcher.model = this.data.model.match;
            matcher.renderMatcher();
        });
    }

    get fields() {
        return [{
            id: 'template',
            label: L`Template`,
            type: 'textarea'
        }, {
            id: 'type',
            label: L`Match Type`,
            subcardId: 'match',
            type: 'select',
            options: matchTypeOptions
        }];
    }

    getSelector(model, field) {
        const s = `form-field[field-id="${field.id}"]` + (field.subcardId
            ? `[subcard-id="${field.subcardId}"]`
            : ':not([subcard-id])');

        console.log(model, field, s);
        return s;
    }
}

customElements.define('cm-reminder-text-item', ReminderTextItem);