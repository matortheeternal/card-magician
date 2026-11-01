import { spawn } from 'node:child_process';
import path from 'node:path';

export function launchSvgEditor(executable, filename) {
    if (typeof executable !== 'string' || !path.isAbsolute(executable))
        throw new TypeError('Choose an absolute path to the editor executable.');
    return new Promise((resolve, reject) => {
        const child = spawn(executable, [filename], {
            shell: false,
            detached: true,
            stdio: 'ignore'
        });
        child.once('error', reject);
        child.once('spawn', () => {
            child.unref();
            resolve();
        });
    });
}
