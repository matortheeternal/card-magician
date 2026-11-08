import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export async function writeFile(target, data) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    const name = `.${path.basename(target)}.${randomUUID()}.tmp`;
    const temporary = path.join(path.dirname(target), name);
    try {
        await fs.writeFile(temporary, data);
        await fs.rename(temporary, target);
    } finally {
        await fs.rm(temporary, { force: true });
    }
}
