import { unzip } from 'unzipit';
import { openModal } from '../../ui/modals/modalManager.js';
import platform from '../../shared/platformAdapter.js';
import ExtensionClasses, { isSafeExtensionPath } from './extensionClasses.js';

const L = localize('install-package-modal');

async function createExtension(entryPath, entry) {
    for (const ExtClass of ExtensionClasses) {
        if (!ExtClass.matches(entryPath)) continue;
        return await ExtClass.load(entryPath, entry);
    }
}

async function findExtensions(entries) {
    const extensions = [];
    const paths = Object.keys(entries).sort((a, b) => a.length - b.length);
    for (const entryPath of paths) {
        if (entries[entryPath].isDirectory) continue;
        if (!isSafeExtensionPath(entryPath))
            throw new Error(`Unsafe package path: ${entryPath}`);
        if (extensions.some(ext => ext.contains(entryPath))) continue;
        const extension = await createExtension(entryPath, entries[entryPath]);
        if (!extension) continue;
        if (extensions.some(ext => ext.relativePath === extension.relativePath))
            throw new Error(`Duplicate extension: ${extension.relativePath}`);
        extensions.push(extension);
    }
    return extensions;
}

function addEntriesToExtensions(extensions, entries) {
    for (const [entryPath, entry] of Object.entries(entries)) {
        const extension = extensions.find(ext => ext.contains(entryPath));
        extension?.addEntry(entryPath, entry);
    }
}

export async function getExtensionsFromPackage(filePath) {
    const buffer = await platform.readBinaryFile(filePath);
    const { entries } = await unzip(new Uint8Array(buffer));
    const extensions = await findExtensions(entries);
    if (!extensions.length)
        throw new Error(`No extensions found in package ${filePath}`);
    addEntriesToExtensions(extensions, entries);
    return extensions;
}

export async function installPackage(filePath) {
    try {
        const extensions = await getExtensionsFromPackage(filePath);
        for (const extension of extensions)
            await extension.loadInstalledVersion();
        openModal('cm-install-package-modal', { extensions });
    } catch (error) {
        log('fs').error('Failed to read extension package', error);
        await dialog.alert(L`The extension package could not be read. ${error.message}`);
    }
}

export async function installExtensions(extensions) {
    const failures = [];
    for (const extension of extensions) {
        try {
            await extension.install();
        } catch (error) {
            log('fs').error(`Failed to install ${extension.relativePath}`, error);
            failures.push(extension);
        }
    }
    return failures;
}

platform.onOpenFile(filePath => {
    if (!filePath.endsWith('.cmpkg')) return;
    void installPackage(filePath);
});
