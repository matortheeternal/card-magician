const L = localize('game-magic');

const matchTypeOptions = [
    { id: 'cardProp', name: L`Card Property` },
    { id: 'isPermanent', name: L`Is a Permanent` },
    { id: 'numberIsX', name: L`Number is X`},
    { id: 'isPlural', name: L`Is Plural`},
    { id: 'targetsOther', name: L`Targets Other`},
    { id: 'costHasX', name: L`Cost has X`},
    { id: 'hasPt', name: L`Has PT`},
    { id: 'hasTarget', name: L`Has a Target`},
    { id: 'hasPPCounters', name: L`Has Modular`}
];

const cardPropOptions = [
    { id: 'superType', name: L`Card Type` },
    { id: 'subType', name: L`Sub Type` },
    { id: 'name', name: L`Name` },
    { id: 'text', name: L`Rules Text` },
    { id: 'color', name: L`Color` },
    { id: 'manaCost', name: L`Mana Cost` }
];

class Matcher extends ReactiveComponent {
    static tagName = 'cm-matcher';
    #model = {};

    get model() {
        return this.#model;
    }

    set model(data) {
        this.#model = data;
    }

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
    }

    render() {
        this.innerHTML = `<form-group class="with-border"><label class="x-label">Match ${this.dataset.index} <sl-icon name="x-lg" data-click-action="removeMatch"></sl-icon></label><form-field field-id="type"></form-field>
            <div class="params"></div></form-group>`;

        this.renderMatcher();
        this.querySelector('form-field[field-id="type"]')
            .addEventListener('cm-field-changed', this.renderMatcher.bind(this));
    }

    get fields() {
        return [{
            id: 'type',
            label: L`Match Type`,
            type: 'select',
            options: matchTypeOptions
        }];
    }

    asdfadsfdfas() {
        return matchers[this.model.type];
    }

    renderMatcher() {
        // console.log(this, this.selectMatcher, this.selectMatcher());
        const paramMatcher = this.asdfadsfdfas();
        console.log(paramMatcher);
        const params = this.querySelector('.params');
        params.innerHTML = '';
        if (!paramMatcher) return;

        this.paramMatcherElement = document.createElement(paramMatcher.tagName);
        params.appendChild(this.paramMatcherElement);
        this.model.params = { ...paramMatcher.initialModel, ...this.model.params };
        this.paramMatcherElement.model = this.model.params;
        this.paramMatcherElement.render();
    }
}

class ParamMatcher extends ReactiveComponent {
    static tagName = 'cm-param-matcher';
    #model = {};

    get model() {
        return this.#model;
    }

    set model(data) {
        this.#model = data;
    }

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
    }

    render() {
        this.innerHTML = '';
    }

    get fields() {
        return [];
    }

    getSelector(field, model) {
        return `form-field[field-id="${field.id}"]` + (field.subcardId
            ? `[subcard-id="${field.subcardId}"]`
            : ':not([subcard-id])');
    }
}

class CardPropMatcher extends ParamMatcher {
    static tagName = 'cm-card-prop-matcher';
    static initialModel = {prop: 'superType', match: ''};

    render() {
        this.innerHTML = `<form-field field-id="prop"></form-field>
            <form-field field-id="match"></form-field>`;
    }

    get fields() {
        return [{
            id: 'prop',
            label: L`Property`,
            type: 'select',
            options: cardPropOptions,
        }, {
            id: 'match',
            label: L`Match`
        }];
    }
}

class NumberIsXMatcher extends ParamMatcher {
    static tagName = 'cm-number-is-x-matcher';
    static initialModel = {param: ''};

    get fields() {
        return [{
            id: 'param',
            label: L`Keyword Parameter`,
            placeholder: 'number'
        }];
    }

    render() {
        this.innerHTML = '<form-field field-id="param"></form-field>';
    }
}
    
class CostHasX extends ParamMatcher {
    static tagName = 'cm-cost-has-x-matcher';
    static initialModel = {param: ''};

    get fields() {
        return [{
            id: 'param',
            label: L`Keyword Param`,
            placeholder: 'cost'
        }];
    }

    render() {
        this.innerHTML = '<form-field field-id="param"></form-field>';
    }
} 

const matchers = {
    cardProp: CardPropMatcher,
    numberIsX: NumberIsXMatcher,
    costHasX: CostHasX,
    baseMatcher: Matcher
};

for (const matcher of Object.values(matchers))
    customElements.define(matcher.tagName, matcher);


export default matchers;