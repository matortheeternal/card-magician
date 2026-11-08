import { scaleLinear } from 'd3-scale';

export const horizontalBarRenderer = {
    label: 'Bars', shape: 'matrix',
    create(container) {
        return {
            render(data) {
                const ranking = document.createElement('div');
                ranking.className = 'stats-ranking';
                ranking.setAttribute('role', 'list');
                const values = data.rowTotals.filter(value => value !== null);
                const scale = scaleLinear([
                    Math.min(0, ...values), Math.max(1, ...values)
                ], [0, 100]);
                data.rows.forEach((category, i) => {
                    const tooltip = document.createElement('sl-tooltip');
                    tooltip.content = `${category.label}: `
                        + data.describeValue(data.rowTotals[i]) + '. '
                        + data.columns.map((column, j) => (
                            `${column.label}: ${data.formatValue(data.cells[i][j])}`
                        )).join(', ');
                    const row = document.createElement('div');
                    row.className = 'stats-ranking-row';
                    row.tabIndex = 0;
                    row.setAttribute('role', 'listitem');
                    row.setAttribute('aria-label', tooltip.content);
                    const label = document.createElement('span');
                    label.textContent = category.label;
                    const track = document.createElement('span');
                    track.className = 'stats-ranking-track';
                    track.setAttribute('aria-hidden', 'true');
                    const bar = document.createElement('span');
                    bar.className = 'stats-ranking-bar';
                    const value = data.rowTotals[i] || 0;
                    bar.style.left = `${scale(Math.min(0, value))}%`;
                    bar.style.width = `${Math.abs(scale(value) - scale(0))}%`;
                    bar.style.backgroundColor = category.color
                        || 'var(--sl-color-primary-600)';
                    track.appendChild(bar);
                    const count = document.createElement('strong');
                    count.textContent = data.formatValue(data.rowTotals[i]);
                    row.append(label, track, count);
                    tooltip.appendChild(row);
                    ranking.appendChild(tooltip);
                });
                if (!data.rows.length) {
                    const message = document.createElement('p');
                    message.textContent = 'No cards to plot in this scope.';
                    ranking.appendChild(message);
                }
                container.replaceChildren(ranking);
            }
        };
    }
};
