export default class SpawnerArtifact extends ExportArtifact {
    constructor(config, spawnerCode) {
        super();
        this.ttsBasePath = config.ttsBasePath.endsWith('/')
            ? config.ttsBasePath
            : config.ttsBasePath + '/';
        this.spawnerCode = spawnerCode;
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

    createLuaScript() {
        const manifestUrl = JSON.stringify(this.ttsBasePath + 'pack.json');
        const boosterModelUrl = JSON.stringify(this.ttsBasePath + 'booster.obj');
        const boosterTextureUrl = JSON.stringify(this.ttsBasePath + 'booster.png');
        return (
            `local manifestUrl = ${manifestUrl}\n`+
            `local boosterModelUrl = ${boosterModelUrl}\n`+
            `local boosterTextureUrl = ${boosterTextureUrl}\n`+
            `${this.spawnerCode}`
        );
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
            LuaScript: this.createLuaScript(),
            LuaScriptState: ''
        };
    }

    async toBuffer() {
        return JSON.stringify({
            ObjectStates: [this.createGeneratorObject()]
        });
    }
}
