import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launch } from './electron/fixture.js';

const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-unit-'));
const fixture = await launch({
    profile, url: '/tests/tests.html', id: 'cardmagician.test'
});
try { await fixture.result(); } finally {
    await fixture.cleanup();
    await fs.rm(profile, { recursive: true, force: true });
}
