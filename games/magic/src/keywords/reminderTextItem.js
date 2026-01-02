import matchers from './matcherComponents.js'; // To register custom elements

const L = localize('game-magic');

export default class ReminderTextItem extends ComponentWithFields {
    #model;
    onClickHandlers = {
        addMatch() {
            console.log('add', this.model.match);
            if (!this.model.match) 
                this.model.match = {type: '', params: {}};
            else if (Array.isArray(this.model.match)) 
                this.model.match.push({type: '', params: {}});
            else
                this.model.match = [this.model.match, {type: '', params: {}}];
            
            console.log('add2', this.model.match);
            this.render();
        },
        removeMatch(event) {
            console.log(this.model.match, event.target.model, this.model.match.indexOf(event.target.parentElement.parentElement.parentElement.model));
            if (Array.isArray(this.model.match)) {
                this.model.match.splice(this.model.match.indexOf(event.target.parentElement.parentElement.parentElement.model), 1);
                this.model.match = this.model.match.length === 1 ? this.model.match[0] : this.model.match;
            }
            else
                delete this.model.match

            this.render();
        }
    };

    get model() {
        return this.#model;
    }

    set model(newValue) {
        this.#model = newValue;
    }

    connectedCallback() {
        this.handleEvents('click', this.onClickHandlers);
    }

    getModel(subcardId) {
        const model = subcardId
            ? this.model[subcardId]
            : this.model;

        return model;
    }

    render() {
        const numMatches = Array.isArray(this.model.match) ? this.model.match.length : 1;
        const matchHtml = this.model.match 
            ? '<cm-matcher></cm-matcher>'.repeat(numMatches) 
            : '';

        this.innerHTML
            = `<form-group group-id="rt-${this.dataset.index}" class="with-border">
                <label class="x-label">Reminder Text ${this.dataset.index} <sl-icon name="x-lg" data-click-action="removeRt"></sl-icon></label>
                <form-field field-id="type" subcard-id="match"></form-field>
                ${matchHtml}
                <sl-button class="add-match" size="small" variant="success" outline data-click-action="addMatch"><sl-icon slot="prefix" name="plus-lg"></sl-icon>Add Match</sl-button>
                <form-field field-id="template"></form-field>
            </form-group>`;


        this.renderFields(this.model);

        this.querySelectorAll('cm-matcher').forEach((matcher, i) => {
            matcher.model = Array.isArray(this.model.match) ? this.model.match[i] : this.model.match;
            matcher.dataset.index =  i + 1;
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
}

customElements.define('cm-reminder-text-item', ReminderTextItem);
