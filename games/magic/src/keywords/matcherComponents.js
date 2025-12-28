class Matcher extends ComponentWithFields {
    static tagName = 'cm-matcher';
    #model = {};

    get model() {
        return this.#model;
    }

    set model(data) {
        this.#model = data;
    }

    renderMatcher() {
        const matcher = matchers[this.dataset.param];
        if (!matcher) return;

        const matcherElement = document.createElement(matcher.tagName);
        this.appendChild(matcherElement);
        matcherElement.render();
    }

    render() {
        this.innerHtml = '';
    }

    get fields() {
        return [];
    }

    getModel(subcardId) {
        const model = subcardId
            ? this.model[subcardId]
            : this.model;
            
        return model;
    }

    getSelector(model, field) {
        const s = `form-field[field-id="${field.id}"]` + (field.subcardId
            ? `[subcard-id="${field.subcardId}"]`
            : ':not([subcard-id])');

        return s;
    }
}

class CardPropMatcher extends Matcher {
    // this.model = keyword.match.param
    static tagName = 'cm-card-prop-matcher';

    render() {
        this.innerHtml = '<form-field field-id="prop"></form-field><form-field field-id="match"></form-field>';
        this.renderFields(this.model);
        this.hydrateFields();
    }

    get fields() {
        return [{
            id: 'prop',
            name: L`Property`,
            type: 'select',
            options: cardPropOptions,
        }, {
            id: 'match',
            label: L`Match`
        }];
    }
}

class NumberIsXMatcher extends Matcher {
    static tagName = 'cm-number-is-x-matcher';

    get fields() {
        return [{
            id: 'param',
            name: L`Keyword Param`,
            placeholder: 'number'
        }];
    }

    render() {
        this.innerHtml = '<form-field field-id="param"></form-field>';
    }
}

class CostHasX extends Matcher {
    static tagName = 'cm-cost-has-x-matcher';

    get fields() {
        return [{
            id: 'param',
            name: L`Keyword Param`,
            placeholder: 'cost'
        }];
    }

    render() {
        this.innerHtml = '<form-field field-id="param"></form-field>';
    }
} 

const matchers = {
    cardProp: CardPropMatcher,
    numberIsX: NumberIsXMatcher,
    costHasX: CostHasX,
    baseMatcher: Matcher
};

for (const matcher of Object.values(matchers)) {
    customElements.define(matcher.tagName, matcher);
}

export default matchers;