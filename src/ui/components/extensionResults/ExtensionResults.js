import ReactiveComponent from '../ReactiveComponent.js';
import { escapeHTML } from '../../../shared/htmlUtils.js';
import { filterExtensions } from '../../../domain/extensions/extensionMetadata.js';

const L = localize('extensions');

export default class ExtensionResults extends ReactiveComponent {
    rows = [];
    filters = {};
    selected = null;

    connectedCallback() {
        this.render();
        this.handleEvents('click', {
            select: event => {
                const button = event.target.closest('[data-extension-id]');
                this.selectExtension(button.dataset.extensionId);
            }
        });
        this.renderResults();
    }

    get resultsContainer() {
        return this.querySelector('.results');
    }

    get visibleRows() {
        return filterExtensions(this.rows, this.filters);
    }

    show(rows, filters = this.filters) {
        this.rows = rows;
        this.filter(filters);
    }

    filter(filters) {
        this.filters = filters;
        if (this.isConnected) this.renderResults();
    }

    setSelection(row) {
        if (this.selected === row) return;
        this.selected = row;
        this.emit('extension-selection-changed', { extension: row });
    }

    reconcileSelection(rows) {
        const current = rows.find(row => row.id === this.selected?.id);
        this.setSelection(current ?? rows[0] ?? null);
    }

    renderResultTitle(row, title) {
        const html = [`<strong>${escapeHTML(title)}</strong>`];
        if (row.id !== title) html.push(`<small>${escapeHTML(row.id)}</small>`);
        return html.join('\n');
    }

    renderInstalledBadge(row) {
        if (!row.installed) return '';
        const installedVersion = String(row.installed.version ?? '');
        return (
            `<sl-badge variant="neutral">
                ${L`${escapeHTML(installedVersion)} installed`}
            </sl-badge>`
        );
    }

    renderResultContent(row, title) {
        return (
            `${this.renderResultTitle(row, title)}
            <span class="extension-result-meta">
                <span>${escapeHTML(row.type)}</span>
                ${this.renderInstalledBadge(row)}
            </span>`
        );
    }

    renderResult(row) {
        const title = String(row.metadata?.label || row.metadata?.name || row.id);
        const element = document.createElement('div');
        element.classList.add('extension-result');
        if (this.selected === row) element.classList.add('selected');
        element.dataset.clickAction = 'select';
        element.dataset.extensionId = row.id;
        element.setAttribute('aria-label', title);
        element.innerHTML = this.renderResultContent(row, title);
        this.resultsContainer.appendChild(element);
    }

    renderResults() {
        const rows = this.visibleRows;
        this.reconcileSelection(rows);
        this.resultsContainer.replaceChildren();
        for (const row of rows) this.renderResult(row);
        this.querySelector('.extension-empty').hidden = rows.length > 0;
        this.emit('extension-results-changed', { count: rows.length });
    }

    render() {
        this.innerHTML = (
            `<div class="results"></div>
            <p class="extension-empty text-muted">
                ${L`No matching extensions.`}
            </p>`
        );
    }

    selectExtension(id) {
        const row = this.visibleRows.find(entry => entry.id === id);
        if (!row || row === this.selected) return;
        this.setSelection(row);
        this.renderResults();
    }
}

customElements.define('cm-extension-results', ExtensionResults);
