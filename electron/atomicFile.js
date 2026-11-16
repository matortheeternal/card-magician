import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const TRANSIENT_RENAME_ERRORS = new Set(['EPERM', 'EACCES', 'EBUSY']);
const RENAME_RETRY_DELAYS = [10, 20, 40, 80, 160, 320, 640];

async function tryRename(source, target) {
    try {
        await fs.rename(source, target);
        return true;
    } catch (error) {
        if (TRANSIENT_RENAME_ERRORS.has(error.code)) return false;
        throw error;
    }
}

// Windows refuses to replace a file while any other handle has it open, including
// a concurrent writer replacing the same file, so those failures are retried.
export async function renameWithRetry(source, target, {
    retryDelays = process.platform === 'win32' ? RENAME_RETRY_DELAYS : []
} = {}) {
    for (const wait of retryDelays) {
        if (await tryRename(source, target)) return;
        await delay(wait);
    }
    await fs.rename(source, target);
}

export async function writeFile(target, data) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    const name = `.${path.basename(target)}.${randomUUID()}.tmp`;
    const temporary = path.join(path.dirname(target), name);
    try {
        await fs.writeFile(temporary, data);
        await renameWithRetry(temporary, target);
    } finally {
        await fs.rm(temporary, { force: true });
    }
}
