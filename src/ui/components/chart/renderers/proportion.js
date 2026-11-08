import { categoryLabel } from '../categoryLabel.js';

const L = localize('statistics');
const percentage = new Intl.NumberFormat(undefined, {
    style: 'percent', maximumFractionDigits: 1
});

function formatPercentage(count, total) {
    if (!total) return '—';
    return percentage.format(count / total);
}

function numeratorIndex(data, definition) {
    const index = data.columns.findIndex(column => column.id === definition.numerator);
    if (index < 0)
        throw new Error(L`Unknown proportion category: ${definition.numerator}`);
    return index;
}

function createSummary(data, index) {
    const count = data.columnTotals[index];
    const summary = document.createElement('div');
    summary.className = 'stats-proportion-summary';
    const value = document.createElement('strong');
    value.dataset.proportionPercentage = '';
    value.textContent = formatPercentage(count, data.total);
    value.setAttribute('aria-label', L`Percentage: ${value.textContent}`);
    const detail = document.createElement('span');
    detail.dataset.proportionCount = '';
    detail.textContent = L`${data.formatValue(count)} of ${data.formatValue(data.total)}`;
    summary.append(value, detail);
    return summary;
}

function createHeader(table, data, index) {
    const row = table.createTHead().insertRow();
    const labels = [
        data.rowLabel, data.columns[index].label, data.measureLabel, L`Percentage`
    ];
    for (const label of labels) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = label;
        row.appendChild(cell);
    }
}

function appendRow(body, data, category, rowIndex, columnIndex) {
    const row = body.insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.appendChild(categoryLabel(category));
    row.appendChild(heading);
    const count = data.cells[rowIndex][columnIndex];
    const total = data.rowTotals[rowIndex];
    const values = [
        data.formatValue(count), data.formatValue(total), formatPercentage(count, total)
    ];
    for (const value of values) row.insertCell().textContent = value;
}

function createBreakdown(data, index) {
    const table = document.createElement('table');
    createHeader(table, data, index);
    const body = table.createTBody();
    data.rows.forEach((category, row) => appendRow(body, data, category, row, index));
    return table;
}

export const proportionRenderer = {
    get label() { return L`Proportion`; },
    shape: 'matrix',
    create(container) {
        return {
            render(data, { definition }) {
                const index = numeratorIndex(data, definition);
                container.replaceChildren(createSummary(data, index));
                if (definition.breakdown)
                    container.appendChild(createBreakdown(data, index));
            }
        };
    }
};
