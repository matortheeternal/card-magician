import ExtensionActivation from './ExtensionActivation.js';
import { hasExporter, registerExporter } from '../../export/exporterManager.js';

export default class ExporterActivation extends ExtensionActivation {
    static type = 'exporter';
    static folder = 'exporters';

    get isRegistered() {
        return super.isRegistered || hasExporter(this.row.id);
    }

    async register(directory) {
        const exporter = await registerExporter(directory);
        if (!exporter) throw new Error('Exporter manifest is missing.');
    }
}
