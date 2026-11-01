import { app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {string} name
 * @param {string} fallback
 * @returns {string}
 */
export function getArgument(name, fallback) {
    const prefix = `${name}=`;
    const arg = process.argv.find(value => value.startsWith(prefix));
    return arg?.slice(prefix.length) ?? fallback;
}

export function createEnvironment() {
    const defaultProfile = path.join(app.getPath('appData'), 'card-magician');
    const profile = path.resolve(getArgument('--profile', defaultProfile));
    app.setPath('userData', profile);
    const userExtensionsPath = path.resolve(getArgument(
        '--extensions-dir', path.join(app.getPath('userData'), 'extensions')
    ));
    return {
        id: getArgument('--app-id', 'cardmagician'),
        version: app.getVersion(),
        runtimeVersion: process.versions.electron,
        isDevelopment: !app.isPackaged && process.argv.includes('--development'),
        resourceMode: app.isPackaged ? 'bundle' : 'directory',
        args: process.argv,
        paths: {
            userExtensions: userExtensionsPath,
            plugins: app.isPackaged ? path.dirname(process.execPath) : root,
            content: app.isPackaged ? path.join(profile, 'content') : root,
            data: path.resolve(getArgument('--data-dir', path.join(profile, 'data')))
        }
    };
}

export function isInside(base, target) {
    const relative = path.relative(base, target);
    return relative === '' || (!relative.startsWith(`..${path.sep}`)
        && relative !== '..' && !path.isAbsolute(relative));
}
