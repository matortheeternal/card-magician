const L = localize('statistics');

export function bindChartSelection(element, selection, activate, label) {
    if (!activate) return;
    element.setAttribute('role', 'button');
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

export function appendSelectionValue(cell, value, selection, activate, label) {
    if (!activate) {
        cell.textContent = value;
        return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = value;
    button.setAttribute('aria-label', L`Show cards: ${label}: ${value}`);
    button.dataset.chartSelection = '';
    button.addEventListener('click', () => activate(selection));
    cell.appendChild(button);
}
