import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launch } from '../electron/tests/TestApplication.js';
import { runShutdownTests } from '../electron/tests/shutdown.smoke.js';
import { prepareUserExtensions } from '../electron/tests/fixtures.js';

const suites = [
    'Startup', 'Shutdown', 'Persistence', 'History', 'Rendering',
    'Card display', 'Dialogs', 'Extensions', 'Project files',
    'Set Icon Editor settings', 'Magic project settings'
];

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-electron-'));
try {
    const requested = process.argv
        .find(arg => arg.startsWith('--suite='))
        ?.slice('--suite='.length);
    if (requested !== undefined && !suites.includes(requested))
        throw new Error(`Unknown smoke suite: ${requested}`);

    const suitesToRun = requested ? [requested] : suites;
    for (const suite of suitesToRun) {
        console.log(`Running ${suite}...`);
        const profilePath = path.join(temp, suite);
        if (suite === 'Extensions')
            await prepareUserExtensions(profilePath);
        if (suite === 'Shutdown') {
            await runShutdownTests(profilePath);
            continue;
        }

        const fixture = await launch({
            profile: profilePath,
            url: '/tests/smoke.html',
            id: 'cardmagician.test',
            args: [`--test-suite=${suite}`]
        });
        try {
            await fixture.result();
        } finally {
            await fixture.cleanup();
        }
    }
    console.log('Smoke tests passed.');
} finally {
    await fs.rm(temp, { recursive: true, force: true });
}
