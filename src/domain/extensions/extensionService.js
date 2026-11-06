import semver from 'semver';
import {
    getInstalledExtensions, installRegistryExtension, uninstallRegistryExtension
} from '../../shared/platformAdapter.js';
import { getLoadedExporters } from '../export/exporterManager.js';
import { registryService } from './registryService.js';
import { activateExtension } from './activation/activationRegistry.js';
import {
    normalizeVersion, selectRelease, dependencyRanges
} from './extensionMetadata.js';

export async function installedExtensions() {
    const result = await getInstalledExtensions();
    for (const exporter of getLoadedExporters(true).filter(e => e.native)) {
        result.extensions.push({
            id: exporter.id, type: 'exporter', version: exporter.version,
            bundled: true, builtIn: true,
            metadata: { id: exporter.id, version: exporter.version,
                label: exporter.label, description: exporter.description }
        });
    }
    return result;
}

export async function planInstallation(row, release, installed, catalog) {
    const plan = new Map();
    const visiting = new Set();
    const local = new Map(installed.map(entry => [entry.id, entry]));
    const available = new Map(catalog.map(entry => [entry.id, entry]));
    const visit = async (extension, candidate) => {
        if (visiting.has(extension.id))
            throw new Error(`Circular extension dependency: ${extension.id}`);
        visiting.add(extension.id);
        for (const [id, range] of Object.entries(dependencyRanges(candidate.metadata))) {
            if (!semver.validRange(range)) throw new Error(`Invalid dependency: ${id}`);
            const selected = plan.get(id);
            const current = selected?.release.version
                ?? normalizeVersion(local.get(id)?.version);
            if (current && semver.satisfies(current, range)) continue;
            if (selected) throw new Error(`Conflicting dependency versions: ${id}`);
            const dependency = available.get(id);
            if (!dependency)
                throw new Error(`Required extension unavailable: ${id} ${range}`);
            const best = selectRelease(await registryService.versions(id), range);
            if (!best) throw new Error(`No compatible release for ${id} ${range}`);
            await visit(dependency, best);
        }
        visiting.delete(extension.id);
        plan.set(extension.id, { row: extension, release: candidate });
    };
    await visit(row, release);
    return [...plan.values()];
}

async function activateInstalledExtension(row, wasInstalled, result) {
    try {
        if (await activateExtension(row, wasInstalled)) {
            result.activated.push(row.id);
            return;
        }
        result.reloadRequired.push(row.id);
    } catch (error) {
        result.failures.push({ id: row.id, message: error.message });
    }
}

export async function applyInstallation(plan, progress = () => {}) {
    const { extensions } = await installedExtensions();
    const previous = new Set(extensions.map(extension => extension.id));
    const result = { activated: [], reloadRequired: [], failures: [] };
    for (const { row, release } of plan) {
        progress(row.id);
        await installRegistryExtension(row.id, row.type, release.version);
        await activateInstalledExtension(row, previous.has(row.id), result);
        progress(row.id, true);
    }
    return result;
}

export function removalDependents(row, installed) {
    const fallback = normalizeVersion(row.installed.bundledVersion);
    return installed.filter(entry => {
        if (entry.id === row.id) return false;
        const range = dependencyRanges(entry.metadata)[row.id];
        return range !== undefined && !(fallback && semver.satisfies(fallback, range));
    });
}

export async function removeExtension(row, installed) {
    if (row.installed.bundled)
        throw new Error('Bundled extensions cannot be removed.');
    const dependents = removalDependents(row, installed);
    if (dependents.length)
        throw new Error('Required by: ' + dependents.map(e => e.id).join(', '));
    await uninstallRegistryExtension(row.id, row.type);
}
