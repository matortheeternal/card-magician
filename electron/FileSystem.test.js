import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import FileSystem from './FileSystem.js';

test('plugins use installed files instead of profile copies', async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-plugins-'));
    const plugins = path.join(temp, 'installation');
    const content = path.join(temp, 'profile');
    const files = new FileSystem(content, plugins);
    try {
        await fs.mkdir(path.join(plugins, 'extensions'), { recursive: true });
        await fs.mkdir(path.join(content, 'extensions'), { recursive: true });
        const installed = path.join(plugins, 'extensions/example.txt');
        await fs.writeFile(installed, 'installed');
        await fs.writeFile(path.join(content, 'extensions/example.txt'), 'stale copy');
        assert.equal(await files.readFile('./extensions/example.txt'), 'installed');
        await files.writeFile('extensions/example.txt', 'edited');
        assert.equal(await fs.readFile(installed, 'utf8'), 'edited');
        await fs.mkdir(path.join(content, 'games-backup'));
        const backup = path.join(content, 'games-backup/example.txt');
        await fs.writeFile(backup, 'profile file');
        assert.equal(await files.readFile('games-backup/example.txt'), 'profile file');
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
