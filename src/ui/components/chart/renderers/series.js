import { bindChartSelection } from '../chartSelection.js';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { svgCategoryPaint } from '../categoryPaint.js';
import { createChartTooltip, chartTooltipPosition } from '../chartTooltip.js';

const L = localize('statistics');

let nextChart = 0;

function appendLine(group, points, color, { type, x, y }) {
    if (type !== 'line') return;
    group.append('path').attr('fill', 'none').attr('stroke', color)
        .attr('stroke-width', 2).attr('pointer-events', 'none')
        .attr('d', line().defined(point => point.value !== null)
            .x(point => x(point.index) + x.bandwidth() / 2)
            .y(point => y(point.value))(points));
}

function appendMark(group, point, seriesId, { type, x, y, subX }) {
    if (type === 'bar') {
        return group.append('rect')
            .attr('x', x(point.index) + subX(seriesId))
            .attr('y', y(Math.max(0, point.value)))
            .attr('width', subX.bandwidth())
            .attr('height', Math.abs(y(0) - y(point.value)));
    }
    return group.append('circle').attr('cx', x(point.index) + x.bandwidth() / 2)
        .attr('cy', y(point.value)).attr('r', 3.5);
}

function applyOutline(mark, outline) {
    if (!outline) return;
    mark.attr('stroke', outline).attr('stroke-width', 1);
}

function renderSeries(svg, series, chartId, scales, columns, activate, show) {
    for (const [i, item] of series.entries()) {
        const points = item.values.map((value, index) => ({ index, value }));
        const color = svgCategoryPaint(svg.node(), item, `stats-${chartId}-paint-${i}`);
        const group = svg.append('g').attr('fill', color);
        appendLine(group, points, color, scales);
        for (const point of points.filter(item => item.value !== null)) {
            const mark = appendMark(group, point, item.id, scales);
            mark.attr('data-category-index', point.index);
            applyOutline(mark, item.outline);
            bindChartSelection(mark.node(), {
                row: item.id, column: columns[point.index].id
            }, activate, `${item.label}, ${columns[point.index].label}: `
                + scales.formatValue(point.value));
            mark.on('pointerenter pointermove focus', event => show(point.index, event))
                .on('blur', () => svg.dispatch('pointerleave'))
                .on('keydown', event => {
                    if (event.key === 'Escape') svg.dispatch('pointerleave');
                });
        }
    }
}

function regionBoundary(index, count, x, start, end) {
    if (index === 0) return start;
    if (index === count) return end;
    return x(index) + x.bandwidth() / 2 - x.step() / 2;
}

export function renderD3Curve(container, {
    rows, columns, cells, type, width, columnLabel, measureLabel,
    integer, formatValue, describeValue, title, activate
}) {
    const labels = columns.map(column => column.label);
    const series = rows.map((row, i) => ({ ...row, values: cells[i] }));
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 48, left: 50 };
    const bottom = height - margin.bottom;
    const x = scaleBand(labels.map((_, i) => i),
                        [margin.left, width - margin.right]).padding(0.2);
    const values = series.flatMap(item => item.values).filter(value => value !== null);
    const y = scaleLinear([
        Math.min(0, ...values), Math.max(1, ...values)
    ], [bottom, margin.top]).nice();
    const svg = select(container).append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'group').attr('aria-label', title || measureLabel);
    const chartId = ++nextChart;
    for (const tick of y.ticks(6).filter(value => !integer || Number.isInteger(value))) {
        svg.append('line').attr('class', 'stats-gridline')
            .attr('x1', margin.left).attr('x2', width - margin.right)
            .attr('y1', y(tick)).attr('y2', y(tick));
        svg.append('text').attr('class', 'stats-axis-tick').attr('text-anchor', 'end')
            .attr('x', margin.left - 10).attr('y', y(tick) + 4).text(formatValue(tick));
    }
    labels.forEach((label, i) => {
        svg.append('text').attr('class', 'stats-axis-tick').attr('text-anchor', 'middle')
            .attr('x', x(i) + x.bandwidth() / 2).attr('y', bottom + 22).text(label);
    });
    svg.append('text').attr('class', 'stats-axis-label').attr('text-anchor', 'middle')
        .attr('x', (margin.left + width - margin.right) / 2)
        .attr('y', height - 5).text(columnLabel);
    svg.append('text').attr('class', 'stats-axis-label').attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle').attr('x', -(margin.top + bottom) / 2)
        .attr('y', 13).text(measureLabel);
    const subX = scaleBand(series.map(item => item.id), [0, x.bandwidth()]).padding(0.08);

    const tooltip = createChartTooltip(container, series, describeValue, {
        floating: true
    });
    const guide = svg.append('line').attr('class', 'stats-hover-guide')
        .attr('y1', margin.top).attr('y2', bottom).attr('visibility', 'hidden');
    const hide = () => {
        tooltip.hide();
        guide.attr('visibility', 'hidden');
    };
    const show = (index, event) => {
        const center = x(index) + x.bandwidth() / 2;
        guide.attr('x1', center).attr('x2', center).attr('visibility', 'visible');
        tooltip.show(L`${columnLabel} ${labels[index]}`,
                     series.map(item => item.values[index]),
                     ...chartTooltipPosition(event));
    };
    labels.forEach((label, index) => {
        const left = regionBoundary(index, labels.length, x,
                                    margin.left, width - margin.right);
        const right = regionBoundary(index + 1, labels.length, x,
                                     margin.left, width - margin.right);
        const description = L`${columnLabel} ${label}` + '. ' + series.map(item => (
            L`${item.label}: ${describeValue(item.values[index])}`
        )).join(', ');
        svg.append('rect').attr('class', 'stats-hit-region')
            .attr('x', left).attr('y', margin.top)
            .attr('width', right - left).attr('height', bottom - margin.top)
            .attr('fill', 'transparent').attr('tabindex', 0)
            .attr('aria-label', description)
            .attr('aria-describedby', tooltip.element.id)
            .on('pointerenter pointermove focus', event => show(index, event))
            .on('blur', hide)
            .on('keydown', event => {
                if (event.key === 'Escape') hide();
            });
    });
    renderSeries(svg, series, chartId, {
        type, x, y, subX, formatValue
    }, columns, activate, show);
    svg.on('pointerleave', hide).on('pointermove', event => {
        if (!event.target.classList.contains('stats-hit-region')
            && !event.target.hasAttribute('data-category-index')) hide();
    });
    return () => tooltip.dispose();
}
