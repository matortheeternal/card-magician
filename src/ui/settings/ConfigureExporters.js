import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';
import { hasExporter } from '../../domain/export/exporterManager.js';
import { esc, toggleDisplay } from '../../shared/htmlUtils.js';

const L = localize('settings');

export default class ConfigureExporters extends CardMagicianSettings {
    static id = 'cm-configure-exporters';
    static parentId = 'cm-project-settings';
    static label = L`Exporters`;
    static groupWeight = 640;

    static async search(query) {
        return [];
    }

    get model() {
        return activeProject.export;
    }

    bind() {
        super.bind();
        this.on('exporter-added', event => this.addExporter(event.detail.id));
        this.on('remove-exporter', event => this.removeExporter(event));
    }

    get addExporterControl() {
        return this.querySelector('cm-add-exporter');
    }

    get exportersContainer() {
        return this.querySelector('.configured-exporters');
    }

    get noExportersMessage() {
        return this.querySelector('.exporters-empty');
    }

    addExporter(exporterId) {
        const exporterConfig = document.createElement('cm-exporter-config');
        exporterConfig.setAttribute('exporter-id', exporterId);
        this.exportersContainer.appendChild(exporterConfig);
        changed(activeProject, 'export');
        this.updateNoExportersMessage();
        exporterConfig.scrollIntoView({ block: 'nearest' });
    }

    removeExporter(event) {
        const exporterId = event.detail.id;
        if (!Object.hasOwn(this.model, exporterId)) return;

        delete this.model[exporterId];
        changed(activeProject, 'export');
        event.target.remove();
        this.updateNoExportersMessage();
    }

    updateNoExportersMessage() {
        const showNoExporters = Object.keys(this.model).length === 0;
        toggleDisplay(showNoExporters, this.noExportersMessage);
    }

    render() {
        const configuredExporters = Object.keys(this.model)
            .filter(hasExporter)
            .map(id => (
                `<cm-exporter-config exporter-id="${esc(id)}"></cm-exporter-config>`
            )).join('');
        this.innerHTML = (
            `<div class="header">
                <p class="text-muted">
                    ${L`Choose which outputs this project can generate.`}
                </p>
                <cm-add-exporter></cm-add-exporter>
            </div>
            <p class="exporters-empty" ${configuredExporters ? 'hidden' : ''}>
                ${L`No exporters are configured.`}
            </p>
            <section class="configured-exporters">${configuredExporters}</section>`
        );
    }
}

registerSettings(ConfigureExporters);
