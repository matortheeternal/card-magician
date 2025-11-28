import { emit } from '../../utils.js';

function getBaseHTML(label, options, values) {
    return (
        `<div class="label">${label}</div>
        <div class="checkbox-list">
            ${options.map(opt => `
                <sl-checkbox
                    data-id="${opt.id}"
                    size="small"
                    ?checked="${values[opt.id] ? 'true' : ''}"
                    ?disabled="${opt.disabled ? 'true' : ''}">
                    ${opt.label}
                </sl-checkbox>
            `).join('')}
        </div>`
    );
}

export default class CheckboxList extends HTMLElement {
    constructor() {
        super();
        this._options = [];
        this._value = {};
        this.onChange = this.onChange.bind(this);
    }

    set options(val) {
        this._options = Array.isArray(val) ? val : [];
        this.render();
    }

    get options() {
        return this._options;
    }

    set value(val) {
        this._value = val || {};
        this.render();
    }

    get value() {
        return this._value;
    }

    connectedCallback() {
        this.render();
        this.addEventListener('sl-change', this.onChange);
    }

    disconnectedCallback() {
        this.removeEventListener('sl-change', this.onChange);
    }

    render() {
        const label = this.getAttribute('label') || '';
        this.innerHTML = getBaseHTML(label, this._options, this._value);
    }

    onChange(e) {
        const optionId = e.target.dataset?.id;
        if (!optionId) return;
        this._value = { ...this._value, [optionId]: e.target.checked };
        emit(this, 'change');
    }
}

customElements.define('cm-checkbox-list', CheckboxList);
