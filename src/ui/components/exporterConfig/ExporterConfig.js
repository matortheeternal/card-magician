import ReactiveComponent from '../ReactiveComponent.js';
import { getExporter } from '../../../domain/sets/exporterManager.js';
import { getActiveSet } from '../../../domain/sets/setManager.js';
import { emit } from '../../../shared/htmlUtils.js';

const L = localize('exporter-config');

export default class ExporterConfig extends ReactiveComponent {
    bind() {
        this.handleEvents('click', {
            onRemoveClick: () => this.onRemoveClick()
        });
    }

    get exporterId() {
        return this._exporterId ??= this.getAttribute('exporter-id');
    }

    get exporter() {
        return this._exporter ??= getExporter(this.exporterId);
    }

    get model() {
        return this._model ??= getActiveSet().export[this.exporterId];
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
        const set = getActiveSet();
        delete set.export[this.exporterId];
        emit(this, 'exporter-removed', { id: this.exporterId });
    }
}
