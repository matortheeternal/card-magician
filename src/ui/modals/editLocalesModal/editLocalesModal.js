import { registerModal } from '../modalManager.js';
import Modal from '../Modal.js';
import { saveLocale } from '../../../shared/localize.js';
import Localization from '../../../shared/Localization.js';
import html from './editLocalesModal.html.js';
import { renderFields } from '../../systems/fieldSystem.js';

const L = localize('edit-locales-modal');

export default class EditLocalesModal extends Modal {
    static id = 'cm-edit-locales-modal';
    title = L`Edit Locales`;
    localeField = {
        id: 'selectedLocaleId',
        label: L`Selected Locale`,
        type: 'select'
    };
    stats = {};
    statusMessage = '';

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            save: this.save,
            openLocalesFolder: this.openLocalesFolder,
            createNewLocale: this.createNewLocale,
            activate: this.activate,
            share: this.share
        };
    }

    async init() {
        this.save = this.save.debounce(1000);
        this.localeField.options = this.data.locales;
        this.stats.total = Localization.totalKeys;
    }

    connectedCallback() {
        this.init().then(() => {
            super.connectedCallback();
            this.statsContainer = this.querySelector('.stats');
            if (Boolean(this.data.selectedLocale)) {
                this.selectLocale(this.data.selectedLocale);
            } else {
                this.createNewLocale();
            }
        });
    }

    bind() {
        super.bind();
        this.on('code-change', event => this.onCodeChange(event));
        this.on('cm-field-changed', event => this.onFieldChanged(event))
    }

    get fields() {
        return [this.localeField];
    }

    get localeFields() {
        return [
            { id: 'id', label: L`Locale ID` },
            { id: 'label', label: L`Label` },
            { id: 'contributors',
                placeholder: L`Your name here`,
                label: L`Contributors` },
            { id: 'text', label: L`Text`, type: 'code' }
        ];
    }

    selectLocale(locale) {
        this.data.selectedLocale = locale;
        this.data.selectedLocaleId = locale.id;
        renderFields(this, this.data.selectedLocale, this.localeFields, {
            getSelector: field => `form-field[field-id="${field.id}"]`
        });
    }

    getNextAvailableId() {
        const usedIds = this.localeField.options.map(opt => opt.id);
        const baseId = 'newId';
        let id = baseId;
        let n = 2;
        while (usedIds.includes(id))
            id = `${baseId}${n++}`;

        return id;
    }

    createNewLocale() {
        const id = this.getNextAvailableId();
        const newLocale = new Localization(id);
        this.localeField.options = [...this.localeField.options, newLocale];
        this.selectLocale(newLocale);
    }

    updateStats() {
        this.stats.completed = this.data.selectedLocale.completedCount;
        this.stats.percent = this.data.selectedLocale.percentComplete;
        this.statsContainer.innerHTML = (
            `<span>Progress:&nbsp;</span>
             <span>${this.stats.completed}</span>
             <span>/</span>
             <span>${this.stats.total}</span>
             <span>&nbsp;—&nbsp;</span>
             <span>${this.stats.percent}</span>`
        );
    }

    renderBody() {
        return html;
    }

    renderActions() {
        return (
            `<sl-button data-click-action="activate">${L`Activate`}</sl-button>
             <sl-button data-click-action="share">${L`Share`}</sl-button>
             <sl-button data-click-action="close">${L`Close`}</sl-button>`
        );
    }

    async openLocalesFolder() {
        const localesPath = await Neutralino.filesystem.getAbsolutePath(
            NL_PATH + '/locales'
        );
        Neutralino.os.open(localesPath);
    }

    validate() {
        // TODO
    }

    activate() {
        // TODO
    }

    share() {
        // TODO
    }

    async save() {
        this.statusMessage = 'Saving...';
        this.data.selectedLocale.updated = new Date();
        await saveLocale(this.data.selectedLocale);
        setTimeout(() => (this.statusMessage = 'Saved.'), 350);
    }

    onCodeChange() {
        try {
            this.updateStats();
            this.save();
        } catch (e) {
            console.error(e);
        }
    }

    onFieldChanged(event) {
        const formField = event.target.closest('form-field');
        if (formField.fieldId !== 'selectedLocaleId') return;
        const locale = this.localeField.options.find(option => {
            return option.id === event.value;
        });
        if (locale) this.selectLocale(locale);
    }
}

registerModal(EditLocalesModal);
