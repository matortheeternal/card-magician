import { renderExtensionRow } from './extensionRow.js';

const L = localize('install-package-modal');

const GROUPS = [
    { category: 'games', label: L`Games` },
    { category: 'cardparts', label: L`Cardparts` },
    { category: 'templates', label: L`Templates` },
    { category: 'exporters', label: L`Exporters` }
];

function renderGroup(extensions, group) {
    const rows = [];
    const entries = [...extensions.entries()].sort((left, right) => {
        return left[1].name.localeCompare(right[1].name, undefined, {
            numeric: true, sensitivity: 'base'
        });
    });
    let hasAvailable = false;
    for (const [index, extension] of entries) {
        if (extension.constructor.category !== group.category) continue;
        rows.push(renderExtensionRow(extension, index));
        hasAvailable ||= extension.canInstall;
    }
    if (!rows.length) return '';
    const unavailable = hasAvailable ? '' : 'data-unavailable';
    return `<section ${unavailable} aria-labelledby="extension-group-${group.category}">
        <h3 id="extension-group-${group.category}">${group.label}</h3>
        ${rows.join('')}
    </section>`;
}

export function renderExtensionGroups(extensions) {
    return GROUPS.map(group => renderGroup(extensions, group)).join('');
}
