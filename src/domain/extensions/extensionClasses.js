import platform from '../../shared/platformAdapter.js';
import { getExtensionDirectory } from '../../shared/extensionManager.js';
import { compareVersions, parseVersion } from './extensionVersion.js';

const UNSAFE_PATH_PATTERN = /[\\:\u0000-\u001f]/;

export function isSafeExtensionPath(path) {
    if (typeof path !== 'string' || !path) return false;
    if (UNSAFE_PATH_PATTERN.test(path)) return false;
    return path.split('/').every(part => part && part !== '.' && part !== '..');
}

export class Extension {
    static matches(entryPath) {
        return entryPath.split('/').at(-1) === this.metadataFile;
    }

    static async load(entryPath, entry) {
        const metadata = await entry.json();
        if (!isSafeExtensionPath(metadata.id))
            throw new Error(`Invalid extension ID in ${entryPath}`);
        parseVersion(metadata.version);
        return new this(entryPath, metadata);
    }

    constructor(entryPath, metadata) {
        this.metadata = metadata;
        this.folderPath = entryPath.slice(0, -this.constructor.metadataFile.length);
        this.entries = {};
        this.installedVersion = null;
    }

    get id() {
        return this.metadata.id;
    }

    get name() {
        return this.metadata.name || this.metadata.label || this.id;
    }

    get relativePath() {
        return `${this.constructor.category}/${this.id}`;
    }

    get directory() {
        return getExtensionDirectory().child(this.relativePath);
    }

    get isNew() {
        return this.installedVersion === null;
    }

    get versionDifference() {
        if (this.isNew) return 1;
        return compareVersions(this.metadata.version, this.installedVersion);
    }

    get canInstall() {
        return this.versionDifference > 0;
    }

    get isOutdated() {
        return this.versionDifference < 0;
    }

    contains(entryPath) {
        return entryPath.startsWith(this.folderPath);
    }

    addEntry(entryPath, entry) {
        if (entry.isDirectory) return;
        const relativePath = entryPath.slice(this.folderPath.length);
        if (!isSafeExtensionPath(relativePath))
            throw new Error(`Unsafe package path: ${entryPath}`);
        this.entries[relativePath] = entry;
    }

    async loadInstalledVersion() {
        const filename = this.constructor.metadataFile;
        this.installedVersion = null;
        if (!await this.directory.exists(filename)) return;
        const metadata = await this.directory.readJson(filename);
        if (metadata.id !== this.id)
            throw new Error(`Installed extension ID does not match ${this.relativePath}`);
        parseVersion(metadata.version);
        this.installedVersion = metadata.version;
    }

    async install() {
        await this.loadInstalledVersion();
        if (!this.canInstall) return;
        const filename = this.constructor.metadataFile;
        for (const [relativePath, entry] of Object.entries(this.entries)) {
            if (relativePath === filename) continue;
            await this.installEntry(relativePath, entry);
        }
        await this.installEntry(filename, this.entries[filename]);
        this.installedVersion = this.metadata.version;
    }

    async installEntry(relativePath, entry) {
        const destination = this.directory.resolvePath(relativePath);
        const parent = await platform.getParentPath(destination);
        await platform.createDirectory(parent);
        await platform.writeBinaryFile(destination, await entry.arrayBuffer());
    }
}

export class GameExtension extends Extension {
    static category = 'games';
    static metadataFile = 'game.json';
}

export class CardPartExtension extends Extension {
    static category = 'cardparts';
    static metadataFile = 'module.json';
}

export class ExporterExtension extends Extension {
    static category = 'exporters';
    static metadataFile = 'exporter.json';
}

export class TemplateExtension extends Extension {
    static category = 'templates';
    static metadataFile = 'template.json';
}

export default [GameExtension, CardPartExtension, ExporterExtension, TemplateExtension];
