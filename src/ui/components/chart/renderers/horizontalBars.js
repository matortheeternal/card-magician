import { scaleLinear } from 'd3-scale';
import { categoryBackground } from '../categoryPaint.js';
import { createChartTooltip } from '../chartTooltip.js';

export const horizontalBarRenderer = {
    label: 'Bars', shape: 'matrix',
    create(container) {
        let tooltip;
        return {
            render(data, { definition }) {
                tooltip?.dispose();
                const ranking = document.createElement('div');
                ranking.className = 'stats-ranking';
                ranking.setAttribute('role', 'list');
                const values = data.rowTotals.filter(value => value !== null);
                const scale = scaleLinear([
                    Math.min(0, ...values), Math.max(1, ...values)
                ], [0, 100]);
                if (definition.stacked) {
                    data.cells.forEach((cells, i) => {
                        const sum = cells.reduce((total, value) => total + (value || 0), 0);
                        if (cells.some(value => value !== null && value < 0)
                            || Math.abs(sum - (data.rowTotals[i] || 0)) > 1e-6) {
                            throw new Error('Stacked bars require nonnegative column '
                                + 'values that sum to each row total.');
                        }
                    });
                }
                container.replaceChildren(ranking);
                tooltip = createChartTooltip(container, data.columns,
                                             data.describeValue, { floating: true });
                data.rows.forEach((category, i) => {
                    const row = document.createElement('div');
                    row.className = 'stats-ranking-row';
                    row.tabIndex = 0;
                    row.setAttribute('role', 'listitem');
                    row.setAttribute('aria-describedby', tooltip.element.id);
                    row.setAttribute('aria-label', `${category.label}: `
                        + data.describeValue(data.rowTotals[i]) + '. '
                        + data.columns.map((column, j) => (
                            `${column.label}: ${data.formatValue(data.cells[i][j])}`
                        )).join(', '));
                    const label = document.createElement('span');
                    label.textContent = category.label;
                    const track = document.createElement('span');
                    track.className = 'stats-ranking-track';
                    track.setAttribute('aria-hidden', 'true');
                    const appendBar = (start, end, paint, segment) => {
                        const bar = document.createElement('span');
                        bar.className = 'stats-ranking-bar';
                        if (segment) bar.classList.add('stats-ranking-segment');
                        bar.style.left = `${scale(Math.min(start, end))}%`;
                        bar.style.width = `${Math.abs(scale(end) - scale(start))}%`;
                        bar.style.background = categoryBackground(paint);
                        if (paint.outline)
                            bar.style.boxShadow = `inset 0 0 0 1px ${paint.outline}`;
                        track.appendChild(bar);
                    };
                    if (definition.stacked) {
                        let start = 0;
                        data.columns.forEach((column, j) => {
                            const value = data.cells[i][j] || 0;
                            if (value > 0) appendBar(start, start + value, column, true);
                            start += value;
                        });
                    } else {appendBar(0, data.rowTotals[i] || 0, category, false);}
                    const count = document.createElement('strong');
                    count.textContent = data.formatValue(data.rowTotals[i]);
                    row.append(label, track, count);
                    const show = event => {
                        const bounds = row.getBoundingClientRect();
                        const pointer = event.type.startsWith('pointer');
                        tooltip.show(`${category.label} — `
                            + data.describeValue(data.rowTotals[i]), data.cells[i],
                                     pointer ? event.clientX : bounds.left + bounds.width / 2,
                                     pointer ? event.clientY : bounds.top);
                    };
                    row.addEventListener('pointerenter', show);
                    row.addEventListener('pointermove', show);
                    row.addEventListener('focus', show);
                    row.addEventListener('pointerleave', tooltip.hide);
                    row.addEventListener('blur', tooltip.hide);
                    row.addEventListener('keydown', event => {
                        if (event.key === 'Escape') tooltip.hide();
                    });
                    ranking.appendChild(row);
                });
                if (!data.rows.length) {
                    const message = document.createElement('p');
                    message.textContent = 'No cards to plot in this scope.';
                    ranking.appendChild(message);
                }
            },
            dispose() { tooltip?.dispose(); }
        };
    }
};
