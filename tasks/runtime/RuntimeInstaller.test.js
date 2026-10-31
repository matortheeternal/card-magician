import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import RuntimeInstaller from './RuntimeInstaller.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const lock = JSON.parse(await readFile(join(root, 'neutralino.lock.json')));
const sha256 = data => createHash('sha256').update(data).digest('hex');
const archive = await new RuntimeInstaller(root, lock).download(lock.archive);
assert.equal(sha256(archive), lock.archive.sha256);

async function fixture(t) {
    const folder = await mkdtemp(join(tmpdir(), 'card-magician-installer-'));
    t.after(() => rm(folder, { recursive: true, force: true }));
    const installer = new RuntimeInstaller(folder, lock);
    await mkdir(installer.cache, { recursive: true });
    await writeFile(join(installer.cache, lock.archive.sha256), archive);
    for (const [filePath, asset] of Object.entries(lock.client.files)) {
        const data = await readFile(join(root, filePath));
        assert.equal(sha256(data), asset.sha256);
        await writeFile(join(installer.cache, asset.sha256), data);
    }
    return installer;
}

test('installs the published archive and repairs overwritten runtime/client files', async t => {
    const installer = await fixture(t);
    await installer.install();
    assert.deepEqual(await installer.verify(), []);
    const binary = join(installer.root, 'bin', 'neutralino-linux_x64');
    const client = join(installer.root, 'resources/js/neutralino.js');
    await writeFile(binary, 'An upstream update replaced this binary.');
    await writeFile(client, 'An unrelated client version.');
    assert.deepEqual(await installer.verify(), ['bin/neutralino-linux_x64',
        'resources/js/neutralino.js']);
    await installer.install();
    assert.equal(sha256(await readFile(binary)), lock.binaries['neutralino-linux_x64']);
    assert.equal(sha256(await readFile(client)), lock.client.files['resources/js/neutralino.js'].sha256);
    if (process.platform === 'win32') return;
    await chmod(binary, 0o644);
    assert.deepEqual(await installer.verify(), ['bin/neutralino-linux_x64']);
    await installer.install();
    assert.deepEqual(await installer.verify(), []);
});

test('rejects an archive from another revision without replacing installed files', async t => {
    const installer = await fixture(t);
    const binary = join(installer.root, 'bin', 'neutralino-linux_x64');
    await mkdir(join(installer.root, 'bin'));
    await writeFile(binary, 'Keep this file when provenance fails.');
    installer.lock = { ...lock, revision: '0000000000000000000000000000000000000000' };
    await assert.rejects(installer.install(), /does not match the pinned fork revision/);
    assert.equal(await readFile(binary, 'utf8'), 'Keep this file when provenance fails.');
});
