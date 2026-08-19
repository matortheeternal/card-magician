import html from './cardForm.html.js';
import {
    onActiveCardChanged,
    saveCard
} from '../../../domain/projects/projectManager.js';
import { pushState, registerState } from '../../systems/navigationSystem.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';
import { executeAction } from '../../systems/actionSystem.js';

const L = localize('card-form');
const SMOKE_TESTING = NL_ARGS.includes('--run-smoke-tests');
const DEBOUNCE_TIME = SMOKE_TESTING ? 30 : 500;

class CardForm extends ReactiveComponent {
    #editorCard;

    constructor() {
        super();
        this.save = this.save.debounce(DEBOUNCE_TIME);
    }

    connectedCallback() {
        this.render();
        this.addEventListener('cm-field-changed', () => {
            this.save();
        });

        onActiveCardChanged(async editorCard => {
            await this.save.flush();
            this.editorCard = editorCard;
            this.projectCard = window.selectedProjectCard;
            pushState('card-form');
        });

        this.bind();
    }

    renderFaceToggleLabels() {
        this.toggleFrontButton.textContent = Object.hasOwn(this.editorCard, 'front')
            ? L`Front`
            : L`Add front face`;
        this.toggleBackButton.textContent = Object.hasOwn(this.editorCard, 'back')
            ? L`Back`
            : L`Add back face`;
    }

    render() {
        this.innerHTML = this.editorCard ? html : '';
        if (this.editorCard) this.renderFaceToggleLabels();
        this.faceForms.forEach(faceForm => {
            const faceId = faceForm.dataset.faceId;
            faceForm.face = this.editorCard[faceId];
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

    set editorCard(value) {
        this.#editorCard = value;
        this.render();
    }

    get editorCard() {
        return this.#editorCard;
    }

    get hasBackFace() {
        return Object.prototype.hasOwnProperty.call(this.editorCard, 'back');
    }

    async addBackFace() {
        await this.save.flush();
        await executeAction('add-face', 'back');
    }

    async removeBackFace() {
        await this.save.flush();
        await executeAction('remove-face', 'back');
    }

    async toggleFace(faceId) {
        if (faceId === 'back' && !this.hasBackFace)
            await this.addBackFace();
        const frontSection = this.querySelector(`div.face-front`);
        const backSection = this.querySelector(`div.face-back`);
        toggleDisplay(faceId === 'front', frontSection, backSection);
        this.toggleFrontButton.variant = faceId === 'front' ? 'primary' : 'default';
        this.toggleBackButton.variant = faceId === 'front' ? 'default' : 'primary';
    }

    async save() {
        await saveCard(this.editorCard, this.projectCard);
    }
}

customElements.define('cm-card-form', CardForm);
