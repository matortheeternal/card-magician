import { esc, escapeHTML } from '../../../shared/htmlUtils.js';

const L = localize('install-package-modal');

function renderStatus(extension) {
    if (extension.isNew) return `<sl-badge variant="success">${L`New`}</sl-badge>`;
    if (extension.isOutdated)
        return `<sl-badge variant="danger">${L`Outdated`}</sl-badge>`;
    if (!extension.canInstall) return `<sl-badge>${L`Installed`}</sl-badge>`;
    return `<sl-badge variant="primary">${L`Updated`}</sl-badge>`;
}

function renderTooltip(extension) {
    const lines = [
        escapeHTML(extension.relativePath),
        L`Version ${extension.metadata.version}`
    ];
    if (!extension.isNew)
        lines.push(L`Installed version: ${extension.installedVersion}`);
    return esc(lines.join('\n'));
}

export function renderExtensionRow(extension, index) {
    const name = escapeHTML(extension.name);
    const tooltip = renderTooltip(extension);
    const checkboxState = extension.canInstall ? 'checked' : 'disabled';
    const unavailable = extension.canInstall ? '' : 'data-unavailable';
    return (
        `<article ${unavailable} title="${tooltip}">
            <sl-checkbox data-extension-index="${index}" ${checkboxState}
                aria-description="${tooltip}">
                <strong>${name}</strong>
            </sl-checkbox>
            ${renderStatus(extension)}
        </article>`
    );
}
