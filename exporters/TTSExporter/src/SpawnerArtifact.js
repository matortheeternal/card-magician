import createLuaScript from './createLuaScript.js';

export default class SpawnerArtifact extends ExportArtifact {
    constructor(config) {
        super();
        this.ttsBasePath = config.ttsBasePath.endsWith('/')
            ? config.ttsBasePath
            : config.ttsBasePath + '/';
    }

    createTransform() {
        return {
            posX: 0,
            posY: 1,
            posZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            scaleX: 2.2,
            scaleY: 0.3,
            scaleZ: 2.4
        };
    }

    createGeneratorObject() {
        return {
            Name: 'BlockRectangle',
            Nickname: `${window.activeProject.setCode} Booster Generator`,
            Description: 'Creates collated booster packs for this set.',
            Transform: this.createTransform(),
            ColorDiffuse: {
                r: 0.25,
                g: 0.25,
                b: 0.25
            },
            Grid: true,
            Snap: true,
            Autoraise: true,
            Sticky: true,
            Tooltip: true,
            LuaScript: createLuaScript(this.ttsBasePath),
            LuaScriptState: ''
        };
    }

    get objectStates() {
        return [this.createGeneratorObject()];
    }

    async toBuffer() {
        return JSON.stringify({ ObjectStates: this.objectStates });
    }
}
