import Alpine from 'alpinejs';
import html from './editLocalesModalHTML.js';
import { getAvailableLocales } from '../../../shared/localize.js';
import Localization from '../../../shared/Localization.js';
const { getAbsolutePath } = Neutralino.filesystem;

const L = localize('edit-locales-modal');

Alpine.data('editLocalesModal', () => ({
    localeField: {
        id: 'selectedLocaleId',
        label: L`Selected Locale`,
        type: 'select'
    },
    idField: {
        id: 'id',
        label: L`Locale ID`
    },
    labelField: {
        id: 'label',
        label: L`Label`
    },
    contributorsField: {
        id: 'contributors',
        placeholder: L`Your name here`,
        label: L`Contributors`
    },
    selectedLocale: null,

    async init() {
        this.$root.innerHTML = html;
        this.localeField.options = await getAvailableLocales();
        this.selectedLocale = this.localeField.options[0];
        if (!this.selectedLocale) await this.createNewLocale();
        Alpine.initTree(this.$root);
        this.hydrate();
    },

    getNextAvailableId() {
        const usedIds = this.localeField.options.map(opt => opt.id);
        const baseId = 'newId';
        let id = baseId;
        let n = 2;
        while (usedIds.includes(id))
            id = `${baseId}${n++}`;

        return id;
    },

    updateForm() {
        this.$root.querySelectorAll('cm-input').forEach(input => {
            input.model = this.selectedLocale;
        });

    },

    hydrate() {
        this.$root.querySelector('cm-select').model = this;
        this.$root.querySelector('cm-code-editor').value = this.selectedLocale.data;
        this.updateForm();
    },

    async createNewLocale() {
        const id = this.getNextAvailableId();
        this.selectedLocale = await Localization.generate(id);
        this.localeField.options.push(this.selectedLocale);
        this.selectedLocaleId = id;
    },

    async openLocalesFolder() {
        const localesPath = await getAbsolutePath(NL_PATH + '/locales');
        Neutralino.os.open(localesPath);
    },

    validate() {
         // TODO
    },

    activate() {
        // TODO
    },

    share() {
        // TODO
    },

    closeModal() {
        Alpine.store('views').activeModal = null;
    }
}));
