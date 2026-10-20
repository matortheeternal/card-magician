import ReactiveComponent from '../ReactiveComponent.js';
import {
    getExporter,
    getLoadedExporters,
    loadExporter,
} from '../../../domain/export/exporterManager.js';
import { emit, esc, escapeHTML } from '../../../shared/htmlUtils.js';
import { initializeFields } from '../../systems/fieldSystem.js';

const L = localize('add-exporter');

export default class AddExporter extends ReactiveComponent {
    error = '';

    connectedCallback() {
        this.render();
        this.handleEvents('click', {
            addExporter: event => this.addExporter(event),
        });
        this.watch('export', activeProject, 'export', () => this.render());
    }

    get availableExporters() {
        return getLoadedExporters().filter(exporter => {
            return !Object.hasOwn(this.model, exporter.id);
        });
    }

    get model() {
        return this.closest('cm-configure-exporters')?.model;
    }

    async addExporter(event) {
        const menuItem = event.target.closest('sl-menu-item');
        const exporterId = menuItem?.value;
        if (!exporterId || Object.hasOwn(this.model, exporterId)) return;

        const exporter = getExporter(exporterId);
        menuItem.disabled = true;
        try {
            await loadExporter(exporter);
            this.model[exporterId] = initializeFields(
                exporter.ExporterClass.options || [],
                {}
            );
            this.error = '';
            emit(this, 'exporter-added', { id: exporterId });
        } catch (error) {
            log('user').error(`Could not add exporter ${exporterId}`, error);
            this.error = L`Could not add ${exporter.label}.`;
        }
        this.render();
    }

    renderMenu() {
        return this.availableExporters.map(exporter => (
            `<sl-menu-item
                value="${esc(exporter.id)}"
                data-click-action="addExporter">
                <div>
                    <span class="text-emphasis">
                        ${escapeHTML(exporter.label || exporter.id)}
                    </span><br>
                    <small class="text-muted">
                        ${escapeHTML(exporter.description || '')}
                    </small>
                </div>
            </sl-menu-item>`
        )).join('');
    }

    render() {
        const disabled = this.availableExporters.length === 0;
        const title = disabled
            ? L`All available exporters have been added.`
            : '';
        this.innerHTML = (
            `<sl-dropdown placement="bottom-end" hoist>
                <sl-button
                    slot="trigger"
                    variant="primary"
                    caret
                    ${disabled ? 'disabled' : ''}
                    title="${esc(title)}">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    ${L`Add exporter`}
                </sl-button>
                <sl-menu>${this.renderMenu()}</sl-menu>
            </sl-dropdown>
            ${this.error ? `<p role="alert">${escapeHTML(this.error)}</p>` : ''}`
        );
    }
}

customElements.define('cm-add-exporter', AddExporter);
