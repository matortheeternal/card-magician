import Modal from '../Modal.js';
import { registerModal } from '../modalManager.js';
import { esc } from '../../../shared/htmlUtils.js';

const L = localize('configure-exporters-modal');

export default class ConfigureExportersModal extends Modal {
    static id = 'cm-configure-exporters-modal';
    title = L`Configure Exporters`;

    connectedCallback() {
        super.connectedCallback();
        this.style.maxWidth = '35em';
    }

    bind() {
        super.bind();
        this.on('cm-field-changed', () => this.saveProject());
    }

    addExporter() {
        // TODO
    }

    renderBody() {
        return Object.keys(this.data).map(id => {
            return (
                `<cm-exporter-config exporter-id="${esc(id)}"></cm-exporter-config>`
            );
        }).join('');
    }

    renderActions() {
        return (
            `<sl-button data-click-action="addExporter">${L`Add Exporter`}</sl-button>
             <sl-button data-click-action="close">${L`Close`}</sl-button>`
        );
    }
}

registerModal(ConfigureExportersModal);
