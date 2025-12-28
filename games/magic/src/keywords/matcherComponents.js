class Matcher extends ComponentWithFields {
    #model = {};

    get model() {
        return this.#model;
    }

    set model(data) {
        this.#model = data;
    }

    render() {
        this.innerHtml = '';
    }

    get fields() {
        return [];
    }

    getModel() {
        return this.model;
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

    getModel() {
        return this.model.params;
    }

    get fields() {
        return [{
            id: 'prop',
            name: L`Property`,
            type: 'select',
            options: cardPropOptions
        }, {
            id: 'match',
            label: L`Match`
        }];
    }
}

class NumberIsXMatcher extends Matcher {

}

export const matchers = {
    cardProp: CardPropMatcher
};

customElements.define('cm-matcher', Matcher);

for (const matcher of matchers) {
    customElements.define(matcher.tagName, matcher);
}