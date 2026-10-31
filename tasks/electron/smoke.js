import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launch } from './fixture.js';
import { runShutdownTests } from './shutdown.js';

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-electron-'));
try {
    for (const suite of ['Startup', 'Persistence', 'Rendering', 'Dialogs']) {
        console.log(`Running Electron ${suite}...`);
        const fixture = await launch({ profile: path.join(temp, suite),
            url: '/tests/smoke.html', id: 'cardmagician.test',
            args: [`--test-suite=${suite}`] });
        try { await fixture.result(); } finally { await fixture.cleanup(); }
    }
    await runShutdownTests(temp);
    console.log('Smoke tests passed.');
} finally { await fs.rm(temp, { recursive: true, force: true }); }
