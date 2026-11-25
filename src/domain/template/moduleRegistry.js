import { getExtensionDirectory } from '../../shared/extensionManager.js';

const report = createReporter({ unit: 'moduleRegistry', label: 'Card Modules' });
const MODULE_METADATA_PATTERN = /^(.+)\/module\.json$/;
const moduleClasses = new Map();
let loadedGameId = null;

function findModulePaths(entries) {
    const modulePaths = [];
    for (const { entry, type } of entries) {
        const match = type === 'FILE' && entry.match(MODULE_METADATA_PATTERN);
        if (match) modulePaths.push(match[1]);
    }
    return modulePaths;
}

async function importModuleClass(directory, metadata) {
    const { default: Module } = await import(directory.url('main.js'));
    Module.moduleMetadata = metadata;
    return Module;
}

async function loadModuleClass(cardparts, modulePath, gameId) {
    try {
        const directory = cardparts.child(modulePath);
        const metadata = await directory.readJson('module.json');
        if (metadata.gameId !== gameId) return;
        moduleClasses.set(modulePath, await importModuleClass(directory, metadata));
    } catch (error) {
        log('plugin').warn('Failed to load module:', modulePath, error);
        report('loadModuleClass', error, [modulePath]);
    }
}

export async function loadModuleClasses(gameId) {
    if (loadedGameId === gameId) return;
    moduleClasses.clear();
    loadedGameId = gameId;
    const cardparts = getExtensionDirectory().child('cardparts');
    const entries = await cardparts.readDirectory({ recursive: true });
    await Promise.all(findModulePaths(entries).map(modulePath => {
        return loadModuleClass(cardparts, modulePath, gameId);
    }));
}

export function getModuleClass(modulePath) {
    return moduleClasses.get(modulePath);
}
