import html from './cardForm.html.js';
import {
    onActiveCardChanged,
    saveCard
} from '../../../domain/projects/projectManager.js';
import { pushState, registerState } from '../../systems/navigationSystem.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';
import { executeAction } from '../../systems/actionSystem.js';
import { registerHotkey } from '../../systems/hotkeySystem.js';

const L = localize('card-form');
const report = createReporter({
    unit: 'CardForm',
    label: 'Card Editor'
});
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

    get activeFaceId() {
        const frontSection = this.querySelector(`div.face-front`);
        return frontSection.style.display !== 'none' ? 'front' : 'back';
    }

    get activeFaceElement() {
        const frontSection = this.querySelector(`div.face-front`);
        const backSection = this.querySelector(`div.face-back`);
        return frontSection.style.display !== 'none' ? frontSection  : backSection;
    }

    bind() {
        registerHotkey('Ctrl+;', async () => {
            const activeFaceElement = this.activeFaceElement;
            const faceForm = activeFaceElement.querySelector('cm-face-form');
            const optionsForm = activeFaceElement.querySelector('cm-options-form');
            const formToFocus = optionsForm.contains(document.activeElement)
                ? faceForm
                : optionsForm;
            if (formToFocus.parentElement.open) {
                formToFocus.focusFirstField();
                return;
            }
            this.addEventListener(
                'sl-after-show',
                () => formToFocus.focusFirstField(),
                { once: true }
            );
            formToFocus.parentElement.show();
        });
        registerHotkey('F6', () => {
            const activeFaceElement = this.activeFaceElement;
            const faceForm = activeFaceElement.querySelector('cm-face-form');
            faceForm.focusNameField();
        });
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
        try {
            await saveCard(this.editorCard, this.projectCard);
        } catch (error) {
            report('cardForm:save', error, [this.editorCard, this.projectCard]);
            log('state').error(error);
        }
    }
}

customElements.define('cm-card-form', CardForm);
