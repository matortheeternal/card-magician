import platform from '../../shared/platformAdapter.js';
import { getExtensionDirectory } from '../../shared/extensionManager.js';
import { SemVer, compare } from 'semver';

const UNSAFE_PATH_PATTERN = /[\\:\u0000-\u001f]/;

export function isSafeExtensionPath(path) {
    if (typeof path !== 'string' || !path) return false;
    if (UNSAFE_PATH_PATTERN.test(path)) return false;
    return path.split('/').every(part => part && part !== '.' && part !== '..');
}

function parseExtensionVersion(version) {
    const text = String(version);
    const core = text.split('-')[0].split('+')[0];
    const components = core.split('.');
    while (components.length < 3) components.push('0');
    return new SemVer(components.join('.') + text.slice(core.length));
}

export class Extension {
    #installedVersion = null;
    #installedSemver = null;

    static matches(entryPath) {
        return entryPath.split('/').at(-1) === this.metadataFile;
    }

    static async load(entryPath, entry) {
        const metadata = await entry.json();
        if (!isSafeExtensionPath(metadata.id))
            throw new Error(`Invalid extension ID in ${entryPath}`);
        return new this(entryPath, metadata);
    }

    constructor(entryPath, metadata) {
        this.metadata = metadata;
        this.packageVersion = parseExtensionVersion(metadata.version);
        this.folderPath = entryPath.slice(0, -this.constructor.metadataFile.length);
        this.entries = {};
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

    get installedVersion() {
        return this.#installedVersion;
    }

    set installedVersion(version) {
        this.#installedSemver = version === null ? null : parseExtensionVersion(version);
        this.#installedVersion = version;
    }

    get isNew() {
        return this.installedVersion === null;
    }

    get versionDifference() {
        if (this.isNew) return 1;
        return compare(this.packageVersion, this.#installedSemver);
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
