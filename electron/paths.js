import { app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveExtensionsPath } from './extensionsPath.js';

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
    const isDevelopment = !app.isPackaged && process.argv.includes('--development');
    const extensionsPath = resolveExtensionsPath({
        root, profile, isDevelopment, override: getArgument('--extensions-dir')
    });
    return {
        id: getArgument('--app-id', 'cardmagician'),
        version: app.getVersion(),
        runtimeVersion: process.versions.electron,
        isDevelopment,
        resourceMode: app.isPackaged ? 'bundle' : 'directory',
        args: process.argv,
        paths: {
            extensions: extensionsPath,
            content: app.isPackaged ? path.join(profile, 'content') : root,
            data: path.resolve(getArgument('--data-dir', path.join(profile, 'data'))),
            projects: path.resolve(getArgument(
                '--projects-dir', path.join(app.getPath('documents'), 'Card Magician')
            ))
        }
    };
}

export function isInside(base, target) {
    const relative = path.relative(base, target);
    return relative === '' || (!relative.startsWith(`..${path.sep}`)
        && relative !== '..' && !path.isAbsolute(relative));
}
