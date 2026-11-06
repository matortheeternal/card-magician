import semver from 'semver';

export function normalizeVersion(value) {
    if (typeof value !== 'string') return null;
    return semver.valid(/^\d+\.\d+$/.test(value) ? `${value}.0` : value);
}

export function isCompatible(metadata, appVersion = appEnvironment.version) {
    return Object.entries(metadata.compatibility ?? {}).every(([key, range]) =>
        key === 'cardMagician' && !!semver.validRange(range)
        && semver.satisfies(appVersion, range));
}

export function selectRelease(versions, range = '*') {
    return versions.filter(release => release.state === 'published'
        && normalizeVersion(release.version) && isCompatible(release.metadata ?? {})
        && semver.satisfies(release.version, range))
        .sort((a, b) => semver.rcompare(a.version, b.version))[0] ?? null;
}

export function dependencyRanges(metadata) {
    const dependencies = { ...metadata.dependencies };
    if (metadata.gameId) dependencies[metadata.gameId] ??= '*';
    for (const id of [
        ...(metadata.card ?? []),
        ...Object.values(metadata.subcards ?? {}).flat()
    ]) dependencies[id] ??= '*';
    return dependencies;
}

export function mergeExtensions(catalog, installed) {
    const rows = new Map(catalog.map(extension => [extension.id, { ...extension }]));
    for (const local of installed) {
        const row = rows.get(local.id) ?? {
            id: local.id, type: local.type, metadata: local.metadata
        };
        row.installed = local;
        rows.set(local.id, row);
    }
    return [...rows.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function filterExtensions(rows, { query = '', type = '', installed = false }) {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return rows.filter(row => (!type || row.type === type)
        && (!installed || !!row.installed)
        && terms.every(term => [row.id, row.metadata?.label, row.metadata?.name,
                                row.metadata?.description, row.metadata?.author]
            .some(value => typeof value === 'string'
                && value.toLowerCase().includes(term))));
}
