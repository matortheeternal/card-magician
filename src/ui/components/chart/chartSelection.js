const L = localize('statistics');
const TABLE_ELEMENTS = new Set(['TD', 'TH', 'TR']);

function setSelectionRole(element) {
    if (TABLE_ELEMENTS.has(element.tagName) || element.hasAttribute('role')) return;
    element.setAttribute('role', 'button');
}

export function bindChartSelection(element, selection, activate, label) {
    if (!activate) return;
    setSelectionRole(element);
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-label', L`Show cards: ${label}`);
    element.dataset.chartSelection = '';
    element.addEventListener('click', event => {
        event.stopPropagation();
        activate(selection);
    });
    element.addEventListener('keydown', event => {
        if (event.target !== element || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        activate(selection);
    });
}

export function setSelectionValue(cell, value, selection, activate, label) {
    cell.textContent = value;
    bindChartSelection(cell, selection, activate, `${label}: ${value}`);
}

export function chartSelectionLabel(data, selection) {
    const labels = [];
    for (const [key, categories] of [['row', data.rows], ['column', data.columns]]) {
        if (selection[key] === undefined) continue;
        const category = categories.find(category => category.id === selection[key]);
        labels.push(category?.label ?? String(selection[key]));
    }
    return labels.join(' × ') || L`All cards`;
}
