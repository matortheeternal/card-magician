import { bindChartSelection, setSelectionValue } from '../chartSelection.js';
import { categoryLabel } from '../categoryLabel.js';

const L = localize('statistics');

function totalLabel(integer) {
    if (integer) return L`Total`;
    return L`Overall`;
}

function appendHeading(row, label, selection, activate) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    bindChartSelection(cell, selection, activate, label);
    row.appendChild(cell);
}

function appendHeader(table, data, totals, activate) {
    const head = table.createTHead().insertRow();
    appendHeading(head, data.rowLabel, {}, activate);
    for (const column of data.columns)
        appendHeading(head, column.label, { column: column.id }, activate);
    if (totals) appendHeading(head, data.measureLabel, {}, activate);
}

function cellMaximum(data) {
    let max = 1;
    for (const row of data.cells)
        for (const value of row) max = Math.max(max, Math.abs(value || 0));
    return max;
}

function appendValues(row, values, data, max, category, activate) {
    for (const [index, value] of values.entries()) {
        const cell = row.insertCell();
        const column = data.columns[index];
        setSelectionValue(cell, data.formatValue(value), {
            row: category.id, column: column.id
        }, activate, `${category.label}, ${column.label}`);
        cell.style.setProperty('--cell-strength', String(
            0.04 + 0.24 * Math.abs(value || 0) / max
        ));
    }
}

function appendBody(table, data, totals, activate) {
    const body = table.createTBody();
    const max = cellMaximum(data);
    data.rows.forEach((category, index) => {
        const row = body.insertRow();
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.setAttribute('aria-label', category.label);
        heading.appendChild(categoryLabel(category));
        bindChartSelection(heading, { row: category.id }, activate, category.label);
        row.appendChild(heading);
        appendValues(row, data.cells[index], data, max, category, activate);
        if (totals) {
            setSelectionValue(
                row.insertCell(), data.formatValue(data.rowTotals[index]),
                { row: category.id }, activate, category.label
            );
        }
    });
}

function appendFooter(table, data, totals, activate) {
    if (!totals) return;
    const row = table.createTFoot().insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = totalLabel(data.integer);
    bindChartSelection(heading, {}, activate, heading.textContent);
    row.appendChild(heading);
    for (const [index, column] of data.columns.entries()) {
        setSelectionValue(
            row.insertCell(), data.formatValue(data.columnTotals[index]),
            { column: column.id }, activate, column.label
        );
    }
    setSelectionValue(row.insertCell(), data.formatValue(data.total), {},
                      activate, totalLabel(data.integer));
}

function createTable(title) {
    const table = document.createElement('table');
    if (title) table.setAttribute('aria-label', title);
    return table;
}

export function createMatrix(data, { totals = true, title, activate } = {}) {
    const table = createTable(title);
    appendHeader(table, data, totals, activate);
    appendBody(table, data, totals, activate);
    appendFooter(table, data, totals, activate);
    return table;
}

export const matrixRenderer = {
    get label() { return L`Matrix`; },
    shape: 'matrix',
    create(container) {
        return {
            render(data, options) {
                container.replaceChildren(createMatrix(data, {
                    ...options.definition, activate: options.activate
                }));
            }
        };
    }
};
