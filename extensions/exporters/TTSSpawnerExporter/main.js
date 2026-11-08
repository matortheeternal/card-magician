import SpawnerArtifact from './src/SpawnerArtifact.js';
import PackArtifact from './src/PackArtifact.js';

const L = localize('tts-spawner-exporter');

export default class TTSSpawnerExporter extends CardMagicianExporter {
    saveOutputs = true;

    static get options() {
        return [{
            id: 'basePath',
            label: L`Base URL Path`,
            default: 'https://raw.githubusercontent.com/[username]/[repo]/'
                + 'refs/heads/main/dist/images',
            hint: L`The base URL where image files will be hosted.`
        }, {
            id: 'ttsBasePath',
            label: L`Base TTS URL Path`,
            default: 'https://raw.githubusercontent.com/[username]/[repo]/'
                + 'refs/heads/main/dist/tts',
            hint: L`The base URL where TTS files will be hosted.`
        }];
    }

    async *produce() {
        let filePath = `${window.activeProject.setCode}-spawner.json`;
        const spawnerCode = await this.loadFile('src/spawner.lua');
        let artifact = new SpawnerArtifact(this.config, spawnerCode);
        yield { filePath, artifact };
        filePath = `pack.json`;
        artifact = new PackArtifact(this.config);
        yield { filePath, artifact };
    }

    getOutputCount() {
        return 2;
    }
}
