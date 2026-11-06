import semver from 'semver';

export const maxPackage = 300 * 1024 * 1024;
export const kinds = {
    game: ['games', 'game.json'], cardpart: ['cardparts', 'module.json'],
    template: ['templates', 'template.json'], exporter: ['exporters', 'exporter.json']
};
export const manifests = new Set(Object.values(kinds).map(([, name]) => name));

export function validId(id) {
    return typeof id === 'string' && id.length <= 180
        && /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(id);
}

export function versionOf(version) {
    return semver.valid(/^\d+\.\d+$/.test(version) ? `${version}.0` : version);
}
