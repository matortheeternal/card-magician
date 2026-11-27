import { registerPendingSave } from '../../../lifecycle.js';
import html from './cardForm.html.js';
import {
    onActiveCardChanged,
    refreshAutoTemplate,
    saveCard
} from '../../../domain/projects/projectManager.js';
import { pushState, registerState } from '../../systems/navigationSystem.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';
import { executeAction, registerAction } from '../../systems/actionSystem.js';
import { registerHotkey } from '../../systems/hotkeySystem.js';
import { flushPendingCardSaves } from '../../systems/cardEditingSystem.js';
import * as historySystem from '../../systems/historySystem.js';
import { isAutoTemplateField } from '../../../domain/template/autoTemplate.js';

const L = localize('card-form');
const report = createReporter({
    unit: 'CardForm',
    label: 'Card Editor'
});
const SMOKE_TESTING = appEnvironment.args.includes('--run-smoke-tests');
const DEBOUNCE_TIME = SMOKE_TESTING ? 30 : 1000;

class CardForm extends ReactiveComponent {
    #editorCard;
    #editVersion = 0;

    constructor() {
        super();
        this.save = this.save.debounce(DEBOUNCE_TIME);
    }

    connectedCallback() {
        this.unregisterExitSave = registerPendingSave(this.save);
        this.render();
        this.addEventListener('cm-field-changed', event => {
            this.#editVersion++;
            historySystem.push(this.projectCard, event)?.catch(error => {
                report('history', error, [this.projectCard, event.detail]);
                executeAction('set-status', 'failed');
            });
            executeAction('set-status', 'changes');
            this.save().catch(() => {});
        });

        onActiveCardChanged(editorCard => this.updateEditor(editorCard));
        this.bind();
    }

    async updateEditor(editorCard) {
        if (editorCard && editorCard.baseCard === this.projectCard)
            return this.rebuildEditor(editorCard);
        await this.save.flush();
        this.editorCard = editorCard;
        this.projectCard = window.selectedProjectCard;
        pushState('card-form');
    }

    async rebuildEditor(editorCard) {
        const faceId = this.activeFaceId;
        const typeInput = this.focusedTypeInput;
        this.editorCard = editorCard;
        if (faceId === 'back' && this.hasBackFace) this.showFace(faceId);
        if (typeInput) await this.restoreTypeFocus(typeInput);
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

    disconnectedCallback() {
        this.unregisterExitSave?.();
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
        registerAction('cancel-card-save', () => this.save.cancel());
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
        this.showFace(faceId);
    }

    showFace(faceId) {
        const frontSection = this.querySelector(`div.face-front`);
        const backSection = this.querySelector(`div.face-back`);
        toggleDisplay(faceId === 'front', frontSection, backSection);
        this.toggleFrontButton.variant = faceId === 'front' ? 'primary' : 'default';
        this.toggleBackButton.variant = faceId === 'front' ? 'default' : 'primary';
    }

    isEditing(card) {
        return this.projectCard === card && selectedProjectCard === card;
    }

    getTemplateField(faceId) {
        const form = [...this.faceForms].find(form =>
            form.localName === 'cm-face-form' && form.dataset.faceId === faceId
        );
        return form?.templateField;
    }

    get focusedTypeInput() {
        const input = document.activeElement;
        if (!this.contains(input) || input?.localName !== 'sl-input') return null;
        return isAutoTemplateField(input.name) ? input : null;
    }

    async restoreTypeFocus(previous) {
        const input = this.activeFaceElement.querySelector(
            `cm-face-form sl-input[name="${previous.name}"]`
        );
        if (!input) return;
        await input.updateComplete;
        if (!input.isConnected || document.activeElement !== document.body) return;
        input.focus();
        const { selectionStart, selectionEnd } = previous.input;
        input.setSelectionRange(selectionStart, selectionEnd);
    }

    async focusTemplateButton(card, faceId) {
        if (!this.isEditing(card)) return;
        const button = this.getTemplateField(faceId)?.button;
        if (!button) return;
        await button.updateComplete;
        if (button.isConnected) button.focus();
    }

    async changeTemplate(card, faceId, value) {
        if (!this.isEditing(card)) return;
        await flushPendingCardSaves();
        if (!this.isEditing(card)) return;
        const field = this.getTemplateField(faceId);
        if (!field || field.selectedTemplate === value) return;
        field.applyChange(value);
        await flushPendingCardSaves();
        if (!this.isEditing(card) || !field.isConnected || field.value !== value)
            return;
        await executeAction('change-template', faceId, value);
    }

    async save() {
        const card = this.projectCard;
        const editVersion = this.#editVersion;
        try {
            executeAction('set-status', 'saving');
            await saveCard(this.editorCard, card);
            await refreshAutoTemplate(card, () => this.#editVersion === editVersion);
            executeAction('set-status', 'saved');
        } catch (error) {
            executeAction('set-status', 'failed');
            report('save', error, [this.editorCard, this.projectCard]);
            log('state').error(error);
            throw error;
        }
    }
}

customElements.define('cm-card-form', CardForm);
