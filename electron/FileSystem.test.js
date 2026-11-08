import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import FileSystem from './FileSystem.js';

test(
    'relative extension paths use the content root like other relative paths',
    async () => {
        const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-paths-'));
        const content = path.join(temp, 'profile');
        const external = path.join(temp, 'external-extensions');
        const files = new FileSystem(content);
        try {
            await fs.mkdir(path.join(content, 'extensions'), { recursive: true });
            await fs.mkdir(external);
            await fs.writeFile(path.join(content, 'extensions/example.txt'), 'content');
            await fs.writeFile(path.join(external, 'example.txt'), 'external');
            assert.equal(await files.readFile('./extensions/example.txt'), 'content');
            assert.equal(
                await files.readFile(path.join(external, 'example.txt')), 'external'
            );
        } finally { await fs.rm(temp, { recursive: true, force: true }); }
    });

test('existence checks distinguish files, folders, and missing paths', async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-exists-'));
    const files = new FileSystem(temp);
    try {
        await fs.writeFile(path.join(temp, 'file'), 'contents');
        await fs.mkdir(path.join(temp, 'folder'));
        assert.equal(await files.checkFileExists('file'), true);
        assert.equal(await files.checkFolderExists('folder'), true);
        assert.equal(await files.checkFileExists('folder'), false);
        assert.equal(await files.checkFolderExists('file'), false);
        for (const missing of ['missing', 'missing/child', 'file/child']) {
            assert.equal(await files.checkFileExists(missing), false);
            assert.equal(await files.checkFolderExists(missing), false);
        }
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
});
