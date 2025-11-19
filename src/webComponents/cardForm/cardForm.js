import Alpine from 'alpinejs';
import { esc, renderField } from './cardFormField.js';

function renderEntry(entry, face) {
    return entry.isGroup ? (
        `<div class="field-group">
            ${entry.fields.map(f => renderField(f, face)).join("")}
        </div>`
    ) : renderField(entry, face);
}

function noBackFace() {
    return (
        `<div class="no-content-prompt">
            <span>This card does not have a back face.</span>
            <div class="buttons-container">
                <sl-button size="large">Add Back Face</sl-button>
            </div>
        </div>`
    );
}

function faceFieldsForm(face) {
    return face ? (
        face.form.map(entry => renderEntry(entry, face)).join('')
    ) : noBackFace();
}

const renderFaceSection = (faceId, face) => (
    `<div class="form" data-face-id="${faceId}">
        <section>${faceFieldsForm(face)}</section>
    </div>`
);

function faceStyleForm(style) {
    return style ? (
        style.form.map(entry => renderEntry(entry, style)).join('')
    ) : noBackFace();
}

const renderStyleOptions = (faceId, style) => (
    `<div class="form" data-face-id="${faceId}">
        <section>${faceStyleForm(style)}</section>
    </div>`
)

function renderCardFormHTML(card) {
    return card && card.model ? (
        `<sl-tab-group>
            <sl-tab slot="nav" panel="frontFields">Front Fields</sl-tab>
            <sl-tab slot="nav" panel="backFields">Back Fields</sl-tab>
            <sl-tab slot="nav" panel="frontStyle">Front Style</sl-tab>
            <sl-tab slot="nav" panel="backStyle">Back Style</sl-tab>
            
            <sl-tab-panel name="frontFields">
                ${renderFaceSection('front', card.model.front)}
            </sl-tab-panel>
            <sl-tab-panel name="backFields">
                ${renderFaceSection('back', card.model.back)}
            </sl-tab-panel>
            <sl-tab-panel name="frontStyle">
                ${renderStyleOptions('front', card.style?.front)}
            </sl-tab-panel>
            <sl-tab-panel name="backStyle">
                ${renderStyleOptions('back', card.style?.back)}
            </sl-tab-panel>
        </sl-tab-group>`
    ) : '';
}

class CardForm extends HTMLElement {
    constructor() {
        super();
        // this allows us to pass onChange to an event listener
        this.onChange = this.onChange.bind(this);
        this.save = Alpine.debounce(this.save, 300);
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        this.faceForms.forEach((faceFormEl) => {
            faceFormEl.removeEventListener('input', this.onChange);
            faceFormEl.removeEventListener('change', this.onChange);
        });
    }

    render() {
        this.innerHTML = renderCardFormHTML(this._card);
        this.hydrate();
        this.bindEvents();
    }

    hydrate() {
        this.faceForms.forEach((faceFormEl) => {
            faceFormEl.querySelectorAll('card-form-select').forEach(el => {
                const fieldId = el.dataset.fieldId;
                const faceId = faceFormEl.dataset.faceId;
                const cardFace = this._card.model[faceId];
                const field = cardFace.fields.find(f => f.id === fieldId);
                el.options = field.options;
            });
        });
    }

    bindEvents() {
        this.faceForms.forEach((faceFormEl) => {
            faceFormEl.addEventListener('input', this.onChange);
            faceFormEl.addEventListener('change', this.onChange);
        });
    }

    get faceForms() { return this.querySelectorAll('div.form'); }

    set card(value) {
        this._card = value;
        this.render();
    }

    get card() { return this._card; }

    async save() {
        const { activeCard, selectedCard } = Alpine.store('views');
        for (const face of Object.values(activeCard.model))
            selectedCard.model[face.id] = await face.save();
    }

    onChange(e) {
        const faceForm = e.currentTarget;
        const faceId = faceForm.dataset.faceId;
        const fieldId = e.target.getAttribute('name');
        if (!faceId || !fieldId) return;
        const face = this._card.model[faceId];
        face[fieldId] = e?.detail?.value || e.target.value || '';
        this.save();
    }
}

customElements.define('cm-card-form', CardForm);
