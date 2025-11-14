import Alpine from 'alpinejs';
import { esc, renderField } from './cardFormField.js';
import { emit } from '../../utils.js';

function renderCardFormHTML(card) {
    return card && card.model ? (
        `<div class="forms-container">
            ${renderTemplateSelector(card)}
            ${Object.entries(card.model).map(([faceId, face]) =>
                renderFaceSection(faceId, face)
            ).join('')}
        </div>`
    ) : '';
}

function renderTemplateOption(template) {
    return (
        `<sl-option value="${esc(template.id)}">
            ${esc(template.label)}
        </sl-option>`
    );
}

function renderTemplateSelector(card) {
    const templates = Alpine.store('templates');
    return card.template && templates ? (
        `<div class="form">
            <sl-select size="small" name="template" label="Template" value="${card.template}">
                ${templates.map(t => renderTemplateOption(t, card)).join('')}
            </sl-select>
        </div>`
    ) : '';
}

const renderFaceSection = (faceId, face) => (
    `<div class="form" data-face-id="${faceId}">
        <h2>${esc(faceId)}</h2>
        <section>
            ${face.form.map(entry => renderEntry(entry, face)).join('')}
        </section>
    </div>`
);

function renderEntry(entry, face) {
    return entry.isGroup ? (
        `<div class="field-group">
                ${entry.fields.map(f => renderField(f, face)).join("")}
        </div>`
    ) : renderField(entry, face);
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
        this.addEventListener('sl-change', e => {
            if (e.target.getAttribute('name') !== 'template') return;
            emit(this, 'change-template', { templateId: e.target.value });
        });
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

customElements.define('card-form', CardForm);
