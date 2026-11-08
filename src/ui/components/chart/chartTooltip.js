import { categorySymbol } from './categoryLabel.js';

let nextTooltip = 0;

/** Shared tooltip, positioned locally for SVG or in the viewport for scroll lists. */
export function createChartTooltip(container, categories, describeValue, {
    floating = false
} = {}) {
    const element = document.createElement('div');
    element.id = `stats-chart-tooltip-${++nextTooltip}`;
    element.className = 'stats-chart-tooltip';
    if (floating) element.classList.add('stats-chart-tooltip-floating');
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
    if (floating)
        document.addEventListener('scroll', hide, { capture: true, signal: abort.signal });
    return {
        element,
        hide,
        show(title, values, x, y = 8) {
            heading.textContent = title;
            rows.forEach((count, i) => { count.textContent = describeValue(values[i]); });
            element.hidden = false;
            const padding = floating ? 8 : 0;
            const maxWidth = floating ? window.innerWidth : container.clientWidth;
            const left = Math.max(padding, Math.min(
                maxWidth - element.offsetWidth - padding,
                floating ? x + 12 : x - element.offsetWidth / 2
            ));
            const top = floating ? Math.max(8, Math.min(
                y + 12, window.innerHeight - element.offsetHeight - 8
            )) : y;
            element.style.left = `${left}px`;
            element.style.top = `${top}px`;
        },
        dispose() {
            abort.abort();
            element.remove();
        }
    };
}
