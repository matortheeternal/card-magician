import ReactiveComponent from '../ReactiveComponent.js';
import { getExporter } from '../../../domain/export/exporterManager.js';
import { getActiveSet } from '../../../domain/sets/setManager.js';
import { emit } from '../../../shared/htmlUtils.js';

const L = localize('exporter-config');

export default class ExporterConfig extends ReactiveComponent {
    bind() {
        this.handleEvents('click', {
            onRemoveClick: () => this.onRemoveClick()
        });
        this.addEventListener('cm-field-changed', () => {
            changed(this.activeSet.export);
        });
    }

    get activeSet() {
        return this._activeSet ??= getActiveSet();
    }

    get exporterId() {
        return this._exporterId ??= this.getAttribute('exporter-id');
    }

    get exporter() {
        return this._exporter ??= getExporter(this.exporterId);
    }

    get model() {
        return this._model ??= this.activeSet.export[this.exporterId];
    }

    render() {
        return (
            `<sl-tooltip content="${L`Remove exporter}`}">
                <sl-icon-button
                    class="remove-btn"
                    name="x-lg"
                    data-click-action="onRemoveClick"></sl-icon-button>
            </sl-tooltip>
            <h3>${L`${this.exporter.label}`}</h3>
            ${this.exporter.form}`
        );
    }

    onRemoveClick() {
        delete this.activeSet.export[this.exporterId];
        emit(this, 'exporter-removed', { id: this.exporterId });
    }
}
