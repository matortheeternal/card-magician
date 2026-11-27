import Modal from '../Modal.js';
import { getActiveModal, registerModal } from '../modalManager.js';
import './TemplatePicker.js';

const L = localize('template-picker');

export default class TemplatePickerModal extends Modal {
    static id = 'cm-template-picker-modal';
    title = L`Choose a template`;
    capturesHotkeys = true;

    get picker() {
        return this.querySelector('cm-template-picker');
    }

    get cancelButton() {
        return this.querySelector('sl-button[data-click-action="close"]');
    }

    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-modal', 'true');
        this.setAttribute('aria-label', this.title);
        this.picker.setTemplates(this.data.templates, this.data.selected);
        void this.focusSearch();
    }

    bind() {
        super.bind();
        this.on('cm-template-selected', event => this.apply(event.detail.id));
        this.on('keydown', event => this.onKeyDown(event));
    }

    async focusSearch() {
        const search = this.picker.search;
        await search.updateComplete;
        if (getActiveModal() === this) search.focus();
    }

    onKeyDown(event) {
        if (event.key === 'Escape' && !event.isComposing) {
            event.preventDefault();
            this.close();
            return;
        }
        if (event.key === 'Tab') this.wrapFocus(event);
    }

    wrapFocus(event) {
        const first = this.picker.search;
        const last = this.cancelButton;
        const start = event.shiftKey ? first : last;
        if (document.activeElement !== start) return;
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
    }

    close() {
        super.close();
        void this.data.onClose();
    }

    async apply(id) {
        super.close();
        try {
            await this.data.onSelect(id);
        } finally {
            await this.data.onClose();
        }
    }

    renderBody() {
        return '<cm-template-picker></cm-template-picker>';
    }

    renderActions() {
        return `<sl-button data-click-action="close">${L`Cancel`}</sl-button>`;
    }
}

registerModal(TemplatePickerModal);
