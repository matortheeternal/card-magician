import './inspectionSettings.css';
import './InspectionTree.js';
import './InspectionTiers.js';
import './InspectionExceptions.js';
import './InspectionExamples.js';
import element from './element.js';
import InspectionOverrides from '../../../domain/inspections/InspectionOverrides.js';
import {
    colorSearchUrl, inspectionSearchUrl
} from '../../../domain/inspections/scryfallSearch.js';

const L = localize('game-magic');

function searchButton() {
    const button = element('sl-button', L`Scryfall`);
    button.size = 'small';
    button.dataset.clickAction = 'search-inspection';
    const icon = element('sl-icon');
    icon.name = 'search';
    icon.slot = 'prefix';
    button.prepend(icon);
    return button;
}

export default class InspectionSettings extends CardMagicianSettings {
    static id = 'cm-magic-inspection-settings';
    static parentId = 'cm-project-settings';
    static label = L`Inspections`;
    static groupWeight = 768;

    static hide() {
        return window.activeGame?.id !== 'magic' || !window.activeProject;
    }

    static search(query) {
        return [];
    }

    get overrides() {
        return new InspectionOverrides(activeProject);
    }

    get selectedInspection() {
        return activeGame.inspections.find(item => item.id === this.tree.selectedId);
    }

    get tree() {
        return this.querySelector('cm-inspection-tree');
    }

    get detail() {
        return this.querySelector('.inspection-detail');
    }

    get enabledSwitch() {
        return this.detail.querySelector('.inspection-heading sl-switch');
    }

    get resetButton() {
        return this.detail.querySelector('[data-click-action="reset"]');
    }

    get examples() {
        return this.detail.querySelector('cm-inspection-examples');
    }

    render() {
        const tree = element('cm-inspection-tree');
        tree.inspections = activeGame.inspections;
        tree.disabledIds = this.overrides.disabledIds;
        this.replaceChildren(tree, element('section', undefined, 'inspection-detail'));
    }

    bind() {
        this.on('inspection-select', () => this.showSelected());
        this.on('inspections-toggle', event => this.toggleInspections(event.detail));
        this.on('inspection-tier-change', event => this.saveTier(event.detail));
        this.on('inspection-exceptions-change', event =>
            this.saveExceptions(event.detail.exceptions));
        this.on('inspection-search', event => this.searchColor(event.detail.color));
        this.handleEvents('click', {
            reset: () => this.reset(),
            'search-inspection': () =>
                this.openUrl(inspectionSearchUrl(this.selectedInspection))
        });
        this.showSelected();
    }

    showSelected() {
        const inspection = this.selectedInspection;
        if (inspection) return this.renderDetail(inspection);
        this.detail.replaceChildren(element('p', L`No matching inspections.`));
    }

    toggleInspections({ ids, enabled }) {
        this.saveChange(() => this.overrides.setEnabled(ids, enabled));
        this.tree.setEnabled(ids, enabled);
        if (ids.includes(this.tree.selectedId)) this.enabledSwitch.checked = enabled;
    }

    saveTier({ color, tier }) {
        const inspection = this.selectedInspection;
        this.saveChange(() => this.overrides.setTier(inspection, color, tier));
        this.examples?.update(this.overrides.tiersOf(inspection));
    }

    saveExceptions(exceptions) {
        const inspection = this.selectedInspection;
        this.saveChange(() => this.overrides.setExceptions(inspection, exceptions));
    }

    searchColor(color) {
        this.openUrl(colorSearchUrl(this.selectedInspection, color));
    }

    openUrl(url) {
        activeGame.platform.openUrl(url);
    }

    reset() {
        const inspection = this.selectedInspection;
        this.saveChange(() => this.overrides.reset(inspection.id));
        this.tree.setEnabled([inspection.id], true);
        this.renderDetail(inspection);
    }

    saveChange(change) {
        change();
        this.resetButton.disabled = !this.overrides.has(this.tree.selectedId);
        this.emit('project-changed');
    }

    renderDetail(inspection) {
        this.detail.replaceChildren(this.heading(inspection));
        if (inspection.description)
            this.detail.append(element('p', inspection.description));
        this.detail.append(element('h3', L`Tier by color`), this.tiersFor(inspection));
        if (inspection.conditions.length) this.renderExceptions(inspection);
        if (inspection.example) this.renderExamples(inspection);
    }

    heading(inspection) {
        const reset = element('sl-button', L`Reset to defaults`);
        reset.size = 'small';
        reset.dataset.clickAction = 'reset';
        reset.disabled = !this.overrides.has(inspection.id);
        const enabled = element('sl-switch', L`Enabled`);
        enabled.checked = !this.overrides.disabledIds.has(inspection.id);
        enabled.addEventListener('sl-change', () =>
            this.toggleInspections({ ids: [inspection.id], enabled: enabled.checked }));
        const actions = element('div');
        actions.append(searchButton(), reset, enabled);
        const heading = element('header', undefined, 'inspection-heading');
        heading.append(element('h2', inspection.title), actions);
        return heading;
    }

    tiersFor(inspection) {
        const tiers = element('cm-inspection-tiers');
        tiers.defaults = inspection.tiers;
        tiers.overrides = this.overrides.all[inspection.id]?.tiers ?? {};
        return tiers;
    }

    renderExceptions(inspection) {
        const exceptions = element('cm-inspection-exceptions');
        exceptions.conditions = inspection.conditions;
        exceptions.exceptions = this.overrides.exceptionsOf(inspection);
        this.detail.append(element('h3', L`Exceptions`), exceptions);
    }

    renderExamples(inspection) {
        const examples = element('cm-inspection-examples');
        examples.inspection = inspection;
        examples.tiers = this.overrides.tiersOf(inspection);
        this.detail.append(element('h3', L`Examples`), examples);
    }
}
