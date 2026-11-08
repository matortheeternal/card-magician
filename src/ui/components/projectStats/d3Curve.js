import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

let tooltipId = 0;

export function renderD3Curve(container, { labels, series, type, width, colorSymbol }) {
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 48, left: 50 };
    const bottom = height - margin.bottom;
    const x = scaleBand(labels, [margin.left, width - margin.right]).padding(0.2);
    const y = scaleLinear([0, Math.max(1, ...series.flatMap(item => item.values))], [bottom, margin.top]).nice();
    const svg = select(container).append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'img').attr('aria-label', 'Card counts by mana value and color');
    svg.append('title').text('Card counts by mana value and color');
    for (const tick of y.ticks(6).filter(Number.isInteger)) {
        svg.append('line').attr('class', 'stats-gridline')
            .attr('x1', margin.left).attr('x2', width - margin.right)
            .attr('y1', y(tick)).attr('y2', y(tick));
        svg.append('text').attr('class', 'stats-axis-tick').attr('text-anchor', 'end')
            .attr('x', margin.left - 10).attr('y', y(tick) + 4).text(tick);
    }
    labels.forEach(label => {
        svg.append('text').attr('class', 'stats-axis-tick').attr('text-anchor', 'middle')
            .attr('x', x(label) + x.bandwidth() / 2).attr('y', bottom + 22).text(label);
    });
    svg.append('text').attr('class', 'stats-axis-label').attr('text-anchor', 'middle')
        .attr('x', (margin.left + width - margin.right) / 2).attr('y', height - 5).text('Mana value (CMC)');
    svg.append('text').attr('class', 'stats-axis-label').attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle').attr('x', -(margin.top + bottom) / 2).attr('y', 13).text('Cards');
    const subX = scaleBand(series.map(item => item.id), [0, x.bandwidth()]).padding(0.08);
    for (const item of series) {
        const points = item.values.map((value, i) => ({ label: labels[i], value }));
        const group = svg.append('g').attr('fill', item.color);
        if (type === 'line') {
            group.append('path').attr('fill', 'none').attr('stroke', item.color)
                .attr('stroke-width', 2)
                .attr('d', line().x(point => x(point.label) + x.bandwidth() / 2).y(point => y(point.value))(points));
        }
        for (const point of points) {
            const mark = type === 'bar'
                ? group.append('rect').attr('x', x(point.label) + subX(item.id))
                    .attr('y', y(point.value)).attr('width', subX.bandwidth())
                    .attr('height', bottom - y(point.value))
                : group.append('circle').attr('cx', x(point.label) + x.bandwidth() / 2)
                    .attr('cy', y(point.value)).attr('r', 3.5);
            mark.attr('data-mana-index', labels.indexOf(point.label));
        }
    }

    const tooltip = document.createElement('div');
    tooltip.id = `stats-curve-tooltip-${++tooltipId}`;
    tooltip.className = 'stats-chart-tooltip';
    tooltip.role = 'tooltip';
    tooltip.hidden = true;
    container.appendChild(tooltip);
    const heading = document.createElement('strong');
    tooltip.appendChild(heading);
    const rows = series.map(item => {
        const row = document.createElement('div');
        row.className = 'stats-tooltip-row';
        row.style.setProperty('--series-color', item.color);
        if (colorSymbol) row.appendChild(colorSymbol(item));
        const label = document.createElement('span');
        label.textContent = item.label;
        const count = document.createElement('strong');
        row.append(label, count);
        tooltip.appendChild(row);
        return count;
    });
    const guide = svg.append('line').attr('class', 'stats-hover-guide')
        .attr('y1', margin.top).attr('y2', bottom).attr('visibility', 'hidden');
    const hide = () => {
        tooltip.hidden = true;
        guide.attr('visibility', 'hidden');
    };
    const show = index => {
        heading.textContent = `Mana value ${labels[index]}`;
        rows.forEach((count, i) => {
            const value = series[i].values[index];
            count.textContent = `${value} ${value === 1 ? 'card' : 'cards'}`;
        });
        tooltip.hidden = false;
        const center = x(labels[index]) + x.bandwidth() / 2;
        guide.attr('x1', center).attr('x2', center).attr('visibility', 'visible');
        const bounds = svg.node().getBoundingClientRect();
        const chartBounds = container.getBoundingClientRect();
        const anchor = bounds.left - chartBounds.left + center * bounds.width / width;
        const left = Math.max(0, Math.min(
            container.clientWidth - tooltip.offsetWidth, anchor - tooltip.offsetWidth / 2
        ));
        tooltip.style.left = `${left}px`;
        tooltip.style.top = '8px';
    };
    labels.forEach((label, index) => {
        const center = x(label) + x.bandwidth() / 2;
        const left = index === 0 ? margin.left : center - x.step() / 2;
        const right = index === labels.length - 1
            ? width - margin.right : center + x.step() / 2;
        const description = `Mana value ${label}. ` + series.map(item => (
            `${item.label}: ${item.values[index]} cards`
        )).join(', ');
        svg.append('rect').attr('class', 'stats-hit-region')
            .attr('x', left).attr('y', margin.top)
            .attr('width', right - left).attr('height', bottom - margin.top)
            .attr('fill', 'transparent').attr('tabindex', 0)
            .attr('aria-label', description).attr('aria-describedby', tooltip.id)
            .on('pointerenter pointermove focus', () => show(index))
            .on('blur', hide)
            .on('keydown', event => {
                if (event.key === 'Escape') hide();
            });
    });
    svg.on('pointerleave', hide).on('pointermove', event => {
        if (!event.target.classList.contains('stats-hit-region')) hide();
    });
}
