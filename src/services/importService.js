import { checkFileExists } from './fsHelpers.js';
import { patchImports } from './patchImports.js';

window.__MODULE_IMPORT__ = async function(filePath) {
    return await loadImport(filePath);
};

window.__MODULE_DEFAULT_IMPORT__ = async function(filePath) {
    const mod = await loadImport(filePath);
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
