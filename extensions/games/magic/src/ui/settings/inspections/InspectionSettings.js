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

function searchButton(inspection) {
    const button = element('sl-button', L`Scryfall`);
    button.size = 'small';
    button.dataset.clickAction = 'search-inspection';
    const icon = element('sl-icon');
    icon.name = 'search';
    icon.slot = 'prefix';
    button.prepend(icon);
    const tooltip = element('sl-tooltip');
    tooltip.content = L`Search Scryfall for ${inspection.cards}`;
    tooltip.append(button);
    return tooltip;
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
        return new InspectionOverrides(activeProject, activeGame.inspections);
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

    selectInspection(id) {
        this.tree.filter.value = '';
        this.tree.selectedId = id;
        this.tree.filterChanged();
        const selected = this.tree.leafItems;
        const item = [...selected].find(leaf => leaf.dataset.inspectionId === id);
        item?.scrollIntoView({ block: 'nearest' });
    }

    showSelected() {
        const inspection = this.selectedInspection;
        if (inspection) return this.renderDetail(inspection);
        this.detail.replaceChildren(element('p', L`No matching inspections.`));
    }

    toggleInspections({ ids, enabled }) {
        this.saveChange(() => this.overrides.setEnabled(ids, enabled));
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
        this.tree.setEnabled([inspection.id], this.overrides.isEnabled(inspection.id));
        this.renderDetail(inspection);
    }

    saveChange(change) {
        change();
        changed(activeProject, 'inspectionOverrides');
        this.resetButton.disabled = !this.overrides.has(this.tree.selectedId);
        this.emit('project-changed');
    }

    renderDetail(inspection) {
        this.detail.replaceChildren(this.heading(inspection));
        if (inspection.description)
            this.detail.append(element('p', inspection.description));
        if (inspection.resolution) {
            const resolution = L`Available resolution: ${inspection.resolution}`;
            this.detail.append(element('p', resolution));
        }
        if (inspection.tiers) this.renderTiers(inspection);
        if (inspection.conditions?.length) this.renderExceptions(inspection);
        if (inspection.example) this.renderExamples(inspection);
    }

    heading(inspection) {
        const reset = element('sl-button', L`Reset to defaults`);
        reset.size = 'small';
        reset.dataset.clickAction = 'reset';
        reset.disabled = !this.overrides.has(inspection.id);
        const actions = element('div');
        if (inspection.scryfall) actions.append(searchButton(inspection));
        actions.append(reset);
        const heading = element('header', undefined, 'inspection-heading');
        heading.append(element('h2', inspection.title), actions);
        return heading;
    }

    renderTiers(inspection) {
        const tiers = element('cm-inspection-tiers');
        tiers.defaults = inspection.tiers;
        tiers.cards = inspection.cards;
        tiers.overrides = this.overrides.all[inspection.id]?.tiers ?? {};
        this.detail.append(element('h3', L`Tier by color`), tiers);
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
