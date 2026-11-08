const SVG_NS = 'http://www.w3.org/2000/svg';
const percentage = offset => `${Number((offset * 100).toFixed(6))}%`;

export function categoryBackground(category) {
    if (!category.gradient?.length)
        return category.color || 'var(--sl-color-primary-600)';
    const stops = category.gradient.map(stop => `${stop.color} ${percentage(stop.offset)}`);
    return `linear-gradient(135deg, ${stops.join(', ')})`;
}

export function svgCategoryPaint(svg, category, id) {
    if (!category.gradient?.length)
        return category.color || 'var(--sl-color-primary-600)';
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS(SVG_NS, 'defs');
        svg.prepend(defs);
    }
    const gradient = document.createElementNS(SVG_NS, 'linearGradient');
    for (const [name, value] of Object.entries({
        id, x1: '0%', y1: '0%', x2: '100%', y2: '100%'
    })) gradient.setAttribute(name, value);
    for (const { color, offset } of category.gradient) {
        const stop = document.createElementNS(SVG_NS, 'stop');
        stop.setAttribute('offset', percentage(offset));
        stop.setAttribute('stop-color', color);
        gradient.appendChild(stop);
    }
    defs.appendChild(gradient);
    return `url(#${id})`;
}
