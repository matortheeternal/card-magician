import TTSArtifact from './src/TTSArtifact.js';

const L = localize('tts-exporter');

export default class TTSExporter extends CardMagicianExporter {
    saveOutputs = true;

    static get options() {
        return [{
            id: 'basePath',
            label: L`Base URL Path`,
            default: 'https://raw.githubusercontent.com/[username]/[repo]/refs/heads/main/output/CardImagesExporter',
            hint: L`The base URL where image files will be hosted.`
        }];
    }

    async *produce() {
        const filePath = `${window.activeProject.setCode}.json`;
        const artifact = new TTSArtifact(this.config);
        yield { filePath, artifact };
    }

    getOutputCount() {
        return 1;
    }
}
