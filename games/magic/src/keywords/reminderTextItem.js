import { defineMatcherComponents } from './matcherComponents.js';

const L = localize('game-magic');

class ReminderTextItem extends ReactiveComponent {
    #model;
    onClickHandlers = {
        addMatch() {
            if (!this.model.match) 
                this.model.match = {type: '', params: {}};
            else if (Array.isArray(this.model.match)) 
                this.model.match.push({type: '', params: {}});
            else
                this.model.match = [this.model.match, {type: '', params: {}}];
            
            this.render();
        },
        removeMatch(event) {
            if (Array.isArray(this.model.match)) {
                const matcher = event.target.closest('cm-matcher');
                const matchIndex = this.model.match.indexOf(matcher.model);
                this.model.match.splice(matchIndex, 1);

                this.model.match = this.model.match.length === 1 
                    ? this.model.match[0] 
                    : this.model.match;
            } else
                delete this.model.match;

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
        this.setAttribute('data-form-provider', '');
    }

    render() {
        const numMatches = Array.isArray(this.model.match) ? this.model.match.length : 1;
        const matchHtml = this.model.match 
            ? '<cm-matcher></cm-matcher>'.repeat(numMatches) 
            : '';

        this.innerHTML
            = `<form-group group-id="rt-${this.dataset.index}" class="with-border">
                <label class="rt-label">
                    Reminder Text ${parseInt(this.dataset.index) + 1} 
                    <sl-icon name="x-lg" data-click-action="removeRt"></sl-icon>
                </label>
                ${matchHtml}
                <sl-button class="add-match" size="small" variant="success" 
                    outline data-click-action="addMatch">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    Add Match
                    </sl-button>
                <form-field field-id="template"></form-field>
            </form-group>`;


        this.querySelectorAll('cm-matcher').forEach((matcher, i) => {
            matcher.model = Array.isArray(this.model.match) 
                ? this.model.match[i] 
                : this.model.match;

            matcher.dataset.index =  i;
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

export function defineRtComponents() {
    customElements.define('cm-reminder-text-item', ReminderTextItem);
    defineMatcherComponents();
}