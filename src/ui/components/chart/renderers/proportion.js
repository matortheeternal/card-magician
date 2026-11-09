import { appendSelectionValue, bindChartSelection } from '../chartSelection.js';
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

function createSummary(data, index, activate) {
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
    bindChartSelection(value, { column: data.columns[index].id }, activate,
                       `${data.columns[index].label}: ${value.textContent}`);
    bindChartSelection(detail, {}, activate, detail.textContent);
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

function appendRow(body, data, category, rowIndex, columnIndex, activate) {
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
    const selections = [
        { row: category.id, column: data.columns[columnIndex].id },
        { row: category.id },
        { row: category.id, column: data.columns[columnIndex].id }
    ];
    values.forEach((value, index) => appendSelectionValue(
        row.insertCell(), value, selections[index], activate, category.label
    ));
}

function createBreakdown(data, index, activate) {
    const table = document.createElement('table');
    createHeader(table, data, index);
    const body = table.createTBody();
    data.rows.forEach((category, row) => {
        appendRow(body, data, category, row, index, activate);
    });
    return table;
}

export const proportionRenderer = {
    get label() { return L`Proportion`; },
    shape: 'matrix',
    validateDefinition(definition) {
        if (definition.numerator === undefined)
            throw new Error(L`Proportion requires a numerator category`);
        if (definition.measure !== 'card-count')
            throw new Error(L`Proportion requires the card-count measure`);
    },
    validateData(data, definition) {
        numeratorIndex(data, definition);
    },
    create(container) {
        return {
            render(data, { definition, activate }) {
                const index = numeratorIndex(data, definition);
                container.replaceChildren(createSummary(data, index, activate));
                if (definition.breakdown)
                    container.appendChild(createBreakdown(data, index, activate));
            }
        };
    }
};
