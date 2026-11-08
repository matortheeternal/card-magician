import { categorySymbol } from './categoryLabel.js';

let nextTooltip = 0;

function watchScroll(floating, hide, signal) {
    if (!floating) return;
    document.addEventListener('scroll', hide, { capture: true, signal });
}

function tooltipCoordinates(element, container, floating, x, y) {
    if (!floating) {
        return {
            left: Math.max(0, Math.min(container.clientWidth - element.offsetWidth,
                                       x - element.offsetWidth / 2)),
            top: y
        };
    }
    return {
        left: Math.max(8, Math.min(window.innerWidth - element.offsetWidth - 8, x + 12)),
        top: Math.max(8, Math.min(y + 12, window.innerHeight - element.offsetHeight - 8))
    };
}

export function createChartTooltip(container, categories, describeValue, {
    floating = false
} = {}) {
    const element = document.createElement('div');
    element.id = `stats-chart-tooltip-${++nextTooltip}`;
    element.className = 'stats-chart-tooltip';
    element.classList.toggle('stats-chart-tooltip-floating', floating);
    element.role = 'tooltip';
    element.hidden = true;
    const heading = document.createElement('strong');
    element.appendChild(heading);
    const rows = categories.map(category => {
        const row = document.createElement('div');
        row.className = 'stats-tooltip-row';
        row.style.setProperty('--series-color', category.color
            || 'var(--sl-color-primary-600)');
        const label = document.createElement('span');
        label.textContent = category.label;
        const count = document.createElement('strong');
        row.append(categorySymbol(category), label, count);
        element.appendChild(row);
        return count;
    });
    container.appendChild(element);
    const hide = () => { element.hidden = true; };
    const abort = new AbortController();
    watchScroll(floating, hide, abort.signal);
    return {
        element,
        hide,
        show(title, values, x, y = 8) {
            heading.textContent = title;
            rows.forEach((count, i) => { count.textContent = describeValue(values[i]); });
            element.hidden = false;
            const { left, top } = tooltipCoordinates(element, container, floating, x, y);
            element.style.left = `${left}px`;
            element.style.top = `${top}px`;
        },
        dispose() {
            abort.abort();
            element.remove();
        }
    };
}
