import ReactiveComponent from '../ReactiveComponent.js';
import { getExporter, loadExporter } from '../../../domain/export/exporterManager.js';
import { emit, esc, escapeHTML } from '../../../shared/htmlUtils.js';
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
            `<header>
                <strong>${escapeHTML(this.exporter.label || this.exporterId)}</strong>
                <br>
                <small class="text-muted">
                    ${escapeHTML(this.exporter.description || '')}
                </small>
            </header>
            <sl-tooltip content="${esc(L`Remove exporter`)}">
                <sl-icon-button
                    class="remove-btn"
                    name="x-lg"
                    label="${esc(L`Remove exporter`)}"
                    data-click-action="onRemoveClick"></sl-icon-button>
            </sl-tooltip>
            <div class="form">${this.exporter.form}</div>`
        );
    }

    onRemoveClick() {
        emit(this, 'remove-exporter', { id: this.exporterId });
    }
}

customElements.define('cm-exporter-config', ExporterConfig);
