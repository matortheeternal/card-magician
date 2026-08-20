import WebArtifact from './src/WebArtifact.js';

const L = localize('web-exporter');

export default class WebExporter extends CardMagicianExporter {
    saveOutputs = true;

    static get options() {
        return [{
            id: 'baseUrl',
            label: L`Base URL`
        }];
    }

    async *produce() {
        const filePath = `set.json`;
        const artifact = new WebArtifact(this.config);
        yield { filePath, artifact };
    }

    getOutputCount() {
        return 1;
    }
}
