import ReactiveComponent from '../ReactiveComponent.js';
import { getExporter, loadExporter } from '../../../domain/export/exporterManager.js';
import { emit } from '../../../shared/htmlUtils.js';
import { initializeFields } from '../../systems/fieldSystem.js';

const L = localize('exporter-config');

export default class ExporterConfig extends ReactiveComponent {
    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            onRemoveClick: () => this.onRemoveClick()
        });
        this.addEventListener('cm-field-changed', () => {
            changed(activeProject.export);
        });
    }

    get exporterId() {
        return this._exporterId ??= this.getAttribute('exporter-id');
    }

    get exporter() {
        return this._exporter ??= getExporter(this.exporterId);
    }

    get model() {
        return this._model ??= initializeFields(
            this.fields,
            activeProject.export[this.exporterId]
        );
    }

    get fields() {
        return this._fields ??= this.exporter.ExporterClass.options;
    }

    async render() {
        await loadExporter(this.exporter);
        this.innerHTML = (
            `<sl-tooltip content="${L`Remove exporter}`}">
                <sl-icon-button
                    class="remove-btn"
                    name="x-lg"
                    data-click-action="onRemoveClick"></sl-icon-button>
            </sl-tooltip>
            <div>${this.exporter.label}</div>
            ${this.exporter.form}`
        );
    }

    onRemoveClick() {
        delete activeProject.export[this.exporterId];
        emit(this, 'exporter-removed', { id: this.exporterId });
    }
}

customElements.define('cm-exporter-config', ExporterConfig);
