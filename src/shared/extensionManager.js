import MountedDirectory from './MountedDirectory.js';

export function getExtensionDirectory() {
    return new MountedDirectory(appEnvironment.paths.extensions, '/extensions');
}

export async function findExtension(relativePath) {
    const directory = getExtensionDirectory().child(relativePath);
    if (await directory.existsDirectory()) return directory;
    throw new Error(`Extension not found: ${relativePath}`);
}

export async function readExtensionDirectories(category, options = {}) {
    const directory = getExtensionDirectory().child(category);
    if (!await directory.existsDirectory()) return [];
    const children = await directory.readDirectory(options);
    return children.filter(child => child.type === 'DIRECTORY')
        .map(child => directory.child(child.entry));
}

export async function mountExtensions() {
    await getExtensionDirectory().mount();
}
