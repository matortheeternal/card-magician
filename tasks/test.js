import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { preparePlatformFixtures } from './electron/smokeFixtures.js';
import { launch } from './electron/fixture.js';

const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-unit-'));
await preparePlatformFixtures(profile);
const fixture = await launch({
    profile, url: '/tests/tests.html', id: 'cardmagician.test',
    args: process.platform === 'win32' ? [] : ['--test-symlinks']
});
try { await fixture.result(); } finally {
    await fixture.cleanup();
    await fs.rm(profile, { recursive: true, force: true });
}
