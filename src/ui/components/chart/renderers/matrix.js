import { categoryLabel } from '../categoryLabel.js';

const L = localize('statistics');

function totalLabel(integer) {
    if (integer) return L`Total`;
    return L`Overall`;
}

function appendHeader(table, data, totals) {
    const head = table.createTHead().insertRow();
    const headings = [data.rowLabel, ...data.columns.map(column => column.label)];
    if (totals) headings.push(data.measureLabel);
    appendHeadings(head, headings);
}

function appendHeadings(row, labels) {
    for (const label of labels) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = label;
        row.appendChild(cell);
    }
}

function cellMaximum(data) {
    let max = 1;
    for (const row of data.cells)
        for (const value of row) max = Math.max(max, Math.abs(value || 0));
    return max;
}

function appendValues(row, values, data, max) {
    for (const value of values) {
        const cell = row.insertCell();
        cell.textContent = data.formatValue(value);
        cell.style.setProperty('--cell-strength', String(
            0.04 + 0.24 * Math.abs(value || 0) / max
        ));
    }
}

function appendBody(table, data, totals) {
    const body = table.createTBody();
    const max = cellMaximum(data);
    data.rows.forEach((category, index) => {
        const row = body.insertRow();
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.setAttribute('aria-label', category.label);
        heading.appendChild(categoryLabel(category));
        row.appendChild(heading);
        appendValues(row, data.cells[index], data, max);
        if (totals)
            row.insertCell().textContent = data.formatValue(data.rowTotals[index]);
    });
}

function appendFooter(table, data, totals) {
    if (!totals) return;
    const row = table.createTFoot().insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = totalLabel(data.integer);
    row.appendChild(heading);
    for (const value of [...data.columnTotals, data.total])
        row.insertCell().textContent = data.formatValue(value);
}

function createTable(title) {
    const table = document.createElement('table');
    if (title) table.setAttribute('aria-label', title);
    return table;
}

export function createMatrix(data, { totals = true, title } = {}) {
    const table = createTable(title);
    appendHeader(table, data, totals);
    appendBody(table, data, totals);
    appendFooter(table, data, totals);
    return table;
}

export const matrixRenderer = {
    get label() { return L`Matrix`; },
    shape: 'matrix',
    create(container) {
        return {
            render(data, options) {
                container.replaceChildren(createMatrix(data, options.definition));
            }
        };
    }
};
