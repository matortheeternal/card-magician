import MountedDirectory from './MountedDirectory.js';

export function getExtensionLocations() {
    return [
        new MountedDirectory(appEnvironment.paths.userExtensions, '/user-extensions'),
        new MountedDirectory(appEnvironment.paths.plugins + '/extensions', '/extensions')
    ];
}

export async function findExtension(relativePath) {
    for (const location of getExtensionLocations()) {
        const directory = location.child(relativePath);
        if (await directory.existsDirectory()) return directory;
    }
    throw new Error(`Extension not found: ${relativePath}`);
}

export async function readExtensionDirectories(category, options = {}) {
    const directories = new Map();
    for (const location of getExtensionLocations()) {
        const directory = location.child(category);
        if (!await directory.existsDirectory()) continue;
        const children = await directory.readDirectory(options);
        for (const child of children) {
            if (child.type !== 'DIRECTORY' || directories.has(child.entry)) continue;
            directories.set(child.entry, directory.child(child.entry));
        }
    }
    return [...directories.values()];
}

export async function mountExtensions() {
    for (const location of getExtensionLocations()) await location.mount();
}
