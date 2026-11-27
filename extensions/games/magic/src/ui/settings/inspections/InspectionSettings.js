import './inspectionSettings.css';
import './InspectionTree.js';
import './InspectionTiers.js';
import './InspectionExceptions.js';
import element from './element.js';

const L = localize('game-magic');

function exampleCard(example) {
    const card = element('sl-card');
    const heading = element('div', undefined, 'example-heading');
    heading.slot = 'header';
    const cost = element('span');
    cost.setAttribute('aria-label', example.mana_cost);
    cost.innerHTML = activeGame.symbols.symbolsToHTML(
        activeGame.symbols.parseSymbols(example.mana_cost, false)
    );
    heading.append(element('strong', example.name), cost);
    card.append(
        heading,
        element('strong', example.type_line),
        element('p', example.oracle_text, 'example-text')
    );
    const stats = example.power && example.toughness
        ? `${example.power}/${example.toughness}`
        : example.loyalty;
    if (stats) card.append(element('strong', stats, 'example-stats'));
    return card;
}

function setOverride(record, key, value, isDefault) {
    if (isDefault) {
        delete record[key];
        return;
    }
    record[key] = value;
}

function pruneEmpty(entry, key) {
    if (!Object.keys(entry[key]).length) delete entry[key];
}

function setDisabled(entry, enabled) {
    if (enabled) {
        delete entry.disabled;
        return;
    }
    entry.disabled = true;
}

function clearEntry(entry) {
    for (const key of Object.keys(entry)) delete entry[key];
}

function updateEntry(overrides, id, update) {
    const entry = overrides[id] ?? {};
    update(entry);
    if (Object.keys(entry).length) overrides[id] = entry;
    if (!Object.keys(entry).length) delete overrides[id];
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
        return activeProject.inspectionOverrides ?? {};
    }

    get disabledIds() {
        const ids = Object.keys(this.overrides)
            .filter(id => this.overrides[id].disabled);
        return new Set(ids);
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
        return this.detail.querySelector('.inspection-heading sl-button');
    }

    render() {
        const tree = element('cm-inspection-tree');
        tree.inspections = activeGame.inspections;
        tree.disabledIds = this.disabledIds;
        this.replaceChildren(tree, element('section', undefined, 'inspection-detail'));
    }

    bind() {
        this.on('inspection-select', () => this.showSelected());
        this.on('inspections-toggle', event => {
            const { ids, enabled } = event.detail;
            this.saveEnabled(ids, enabled);
            if (ids.includes(this.tree.selectedId)) this.enabledSwitch.checked = enabled;
        });
        this.on('inspection-tier-change', event => this.saveTier(event.detail));
        this.on('inspection-exception-change', event =>
            this.saveExceptionColors(event.detail));
        this.showSelected();
    }

    showSelected() {
        const inspection = this.selectedInspection;
        if (inspection) return this.renderDetail(inspection);
        this.detail.replaceChildren(element('p', L`No matching inspections.`));
    }

    saveEnabled(ids, enabled) {
        this.updateOverrides(ids, entry => setDisabled(entry, enabled));
    }

    saveTier({ color, tier }) {
        const { id, tiers } = this.selectedInspection;
        this.updateOverrides([id], entry => {
            entry.tiers ??= {};
            setOverride(entry.tiers, color, tier, tier === tiers[color]);
            pruneEmpty(entry, 'tiers');
        });
    }

    saveExceptionColors({ exceptionId, colors }) {
        const { id, exceptions } = this.selectedInspection;
        const { colors: defaults } = exceptions.find(item => item.id === exceptionId);
        this.updateOverrides([id], entry => {
            entry.exceptions ??= {};
            const isDefault = colors.join() === defaults.join();
            setOverride(entry.exceptions, exceptionId, colors, isDefault);
            pruneEmpty(entry, 'exceptions');
        });
    }

    reset() {
        const inspection = this.selectedInspection;
        this.updateOverrides([inspection.id], clearEntry);
        this.tree.setEnabled([inspection.id], true);
        this.renderDetail(inspection);
    }

    updateOverrides(ids, update) {
        const overrides = this.overrides;
        for (const id of ids) updateEntry(overrides, id, update);
        if (Object.keys(overrides).length) activeProject.inspectionOverrides = overrides;
        if (!Object.keys(overrides).length) delete activeProject.inspectionOverrides;
        this.resetButton.disabled = !this.overrides[this.tree.selectedId];
        this.emit('project-changed');
    }

    renderDetail(inspection) {
        this.detail.replaceChildren(this.heading(inspection));
        if (inspection.description)
            this.detail.append(element('p', inspection.description));
        this.detail.append(element('h3', L`Tier by color`), this.tiersFor(inspection));
        if (inspection.exceptions.length) this.renderExceptions(inspection);
        if (inspection.examples.length) this.renderExamples(inspection.examples);
    }

    heading(inspection) {
        const reset = element('sl-button', L`Reset to defaults`);
        reset.size = 'small';
        reset.disabled = !this.overrides[inspection.id];
        reset.addEventListener('click', () => this.reset());
        const enabled = element('sl-switch', L`Enabled`);
        enabled.checked = !this.disabledIds.has(inspection.id);
        enabled.addEventListener('sl-change', () => {
            this.saveEnabled([inspection.id], enabled.checked);
            this.tree.setEnabled([inspection.id], enabled.checked);
        });
        const actions = element('div');
        actions.append(reset, enabled);
        const heading = element('header', undefined, 'inspection-heading');
        heading.append(element('h2', inspection.title), actions);
        return heading;
    }

    tiersFor(inspection) {
        const tiers = element('cm-inspection-tiers');
        tiers.defaults = inspection.tiers;
        tiers.overrides = this.overrides[inspection.id]?.tiers ?? {};
        return tiers;
    }

    exceptionsFor(inspection) {
        const exceptions = element('cm-inspection-exceptions');
        exceptions.exceptions = inspection.exceptions;
        exceptions.overrides = this.overrides[inspection.id]?.exceptions ?? {};
        return exceptions;
    }

    renderExceptions(inspection) {
        this.detail.append(element('h3', L`Exceptions`), this.exceptionsFor(inspection));
    }

    renderExamples(examples) {
        const cards = element('div', undefined, 'inspection-examples');
        cards.append(...examples.map(exampleCard));
        this.detail.append(element('h3', L`Examples`), cards);
    }
}
