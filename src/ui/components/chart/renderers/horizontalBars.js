import { bindChartSelection } from '../chartSelection.js';
import { scaleLinear } from 'd3-scale';
import { categoryBackground } from '../categoryPaint.js';
import { createChartTooltip } from '../chartTooltip.js';

const L = localize('statistics');

function validateStackedRows(data) {
    for (const [i, cells] of data.cells.entries()) {
        const sum = cells.reduce((total, value) => total + (value || 0), 0);
        if (cells.some(value => value !== null && value < 0)
            || Math.abs(sum - (data.rowTotals[i] || 0)) > 1e-6) {
            throw new Error(L([
                'Stacked bars require nonnegative column values that '
                + 'sum to each row total.'
            ]));
        }
    }
}

function getSegments(data, index, stacked) {
    if (!stacked) {
        return [{
            start: 0, end: data.rowTotals[index] || 0, paint: data.rows[index]
        }];
    }
    let start = 0;
    const segments = data.columns.map((paint, column) => {
        const value = data.cells[index][column] || 0;
        const segment = {
            start, end: start + value, paint, column: paint.id, stacked: true
        };
        start += value;
        return segment;
    });
    return segments.filter(segment => segment.end > segment.start);
}

function createBar({ start, end, paint, stacked, column }, scale, row, activate) {
    const bar = document.createElement('span');
    bar.className = 'stats-ranking-bar';
    bar.classList.toggle('stats-ranking-segment', Boolean(stacked));
    bar.style.left = `${scale(Math.min(start, end))}%`;
    bar.style.width = `${Math.abs(scale(end) - scale(start))}%`;
    bar.style.background = categoryBackground(paint);
    if (paint.outline) bar.style.boxShadow = `inset 0 0 0 1px ${paint.outline}`;
    bindChartSelection(bar, { row: row.id, column }, activate,
                       `${row.label}, ${paint.label}: ${end - start}`);
    return bar;
}

function tooltipPosition(event, row) {
    if (event.type.startsWith('pointer')) return [event.clientX, event.clientY];
    const bounds = row.getBoundingClientRect();
    return [bounds.left + bounds.width / 2, bounds.top];
}

function bindTooltip(row, tooltip, title, values) {
    const show = event => tooltip.show(title, values, ...tooltipPosition(event, row));
    row.addEventListener('pointerenter', show);
    row.addEventListener('pointermove', show);
    row.addEventListener('focusin', show);
    row.addEventListener('pointerleave', tooltip.hide);
    row.addEventListener('focusout', tooltip.hide);
    row.addEventListener('keydown', event => {
        if (event.key === 'Escape') tooltip.hide();
    });
}

function createRankingRow(data, index, scale, definition, tooltip, activate) {
    const category = data.rows[index];
    const total = data.describeValue(data.rowTotals[index]);
    const breakdown = data.columns.map((column, j) => (
        L`${column.label}: ${data.formatValue(data.cells[index][j])}`
    )).join(', ');
    const row = document.createElement('div');
    row.className = 'stats-ranking-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'listitem');
    row.setAttribute('aria-describedby', tooltip.element.id);
    row.setAttribute('aria-label', L`${category.label}: ${total}` + '. ' + breakdown);
    const label = document.createElement('span');
    label.textContent = category.label;
    const track = document.createElement('span');
    track.className = 'stats-ranking-track';
    track.append(...getSegments(data, index, definition.stacked)
        .map(segment => createBar(segment, scale, category, activate)));
    const count = document.createElement('strong');
    count.textContent = data.formatValue(data.rowTotals[index]);
    row.append(label, track, count);
    bindChartSelection(count, { row: category.id }, activate,
                       `${category.label}: ${total}`);
    bindTooltip(row, tooltip, L`${category.label} — ${total}`, data.cells[index]);
    return row;
}

function populateRanking(ranking, data, definition, tooltip, activate) {
    if (!data.rows.length) {
        const message = document.createElement('p');
        message.textContent = L`No cards to plot in this scope.`;
        ranking.appendChild(message);
        return;
    }
    const values = data.rowTotals.filter(value => value !== null);
    const scale = scaleLinear([
        Math.min(0, ...values), Math.max(1, ...values)
    ], [0, 100]);
    ranking.append(...data.rows.map((_, i) => (
        createRankingRow(data, i, scale, definition, tooltip, activate)
    )));
}

export const horizontalBarRenderer = {
    get label() { return L`Bars`; },
    shape: 'matrix',
    validateData(data, definition) {
        if (definition.stacked) validateStackedRows(data);
    },
    create(container) {
        let tooltip;
        return {
            render(data, { definition, activate }) {
                tooltip?.dispose();
                const ranking = document.createElement('div');
                ranking.className = 'stats-ranking';
                ranking.setAttribute('role', 'list');
                container.replaceChildren(ranking);
                tooltip = createChartTooltip(container, data.columns,
                                             data.describeValue, { floating: true });
                populateRanking(ranking, data, definition, tooltip, activate);
            },
            dispose() { tooltip?.dispose(); }
        };
    }
};
