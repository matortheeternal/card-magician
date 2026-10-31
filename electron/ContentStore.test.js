import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ContentStore from './ContentStore.js';
import { writeFile } from './atomicFile.js';

test('content upgrades preserve edits and custom files', async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-content-'));
    const source = path.join(temp, 'bundle');
    const destination = path.join(temp, 'content');
    const bundled = file => path.join(source, 'templates', file);
    const installed = file => path.join(destination, 'templates', file);
    try {
        const folders = [
            'modules', 'games', 'templates', 'exporters', 'scripts', 'locales'
        ];
        for (const folder of folders)
            await fs.mkdir(path.join(source, folder), { recursive: true });
        for (const file of ['unchanged', 'edited', 'removed', 'removed-edited'])
            await fs.writeFile(bundled(file), 'version one');
        await new ContentStore(source, destination, '1').update();
        await fs.writeFile(installed('edited'), 'user edit');
        await fs.writeFile(installed('removed-edited'), 'user edit');
        await fs.writeFile(installed('custom'), 'custom template');
        await fs.writeFile(bundled('unchanged'), 'version two');
        await fs.writeFile(bundled('edited'), 'version two');
        await fs.writeFile(bundled('new'), 'new template');
        await fs.rm(bundled('removed'));
        await fs.rm(bundled('removed-edited'));
        await new ContentStore(source, destination, '2').update();
        assert.equal(await fs.readFile(installed('unchanged'), 'utf8'), 'version two');
        assert.equal(await fs.readFile(installed('edited'), 'utf8'), 'user edit');
        assert.equal(await fs.readFile(installed('removed-edited'), 'utf8'), 'user edit');
        assert.equal(await fs.readFile(installed('custom'), 'utf8'), 'custom template');
        assert.equal(await fs.readFile(installed('new'), 'utf8'), 'new template');
        await assert.rejects(fs.readFile(installed('removed')), { code: 'ENOENT' });
        // A later bundled update must still recognize an earlier user edit.
        await fs.writeFile(bundled('edited'), 'version three');
        await new ContentStore(source, destination, '3').update();
        assert.equal(await fs.readFile(installed('edited'), 'utf8'), 'user edit');
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
});

test('failed replacement preserves contents and cleans up', async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-atomic-'));
    try {
        const target = path.join(temp, 'existing');
        await fs.mkdir(target);
        await fs.writeFile(path.join(target, 'keep'), 'existing contents');
        await assert.rejects(writeFile(target, 'new contents'));
        const contents = await fs.readFile(path.join(target, 'keep'), 'utf8');
        assert.equal(contents, 'existing contents');
        assert.deepEqual(await fs.readdir(temp), ['existing']);
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
});
