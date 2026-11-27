import './inspectionSettings.css';

const L = localize('game-magic');
const COLORS = { W: L`White`, U: L`Blue`, B: L`Black`, R: L`Red`, G: L`Green` };
const TIERS = {
    primary: L`Primary`,
    secondary: L`Secondary`,
    tertiary: L`Tertiary`,
    none: L`None`,
};
const SEVERITIES = { tertiary: L`Bend`, none: L`Break` };

function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
}

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

    render() {
        const filter = element('sl-input');
        filter.type = 'search';
        filter.size = 'small';
        filter.placeholder = L`Filter inspections`;
        filter.setAttribute('aria-label', L`Filter inspections`);
        this.tree = element('sl-tree');
        this.tree.selection = 'leaf';
        this.tree.setAttribute('aria-label', L`Inspections`);
        this.results = element('div', undefined, 'inspection-list');
        const filterBar = element('div', undefined, 'inspection-filter');
        filterBar.append(filter);
        this.results.append(filterBar, this.tree);
        this.detail = element('section', undefined, 'inspection-detail');
        this.replaceChildren(this.results, this.detail);

        filter.addEventListener('sl-input', () => this.renderTree(filter.value));
        this.tree.addEventListener('sl-selection-change', event => {
            event.stopPropagation();
            const id = event.detail.selection[0]?.dataset.inspectionId;
            const inspection = activeGame.inspections.find(item => item.id === id);
            if (inspection) this.renderDetail(inspection);
        });
        this.renderTree('');
    }

    renderTree(query) {
        const term = query.trim().toLowerCase();
        const inspections = activeGame.inspections.filter(item =>
            [item.title, item.group, item.subgroup, item.id].join(' ')
                .toLowerCase().includes(term));
        const selected = inspections.find(item => item.id === this.selectedId)
            ?? inspections[0];
        this.tree.replaceChildren();
        const groups = new Map();
        for (const inspection of inspections) {
            const group = this.groupNode(groups, inspection.group, this.tree);
            const parent = inspection.subgroup
                ? this.groupNode(groups, inspection.subgroup, group)
                : group;
            const leaf = element('sl-tree-item', inspection.title);
            leaf.dataset.inspectionId = inspection.id;
            leaf.selected = inspection === selected;
            if (leaf.selected || term) {
                group.expanded = true;
                parent.expanded = true;
            }
            parent.append(leaf);
        }
        this.tree.hidden = !selected;
        if (selected) return this.renderDetail(selected);
        this.detail.replaceChildren(element('p', L`No matching inspections.`));
    }

    groupNode(groups, title, parent) {
        const key = `${parent.dataset.group ?? ''}/${title}`;
        if (!groups.has(key)) {
            const group = element('sl-tree-item', title);
            group.dataset.group = key;
            parent.append(group);
            groups.set(key, group);
        }
        return groups.get(key);
    }

    updateOverride(id, update) {
        const overrides = this.overrides;
        const entry = overrides[id] ?? {};
        update(entry);
        if (Object.keys(entry).length) overrides[id] = entry;
        if (!Object.keys(entry).length) delete overrides[id];
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
        this.updateOverride(inspection.id, entry => {
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
        this.selectedId = inspection.id;
        const enabled = element('sl-switch', L`Enabled`);
        enabled.checked = this.overrides[inspection.id]?.disabled !== true;
        enabled.addEventListener('sl-change', () => {
            this.updateOverride(inspection.id, entry => {
                if (enabled.checked) delete entry.disabled;
                if (!enabled.checked) entry.disabled = true;
            });
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
