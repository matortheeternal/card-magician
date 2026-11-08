import { categoryLabel } from '../categoryLabel.js';

export function createMatrix(data, { totals = true, title } = {}) {
    const table = document.createElement('table');
    if (title) table.setAttribute('aria-label', title);
    const head = table.createTHead().insertRow();
    const headings = [data.rowLabel, ...data.columns.map(column => column.label)];
    if (totals) headings.push(data.measureLabel);
    for (const label of headings) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = label;
        head.appendChild(cell);
    }
    const body = table.createTBody();
    let max = 1;
    for (const row of data.cells)
        for (const value of row) max = Math.max(max, Math.abs(value || 0));
    data.rows.forEach((category, i) => {
        const row = body.insertRow();
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.setAttribute('aria-label', category.label);
        heading.appendChild(categoryLabel(category));
        row.appendChild(heading);
        data.cells[i].forEach(value => {
            const cell = row.insertCell();
            cell.textContent = data.formatValue(value);
            cell.style.setProperty('--cell-strength', String(
                0.04 + 0.24 * Math.abs(value || 0) / max
            ));
        });
        if (totals) row.insertCell().textContent = data.formatValue(data.rowTotals[i]);
    });
    if (totals) {
        const row = table.createTFoot().insertRow();
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.textContent = data.integer ? 'Total' : 'Overall';
        row.appendChild(heading);
        for (const value of [...data.columnTotals, data.total])
            row.insertCell().textContent = data.formatValue(value);
    }
    return table;
}

export const matrixRenderer = {
    label: 'Matrix', shape: 'matrix',
    create(container) {
        return {
            render(data, options) {
                container.replaceChildren(createMatrix(data, options.definition));
            }
        };
    }
};
