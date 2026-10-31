import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import FileSystem from './FileSystem.js';
import { pluginFolders } from './pluginFolders.js';

test('plugins use installed files instead of profile copies', async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-plugins-'));
    const plugins = path.join(temp, 'installation');
    const content = path.join(temp, 'profile');
    const files = new FileSystem(content, plugins);
    try {
        for (const folder of pluginFolders) {
            await fs.mkdir(path.join(plugins, folder), { recursive: true });
            await fs.mkdir(path.join(content, folder), { recursive: true });
            await fs.writeFile(path.join(plugins, folder, 'example.txt'), 'installed');
            await fs.writeFile(path.join(content, folder, 'example.txt'), 'stale copy');
            assert.equal(await files.readFile(`./${folder}/example.txt`), 'installed');
            await files.writeFile(`${folder}/example.txt`, 'edited');
            const edited = await fs.readFile(path.join(plugins, folder, 'example.txt'),
                                             'utf8');
            assert.equal(edited, 'edited');
        }
        await fs.mkdir(path.join(content, 'games-backup'));
        const backup = path.join(content, 'games-backup/example.txt');
        await fs.writeFile(backup, 'profile file');
        assert.equal(await files.readFile('games-backup/example.txt'), 'profile file');
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
});
