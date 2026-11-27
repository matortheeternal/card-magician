import './inspectionTree.css';
import element from './element.js';

const L = localize('game-magic');

function searchText(inspection) {
    return [inspection.title, inspection.group, inspection.subgroup, inspection.id]
        .join(' ').toLowerCase();
}

function stopClick(event) {
    event.stopPropagation();
}

function treeItem(title) {
    const item = element('sl-tree-item');
    const label = element('span', title);
    label.title = title;
    const checkbox = element('sl-checkbox');
    checkbox.size = 'small';
    checkbox.setAttribute('aria-label', L`Enable ${title}`);
    checkbox.addEventListener('click', stopClick);
    item.append(label, checkbox);
    return item;
}

function ownCheckbox(item) {
    return item.querySelector(':scope > sl-checkbox');
}

function expandAncestors(item) {
    for (let parent = item.parentElement; parent.tagName === 'SL-TREE-ITEM';
        parent = parent.parentElement)
        parent.expanded = true;
}

export default class InspectionTree extends ReactiveComponent {
    inspections = [];
    disabledIds = new Set();
    selectedId = null;

    connectedCallback() {
        this.render();
        this.bind();
    }

    get filter() {
        return this.querySelector('sl-input');
    }

    get tree() {
        return this.querySelector('sl-tree');
    }

    get leafItems() {
        return this.tree.querySelectorAll('sl-tree-item[data-inspection-id]');
    }

    get groupItems() {
        return this.tree.querySelectorAll('sl-tree-item[data-group]');
    }

    bind() {
        this.filter.addEventListener('sl-input', () => this.filterChanged());
        this.tree.addEventListener('sl-selection-change', event => {
            event.stopPropagation();
            this.select(event.detail.selection[0]?.dataset.inspectionId);
        });
        this.tree.addEventListener('sl-change', event => this.toggle(event.target));
    }

    filterChanged() {
        this.renderTree();
        this.emit('inspection-select', { id: this.selectedId });
    }

    select(id) {
        if (!id) return;
        this.selectedId = id;
        this.emit('inspection-select', { id });
    }

    toggle(checkbox) {
        const ids = this.inspectionIdsIn(checkbox.closest('sl-tree-item'));
        this.setEnabled(ids, checkbox.checked);
        this.emit('inspections-toggle', { ids, enabled: checkbox.checked });
    }

    setEnabled(ids, enabled) {
        const update = enabled ? 'delete' : 'add';
        for (const id of ids) this.disabledIds[update](id);
        this.syncCheckboxes();
    }

    inspectionIdsIn(item) {
        if (item.dataset.inspectionId) return [item.dataset.inspectionId];
        const leaves = item.querySelectorAll('sl-tree-item[data-inspection-id]');
        return Array.from(leaves, leaf => leaf.dataset.inspectionId);
    }

    syncCheckboxes() {
        for (const leaf of this.leafItems)
            ownCheckbox(leaf).checked = !this.disabledIds.has(leaf.dataset.inspectionId);
        for (const group of this.groupItems) this.syncGroupCheckbox(group);
    }

    syncGroupCheckbox(group) {
        const ids = this.inspectionIdsIn(group);
        const enabledCount = ids.filter(id => !this.disabledIds.has(id)).length;
        const checkbox = ownCheckbox(group);
        checkbox.checked = enabledCount === ids.length;
        checkbox.indeterminate = enabledCount > 0 && enabledCount < ids.length;
    }

    render() {
        const search = element('search');
        const filter = element('sl-input');
        filter.type = 'search';
        filter.size = 'small';
        filter.placeholder = L`Filter inspections`;
        filter.setAttribute('aria-label', L`Filter inspections`);
        search.append(filter);
        const tree = element('sl-tree');
        tree.selection = 'leaf';
        tree.setAttribute('aria-label', L`Inspections`);
        this.replaceChildren(search, tree);
        this.renderTree();
    }

    renderTree() {
        const term = this.filter.value.trim().toLowerCase();
        const inspections = this.inspections.filter(item =>
            searchText(item).includes(term));
        this.selectedId = inspections.find(item => item.id === this.selectedId)?.id
            ?? inspections[0]?.id ?? null;
        this.tree.replaceChildren();
        const groups = new Map();
        for (const inspection of inspections)
            this.appendLeaf(groups, inspection, term);
        this.tree.hidden = !inspections.length;
        this.syncCheckboxes();
    }

    appendLeaf(groups, inspection, term) {
        const group = this.groupItem(groups, inspection.group, this.tree);
        const parent = inspection.subgroup
            ? this.groupItem(groups, inspection.subgroup, group)
            : group;
        const leaf = treeItem(inspection.title);
        leaf.dataset.inspectionId = inspection.id;
        leaf.selected = inspection.id === this.selectedId;
        parent.append(leaf);
        if (leaf.selected || term) expandAncestors(leaf);
    }

    groupItem(groups, title, parent) {
        const key = `${parent.dataset.group ?? ''}/${title}`;
        if (groups.has(key)) return groups.get(key);
        const group = treeItem(title);
        group.dataset.group = key;
        parent.append(group);
        groups.set(key, group);
        return group;
    }
}

customElements.define('cm-inspection-tree', InspectionTree);
