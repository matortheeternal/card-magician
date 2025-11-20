import { checkFileExists } from './fsHelpers.js';
import { patchImports } from './patchImports.js';

async function resolveModuleImport(localPath, parentPath) {
    return await loadImport([
        ...parentPath.split('/').slice(0, -1),
        localPath.replace(/^\.\//, '')
    ].join('/'));
}

window.__MODULE_IMPORT__ = async function(localPath, parentPath) {
    return await resolveModuleImport(localPath, parentPath);
};

window.__MODULE_DEFAULT_IMPORT__ = async function(localPath, parentPath) {
    const mod = await resolveModuleImport(localPath, parentPath);
    return mod?.default ?? mod;
}

const sourceCodeCache = new Map();
async function loadSourceCode(filePath) {
    if (sourceCodeCache.has(filePath))
        return sourceCodeCache.get(filePath);
    const exists = await checkFileExists(filePath);
    if (!exists) {
        console.error(`Module not found: ${filePath}`);
        return;
    }

    const sourceCode = [
        `//# sourceURL=${filePath}`,
        patchImports(
            await Neutralino.filesystem.readFile(filePath),
            filePath
        )
    ].join('\n')
    const blob = new Blob([sourceCode], { type: 'application/javascript' });
    const blobURL = URL.createObjectURL(blob);
    sourceCodeCache.set(filePath, blobURL);
    return blobURL;
}

export async function loadImport(filePath) {
    try {
        const blobUrl = await loadSourceCode(filePath);
        return await import(blobUrl);
    } catch (error) {
        console.error(`Failed to import ${filePath}:`, error);
    }
}
