import Modal from '../Modal.js';
import { registerModal } from '../modalManager.js';
import { esc, toggleDisplay } from '../../../shared/htmlUtils.js';

const L = localize('configure-exporters-modal');

export default class ConfigureExportersModal extends Modal {
    static id = 'cm-configure-exporters-modal';
    title = L`Configure Exporters`;

    connectedCallback() {
        super.connectedCallback();
        this.style.maxWidth = '42em';
    }

    bind() {
        super.bind();
        this.on('cm-field-changed', () => this.saveProject());
        this.on('exporter-added', event => this.addExporter(event.detail.id));
        this.on('remove-exporter', event => this.removeExporter(event));
        this.addExporterControl.model = this.data;
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
        this.saveProject();
    }

    removeExporter(event) {
        const exporterId = event.detail.id;
        if (!Object.hasOwn(this.data, exporterId)) return;

        delete this.data[exporterId];
        changed(activeProject, 'export');
        event.target.remove();
        this.updateNoExportersMessage();
        this.saveProject();
    }

    updateNoExportersMessage() {
        const showNoExporters = Object.keys(this.data).length === 0;
        toggleDisplay(showNoExporters, this.noExportersMessage);
    }

    renderBody() {
        const configuredExporters = Object.keys(this.data).map(id => {
            return (
                `<cm-exporter-config exporter-id="${esc(id)}"></cm-exporter-config>`
            );
        }).join('');
        return (
            `<div class="modal-header">
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

    renderActions() {
        return (
            `<sl-button data-click-action="close">${L`Close`}</sl-button>`
        );
    }
}

registerModal(ConfigureExportersModal);
