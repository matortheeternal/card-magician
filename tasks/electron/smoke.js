import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launch } from './fixture.js';
import { runShutdownTests } from './shutdown.js';
import { prepareUserExtensions } from './smokeFixtures.js';

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-electron-'));
try {
    const suites = ['Startup', 'Persistence', 'History', 'Rendering',
                    'Card display', 'Dialogs', 'Extensions', 'Extensions browser',
                    'Project files',
                    'Set Icon Editor settings', 'Magic project settings'];
    const requested = process.argv.find(arg => arg.startsWith('--suite='))
        ?.slice('--suite='.length);
    if (requested && !suites.includes(requested))
        throw new Error(`Unknown smoke suite: ${requested}`);
    for (const suite of requested ? [requested] : suites) {
        console.log(`Running ${suite}...`);
        const profilePath = path.join(temp, suite);
        if (suite === 'Extensions') await prepareUserExtensions(profilePath);
        const fixture = await launch({ profile: profilePath,
            url: '/tests/smoke.html', id: 'cardmagician.test',
            args: [`--test-suite=${suite}`] });
        try { await fixture.result(); } finally { await fixture.cleanup(); }
    }
    if (!requested) await runShutdownTests(temp);
    console.log('Smoke tests passed.');
} finally { await fs.rm(temp, { recursive: true, force: true }); }
