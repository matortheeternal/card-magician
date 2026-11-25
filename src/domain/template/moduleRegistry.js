import { getExtensionDirectory } from '../../shared/extensionManager.js';
import { loadStylesheetFiles } from './moduleStylesheets.js';

const report = createReporter({ unit: 'moduleRegistry', label: 'Card Modules' });
const MODULE_METADATA_PATTERN = /^(.+)\/module\.json$/;
const DEFAULT_STYLESHEET = 'style.css';
const ASSETS_FOLDER = 'assets';
const moduleClasses = new Map();
let loadedGameId = null;

function findModulePaths(files) {
    const modulePaths = [];
    for (const file of files) {
        const match = file.match(MODULE_METADATA_PATTERN);
        if (match) modulePaths.push(match[1]);
    }
    return modulePaths;
}

function stylesheetPaths(files, modulePath, metadata) {
    if (metadata.stylesheets) return metadata.stylesheets;
    const hasDefault = files.has(`${modulePath}/${DEFAULT_STYLESHEET}`);
    return hasDefault ? [DEFAULT_STYLESHEET] : [];
}

function assetPaths(files, modulePath) {
    const prefix = `${modulePath}/${ASSETS_FOLDER}/`;
    const paths = new Set();
    for (const file of files) {
        if (!file.startsWith(prefix)) continue;
        paths.add(file.slice(prefix.length));
    }
    return paths;
}

async function importModuleClass(directory, metadata, stylesheets) {
    const { default: Module } = await import(directory.url('main.js'));
    Module.moduleMetadata = metadata;
    Module.moduleDirectory = directory;
    Module.ownStylesheets = await loadStylesheetFiles(directory, stylesheets);
    return Module;
}

async function loadModuleClass(cardparts, files, modulePath, gameId) {
    try {
        const directory = cardparts.child(modulePath);
        const metadata = await directory.readJson('module.json');
        if (metadata.gameId !== gameId) return;
        const stylesheets = stylesheetPaths(files, modulePath, metadata);
        const Module = await importModuleClass(directory, metadata, stylesheets);
        Module.ownAssets = assetPaths(files, modulePath);
        moduleClasses.set(modulePath, Module);
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
    const files = new Set(entries.filter(e => e.type === 'FILE').map(e => e.entry));
    await Promise.all(findModulePaths(files).map(modulePath => {
        return loadModuleClass(cardparts, files, modulePath, gameId);
    }));
}

export function getModuleClass(modulePath) {
    return moduleClasses.get(modulePath);
}
