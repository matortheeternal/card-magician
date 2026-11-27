import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';
import {
    getFamilyDefaults, getPreferredTemplateDefault, getTemplateFamily
} from '../../domain/template/templateRegistry.js';
import { refreshAutoTemplate } from '../../domain/projects/projectManager.js';
import { flushPendingCardSaves } from '../systems/cardEditingSystem.js';
import { escapeHTML } from '../../shared/htmlUtils.js';

const L = localize('card-defaults');
const report = createReporter({ unit: 'CardDefaultsSettings' });

function familyOptions() {
    const families = new Set(
        getFamilyDefaults(window.activeGame?.id).map(getTemplateFamily)
    );
    return [...families].map(id => ({ id, name: escapeHTML(id) }));
}

export default class CardDefaultsSettings extends CardMagicianSettings {
    static id = 'cm-card-defaults-settings';
    static parentId = 'cm-project-settings';
    static label = L`Card Defaults`;
    static groupWeight = 512;

    static hide() {
        return !window.activeProject || !familyOptions().length;
    }

    static get fields() {
        return [{
            id: 'preferredTemplateFamily',
            type: 'select',
            label: L`Preferred template family`,
            description: L`Auto uses this family’s templates.`,
            options: familyOptions()
        }];
    }

    static search(query) {
        return this.fields.filter(field => this.fieldMatches(field, query));
    }

    get fields() {
        return this.constructor.fields;
    }

    connectedCallback() {
        this.project = window.activeProject;
        this.model = {
            preferredTemplateFamily: getTemplateFamily(getPreferredTemplateDefault())
        };
        super.connectedCallback();
    }

    bind() {
        this.on('cm-field-changed', event => {
            const family = event.detail.newValue;
            this.project.preferredTemplateFamily = family;
            this.emit('project-changed');
            this.refreshEditor(family).catch(error => report('refreshEditor', error));
        });
    }

    get cardForm() {
        return document.querySelector('cm-card-form');
    }

    async refreshEditor(family) {
        await flushPendingCardSaves();
        const isCurrent = () => window.activeProject === this.project
            && this.project.preferredTemplateFamily === family
            && !this.cardForm?.save.pending;
        const card = window.selectedProjectCard;
        if (card && isCurrent()) await refreshAutoTemplate(card, isCurrent);
    }

    render() {
        return this.innerHTML = (
            `<form-field field-id="preferredTemplateFamily"></form-field>
            <p>${this.fields[0].description}</p>`
        );
    }
}

registerSettings(CardDefaultsSettings);
