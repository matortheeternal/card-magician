import Alpine from 'alpinejs';
import html from './editLocalesModalHTML.js';
import {
    getAvailableLocales,
    prepareSchema,
    saveLocale
} from '../../../shared/localize.js';
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
    stats: {},
    statusMessage: '',
    selectedLocale: null,

    async init() {
        this.$root.innerHTML = html;
        await prepareSchema();
        this.localeField.options = await getAvailableLocales();
        this.stats.total = Localization.totalKeys;
        const locale = this.localeField.options[0] || await this.createNewLocale();
        this.selectLocale(locale);
        this.updateStats();
        this.onChange = this.onChange.bind(this);
        this.save = this.save.debounce(1000);
        Alpine.initTree(this.$root);
        this.hydrate();
        this.bind();
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

    selectLocale(locale) {
        this.selectedLocale = locale;
        this.selectedLocaleId = locale.id;
    },

    updateForm() {
        this.$root.querySelectorAll('cm-input').forEach(input => {
            input.model = this.selectedLocale;
        });
    },

    hydrate() {
        this.$root.querySelector('cm-select').model = this;
        this.$root.querySelector('cm-code-editor').value = this.selectedLocale.edit;
        this.updateForm();
    },

    bind() {
        this.$root.addEventListener('code-change', this.onChange);
    },

    updateStats() {
        this.stats.completed = this.selectedLocale.completedCount;
        this.stats.percent = this.selectedLocale.percentComplete;
    },

    async createNewLocale() {
        const id = this.getNextAvailableId();
        const newLocale = new Localization(id);
        this.localeField.options.push(newLocale);
        return newLocale;
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

    async save() {
        this.statusMessage = 'Saving...';
        this.selectedLocale.updated = new Date();
        await saveLocale(this.selectedLocale);
        setTimeout(() => (this.statusMessage = 'Saved.'), 350);
    },

    onChange(event) {
        try {
            this.selectedLocale.raw = event.detail.value;
            this.updateStats();
            this.save();
        } catch (e) {
            console.error(e);
        }
    },

    closeModal() {
        Alpine.store('views').activeModal = null;
    }
}));
