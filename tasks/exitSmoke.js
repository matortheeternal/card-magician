import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runShutdownTests } from './electron/shutdown.js';

const prefix = path.join(os.tmpdir(), 'card-magician-exit-');
const temp = await fs.mkdtemp(prefix);
try {
    await runShutdownTests(temp);
} finally {
    await fs.rm(temp, { recursive: true, force: true });
}
