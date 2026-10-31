import { app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function getArgument(name, fallback) {
    const prefix = `${name}=`;
    return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length)
        ?? fallback;
}

export function createEnvironment() {
    const defaultProfile = path.join(app.getPath('appData'), 'card-magician');
    const profile = path.resolve(getArgument('--profile', defaultProfile));
    app.setPath('userData', profile);
    return {
        id: getArgument('--app-id', 'cardmagician'),
        version: app.getVersion(),
        runtimeVersion: process.versions.electron,
        isDevelopment: !app.isPackaged && process.argv.includes('--development'),
        resourceMode: app.isPackaged ? 'bundle' : 'directory',
        args: process.argv,
        paths: {
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
