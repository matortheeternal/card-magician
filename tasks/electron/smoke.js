import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launch } from './fixture.js';
import { runShutdownTests } from './shutdown.js';
import { prepareUserExtensions, preparePlatformFixtures } from './smokeFixtures.js';

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-electron-'));
try {
    const suites = ['Startup', 'Persistence', 'Rendering', 'Dialogs',
                    'Platform', 'Extensions'];
    const requested = process.argv.find(arg => arg.startsWith('--suite='))
        ?.slice('--suite='.length);
    if (requested && !suites.includes(requested))
        throw new Error(`Unknown smoke suite: ${requested}`);
    for (const suite of requested ? [requested] : suites) {
        console.log(`Running Electron ${suite}...`);
        const profilePath = path.join(temp, suite);
        if (suite === 'Extensions') await prepareUserExtensions(profilePath);
        if (suite === 'Platform') await preparePlatformFixtures(profilePath);
        const fixture = await launch({ profile: profilePath,
            url: '/tests/smoke.html', id: 'cardmagician.test',
            args: [`--test-suite=${suite}`,
                   ...(suite === 'Platform' && process.platform !== 'win32'
                       ? ['--test-symlinks'] : [])] });
        try { await fixture.result(); } finally { await fixture.cleanup(); }
    }
    if (!requested) await runShutdownTests(temp);
    console.log('Smoke tests passed.');
} finally { await fs.rm(temp, { recursive: true, force: true }); }
