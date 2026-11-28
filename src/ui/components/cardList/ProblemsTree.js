const L = localize('card-list');

function item(label) {
    const node = document.createElement('sl-tree-item');
    const text = document.createElement('span');
    text.textContent = label;
    node.append(text);
    return node;
}

function updateCardLabel(row, card) {
    const label = row.querySelector(':scope > span');
    label.textContent = card.name || L`Unnamed card`;
    const icons = window.activeGame?.symbols?.cardColorIcons?.(card) ?? [];
    const previous = [...row.querySelectorAll(':scope > img')];
    const sameIcons = previous.length === icons.length
        && previous.every((icon, index) => icon.getAttribute('src') === icons[index]);
    if (sameIcons) return;
    for (const icon of previous) icon.remove();
    for (const src of icons) {
        const icon = document.createElement('img');
        icon.src = src;
        icon.alt = '';
        label.before(icon);
    }
}

function findingsByType(findings) {
    const byType = new Map();
    for (const finding of findings) {
        const { inspectionId } = finding;
        if (!byType.has(inspectionId)) byType.set(inspectionId, []);
        byType.get(inspectionId).push(finding);
    }
    return byType;
}

function activateRow(node, action) {
    node.addEventListener('click', event => {
        if (event.target.closest('sl-tree-item') !== node) return;
        const disclosure = event.composedPath().some(part =>
            part.part?.contains('expand-button'));
        if (!disclosure) action();
    });
    node.addEventListener('keydown', event => {
        if (event.target !== node) return;
        if (event.key === 'Enter' || event.key === ' ') action();
    });
}

function findingItem(finding, card, open) {
    const { message } = finding;
    const label = finding.side === 'back' ? L`Back — ${message}` : message;
    const node = item(label);
    node.classList.add('problem-finding');
    activateRow(node, () => open(node, { ...finding, card }));
    return node;
}

export default class ProblemsTree {
    #types = new Map();
    #cardTypes = new Map();
    #sections = new Map();

    constructor(tree, { openFinding, openCard, openInspection }) {
        this.tree = tree;
        this.openFinding = openFinding;
        this.openCard = openCard;
        this.openInspection = openInspection;
    }

    clear() {
        this.#types.clear();
        this.#sections.clear();
        this.#cardTypes.clear();
        for (const node of this.tree.querySelectorAll(':scope > sl-tree-item'))
            node.remove();
    }

    section(path, parent, title) {
        const key = JSON.stringify(path);
        if (this.#sections.has(key)) return this.#sections.get(key);
        const node = item(title);
        node.dataset.section = key;
        node.expanded = true;
        parent.append(node);
        this.#sections.set(key, node);
        return node;
    }

    sectionFor(id) {
        const inspection = window.activeGame?.inspections.find(item => item.id === id);
        if (!inspection) return this.tree;
        const { category, group, subgroup } = inspection;
        const path = [category, group, subgroup].filter(Boolean);
        let parent = this.tree;
        for (const [index, title] of path.entries())
            parent = this.section(path.slice(0, index + 1), parent, title);
        return parent;
    }

    typeGroup(id, title) {
        if (!this.#types.has(id)) {
            const node = item(title);
            node.classList.add('problem-type');
            activateRow(node, () => this.openInspection(id));
            node.expanded = true;
            this.sectionFor(id).append(node);
            this.#types.set(id, { node, cards: new Map() });
        }
        return this.#types.get(id);
    }

    removeCardType(card, id) {
        const group = this.#types.get(id);
        group.cards.get(card)?.row.remove();
        group.cards.delete(card);
        if (group.cards.size) return;
        const parent = group.node.parentElement;
        group.node.remove();
        this.pruneSections(parent);
        this.#types.delete(id);
    }

    pruneSections(section) {
        let node = section;
        while (node.dataset.section && node.childElementCount === 1) {
            const parent = node.parentElement;
            this.#sections.delete(node.dataset.section);
            node.remove();
            node = parent;
        }
    }

    setCard(card, findings) {
        const byType = findingsByType(findings);
        const stale = (this.#cardTypes.get(card) ?? []).filter(id => !byType.has(id));
        for (const id of stale) this.removeCardType(card, id);
        this.#cardTypes.delete(card);
        if (!byType.size) return;
        this.#cardTypes.set(card, [...byType.keys()]);
        for (const [id, matches] of byType)
            this.setCardGroup(card, id, matches);
    }

    cardGroup(group, card) {
        if (!group.cards.has(card)) {
            const row = item('');
            row.classList.add('problem-card');
            row.expanded = true;
            activateRow(row, () => this.openCard(card));
            group.node.append(row);
            group.cards.set(card, { row, findings: new Map() });
        }
        return group.cards.get(card);
    }

    setCardGroup(card, id, matches) {
        const group = this.typeGroup(id, matches[0].title);
        const entry = this.cardGroup(group, card);
        updateCardLabel(entry.row, card);
        const keys = new Set(matches.map(finding => finding.key));
        for (const [key, previous] of entry.findings) {
            if (keys.has(key)) continue;
            previous.node.remove();
            entry.findings.delete(key);
        }
        let next = null;
        for (const finding of [...matches].reverse())
            next = this.setFinding(entry, card, finding, next);
    }

    setFinding(entry, card, finding, next) {
        const signature = JSON.stringify(finding);
        const previous = entry.findings.get(finding.key);
        if (previous?.signature === signature) return previous.node;
        const node = findingItem(finding, card, this.openFinding);
        if (previous?.node.selected) node.selected = true;
        if (previous) previous.node.replaceWith(node);
        if (!previous) entry.row.insertBefore(node, next);
        entry.findings.set(finding.key, { signature, node });
        return node;
    }
}
