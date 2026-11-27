import './inspectionSettings.css';
import './InspectionTree.js';
import element from './element.js';

const L = localize('game-magic');
const COLORS = { W: L`White`, U: L`Blue`, B: L`Black`, R: L`Red`, G: L`Green` };
const TIERS = {
    primary: L`Primary`,
    secondary: L`Secondary`,
    tertiary: L`Tertiary`,
    none: L`None`,
};
const SEVERITIES = { tertiary: L`Bend`, none: L`Break` };

function tierOption(value, label) {
    const option = element('sl-option', label);
    option.value = value;
    return option;
}

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

function setTier(tiers, color, value) {
    if (value === 'default') {
        delete tiers[color];
        return;
    }
    tiers[color] = value;
}

function setDisabled(entry, enabled) {
    if (enabled) {
        delete entry.disabled;
        return;
    }
    entry.disabled = true;
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

    get tree() {
        return this.querySelector('cm-inspection-tree');
    }

    get detail() {
        return this.querySelector('.inspection-detail');
    }

    get enabledSwitch() {
        return this.detail.querySelector('.inspection-heading sl-switch');
    }

    render() {
        const tree = element('cm-inspection-tree');
        tree.inspections = activeGame.inspections;
        tree.disabledIds = this.disabledIds;
        this.replaceChildren(tree, element('section', undefined, 'inspection-detail'));
    }

    bind() {
        this.on('inspection-select', event => this.showInspection(event.detail.id));
        this.on('inspections-toggle', event => {
            const { ids, enabled } = event.detail;
            this.saveEnabled(ids, enabled);
            if (ids.includes(this.tree.selectedId)) this.enabledSwitch.checked = enabled;
        });
        this.showInspection(this.tree.selectedId);
    }

    showInspection(id) {
        const inspection = activeGame.inspections.find(item => item.id === id);
        if (inspection) return this.renderDetail(inspection);
        this.detail.replaceChildren(element('p', L`No matching inspections.`));
    }

    saveEnabled(ids, enabled) {
        this.updateOverrides(ids, entry => setDisabled(entry, enabled));
    }

    updateOverrides(ids, update) {
        const overrides = this.overrides;
        for (const id of ids) updateEntry(overrides, id, update);
        if (Object.keys(overrides).length) activeProject.inspectionOverrides = overrides;
        if (!Object.keys(overrides).length) delete activeProject.inspectionOverrides;
        this.emit('project-changed');
    }

    tierControls(inspection, exception = null) {
        const container = element('div', undefined, 'inspection-tiers');
        for (const [color, name] of Object.entries(COLORS))
            container.append(this.tierSelect(inspection, exception, color, name));
        return container;
    }

    tierSelect(inspection, exception, color, name) {
        const panel = element('div', undefined, 'inspection-tier');
        const image = element('img');
        image.src = activeGame.symbols.resolveColorSymbolIcon(color.toLowerCase());
        image.alt = '';
        const label = element('span', name, 'tier-label');
        label.slot = 'label';
        label.prepend(image);
        const select = element('sl-select');
        select.size = 'small';
        select.append(label);
        const defaults = exception?.tiers ?? inspection.tiers;
        select.append(tierOption('default', L`Default`));
        if (exception && defaults[color])
            select.append(tierOption('inherit', L`Inspection tier`));
        for (const [id, title] of Object.entries(TIERS))
            select.append(tierOption(id, title));
        const entry = this.overrides[inspection.id];
        const tiers = exception ? entry?.exceptions?.[exception.id] : entry?.tiers;
        select.value = tiers?.[color] ?? 'default';
        const status = element('span', undefined, 'tier-status');
        const updateStatus = () => {
            const isDefault = select.value === 'default';
            const tier = isDefault ? defaults[color] : select.value;
            const severity = SEVERITIES[tier];
            status.dataset.severity = severity ? tier : '';
            const label = isDefault ? TIERS[tier] ?? L`Inspection tier` : '';
            status.textContent = [label, severity].filter(Boolean).join(' · ')
                || (tier === 'inherit' ? L`Inherited` : L`No problem`);
        };
        updateStatus();
        select.addEventListener('sl-change', () => {
            this.updateTier(inspection, exception, color, select.value);
            updateStatus();
        });
        panel.append(select, status);
        return panel;
    }

    updateTier(inspection, exception, color, value) {
        this.updateOverrides([inspection.id], entry => {
            if (!exception) {
                entry.tiers ??= {};
                setTier(entry.tiers, color, value);
                if (!Object.keys(entry.tiers).length) delete entry.tiers;
                return;
            }
            const exceptions = entry.exceptions ??= {};
            const tiers = exceptions[exception.id] ??= {};
            setTier(tiers, color, value);
            if (!Object.keys(tiers).length) delete exceptions[exception.id];
            if (!Object.keys(exceptions).length) delete entry.exceptions;
        });
    }

    renderDetail(inspection) {
        const enabled = element('sl-switch', L`Enabled`);
        enabled.checked = !this.disabledIds.has(inspection.id);
        enabled.addEventListener('sl-change', () => {
            this.saveEnabled([inspection.id], enabled.checked);
            this.tree.setEnabled([inspection.id], enabled.checked);
        });
        const heading = element('div', undefined, 'inspection-heading');
        heading.append(element('h2', inspection.title), enabled);
        this.detail.replaceChildren(heading);
        if (inspection.description)
            this.detail.append(element('p', inspection.description));
        this.detail.append(
            element('h3', L`Tier by color`), this.tierControls(inspection)
        );
        if (inspection.exceptions?.length) this.renderExceptions(inspection);
        if (inspection.examples?.length) this.renderExamples(inspection.examples);
    }

    renderExceptions(inspection) {
        this.detail.append(element('h3', L`Exceptions`));
        for (const exception of inspection.exceptions) {
            const details = element('sl-details');
            details.summary = exception.title;
            details.append(this.tierControls(inspection, exception));
            this.detail.append(details);
        }
    }

    renderExamples(examples) {
        const cards = element('div', undefined, 'inspection-examples');
        cards.append(...examples.map(exampleCard));
        this.detail.append(element('h3', L`Examples`), cards);
    }
}
