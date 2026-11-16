import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { renameWithRetry, writeFile } from './atomicFile.js';

async function withTemp(fn) {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-atomic-'));
    try {
        await fn(temp);
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
}

test('concurrent writes to one target all succeed', () => withTemp(async temp => {
    const target = path.join(temp, 'image.png');
    await Promise.all(Array.from({ length: 8 }, (_, i) => writeFile(target, `w${i}`)));
    assert.match(await fs.readFile(target, 'utf8'), /^w\d$/);
    assert.deepEqual(await fs.readdir(temp), ['image.png']);
}));

test('a write waits for a reader to release the target', () => withTemp(async temp => {
    const target = path.join(temp, 'image.png');
    await writeFile(target, 'old');
    const handle = await fs.open(target, 'r');
    const write = writeFile(target, 'new');
    setTimeout(() => handle.close(), 50);
    await write;
    assert.equal(await fs.readFile(target, 'utf8'), 'new');
}));

test('rename does not retry errors that are not transient', () => withTemp(async temp => {
    const started = Date.now();
    await assert.rejects(
        renameWithRetry(path.join(temp, 'missing'), path.join(temp, 'target'), {
            retryDelays: [1000]
        }),
        { code: 'ENOENT' }
    );
    assert.ok(Date.now() - started < 1000);
}));

test('rename gives up after its retries are exhausted', () => withTemp(async temp => {
    const source = path.join(temp, 'source');
    const target = path.join(temp, 'target');
    await fs.writeFile(source, 'source');
    await fs.mkdir(target);
    await fs.writeFile(path.join(target, 'child'), '');
    await assert.rejects(renameWithRetry(source, target, { retryDelays: [1, 1] }));
    assert.equal(await fs.readFile(source, 'utf8'), 'source');
}));
