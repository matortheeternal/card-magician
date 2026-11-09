import { bindChartSelection } from '../chartSelection.js';
import { categoryLabel } from '../categoryLabel.js';
import { formatPercentage } from '../formatPercentage.js';

const L = localize('statistics');

function appendHeader(table, data) {
    const row = table.createTHead().insertRow();
    for (const label of [data.rowLabel, data.measureLabel, L`Percentage`]) {
        const heading = document.createElement('th');
        heading.scope = 'col';
        heading.textContent = label;
        row.appendChild(heading);
    }
}

function appendRow(body, data, index, activate) {
    const category = data.rows[index];
    const count = data.rowTotals[index];
    const row = body.insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.appendChild(categoryLabel(category));
    row.appendChild(heading);
    row.insertCell().textContent = data.formatValue(count);
    row.insertCell().textContent = formatPercentage(count, data.total);
    bindChartSelection(row, { row: category.id }, activate,
                       `${category.label}: ${data.formatValue(count)}`);
}

function createDistribution(data, activate) {
    const table = document.createElement('table');
    appendHeader(table, data);
    const body = table.createTBody();
    data.rows.forEach((_, index) => appendRow(body, data, index, activate));
    return table;
}

export const distributionRenderer = {
    get label() { return L`Distribution`; },
    shape: 'matrix',
    validateDefinition(definition) {
        if (definition.measure !== 'card-count')
            throw new Error(L`Distribution requires the card-count measure`);
    },
    create(container) {
        return {
            render(data, { activate }) {
                container.replaceChildren(createDistribution(data, activate));
            }
        };
    }
};
