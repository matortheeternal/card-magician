import { categoryBackground } from './categoryPaint.js';

export function categorySymbol(category) {
    if (!category.icon) {
        const swatch = document.createElement('span');
        swatch.className = 'stats-category-swatch';
        swatch.style.background = categoryBackground(category);
        if (category.outline)
            swatch.style.boxShadow = `inset 0 0 0 1px ${category.outline}`;
        swatch.setAttribute('aria-hidden', 'true');
        return swatch;
    }
    const image = document.createElement('img');
    image.src = category.icon;
    image.alt = '';
    image.className = 'stats-color-symbol';
    return image;
}

export function categoryLabel(category) {
    if (!category.icon) return document.createTextNode(category.label);
    const tooltip = document.createElement('sl-tooltip');
    tooltip.content = category.label;
    const symbol = categorySymbol(category);
    symbol.tabIndex = 0;
    symbol.setAttribute('role', 'img');
    symbol.setAttribute('aria-label', category.label);
    tooltip.appendChild(symbol);
    return tooltip;
}
