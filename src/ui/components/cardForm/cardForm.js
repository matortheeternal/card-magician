import html from './cardForm.html.js';
import {
    onActiveCardChanged,
    saveActiveCard
} from '../../../domain/projects/projectManager.js';
import { pushState, registerState } from '../../systems/navigationSystem.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';
import { executeAction } from '../../systems/actionSystem.js';

const L = localize('card-form');

class CardForm extends ReactiveComponent {
    #card;

    constructor() {
        super();
        this.save = this.save.debounce(300);
    }

    connectedCallback() {
        this.render();
        this.addEventListener('cm-field-changed', this.save);
        onActiveCardChanged(card => {
            this.card = card;
            pushState('card-form');
        });
        this.bind();
    }

    renderFaceToggleLabels() {
        this.toggleFrontButton.textContent = Object.hasOwn(this.card, 'front')
            ? L`Front`
            : L`Add front face`;
        this.toggleBackButton.textContent = Object.hasOwn(this.card, 'back')
            ? L`Back`
            : L`Add back face`;
    }

    render() {
        this.innerHTML = this.card ? html : '';
        if (this.card) this.renderFaceToggleLabels();
        this.faceForms.forEach(faceForm => {
            const faceId = faceForm.dataset.faceId;
            faceForm.face = this.card[faceId];
        });
    }

    bind() {
        this.handleEvents('click', {
            toggleFront: () => this.toggleFace('front'),
            toggleBack: () => this.toggleFace('back'),
            removeBack: () => this.removeBackFace(),
            showPreview: () => pushState('preview-card'),
        });
        registerState('card-form', {
            onEnter: () => this.classList.add('open'),
            onExit: () => this.classList.remove('open'),
        });
    }

    get faceForms() {
        return this.querySelectorAll('cm-face-form, cm-options-form');
    }

    get toggleFrontButton() {
        return this.querySelector('.toggle-face-front');
    }

    get toggleBackButton() {
        return this.querySelector('.toggle-face-back');
    }

    set card(value) {
        this.#card = value;
        this.render();
    }

    get card() {
        return this.#card;
    }

    get hasBackFace() {
        return Object.prototype.hasOwnProperty.call(this.card, 'back');
    }

    addBackFace() {
        executeAction('add-face', 'back');
    }

    removeBackFace() {
        executeAction('remove-face', 'back');
    }

    toggleFace(faceId) {
        if (faceId === 'back' && !this.hasBackFace) {
            this.addBackFace();
            return;
        }
        const frontSection = this.querySelector(`div.face-front`);
        const backSection = this.querySelector(`div.face-back`);
        toggleDisplay(faceId === 'front', frontSection, backSection);
        this.toggleFrontButton.variant = faceId === 'front' ? 'primary' : 'default';
        this.toggleBackButton.variant = faceId === 'front' ? 'default' : 'primary';
    }

    async save() {
        await saveActiveCard();
    }
}

customElements.define('cm-card-form', CardForm);
