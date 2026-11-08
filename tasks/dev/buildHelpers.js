import path from 'node:path';
import fs from 'node:fs/promises';

export async function getSourceFiles(testFileCallback) {
    const files = await fs.readdir('src', { recursive: true });
    return files.map(file => file.replaceAll('\\', '/'))
        .filter(testFileCallback)
        .map(file => `./${file}`);
}

export function getPlatformAliases(target = 'electron') {
    const adapters = {
        electron: 'src/platforms/ElectronPlatformAdapter.js'
    };
    if (!Object.hasOwn(adapters, target))
        throw new Error(`Unsupported platform target: ${target}`);
    return { '@platform': path.resolve(adapters[target]) };
}
