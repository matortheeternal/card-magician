import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { launchSvgEditor } from './launchSvgEditor.js';

test('requires an absolute executable and reports missing executables', async () => {
    assert.throws(() => launchSvgEditor('editor', '/tmp/icon.svg'), /absolute path/);
    await assert.rejects(
        launchSvgEditor(path.join(os.tmpdir(), 'missing-set-icon-editor', 'editor'),
                        path.join(os.tmpdir(), 'icon.svg')),
        { code: 'ENOENT' }
    );
});

test('passes SVG paths literally and returns while the editor remains open', {
    skip: process.platform === 'win32'
}, async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'svg-editor-'));
    const executable = path.join(folder, 'editor with spaces');
    const output = path.join(folder, 'args.json');
    const filename = path.join(folder, 'set $name; icon.svg');
    try {
        await fs.writeFile(executable, `#!/usr/bin/env node
const fs = require('node:fs');
fs.writeFileSync(${JSON.stringify(output)}, JSON.stringify(process.argv.slice(2)));
setTimeout(() => {}, 300);
`, { mode: 0o755 });
        await launchSvgEditor(executable, filename);
        let args;
        for (let attempt = 0; attempt < 100; attempt++) {
            try {
                args = JSON.parse(await fs.readFile(output, 'utf8'));
                break;
            } catch (error) {
                if (error.code !== 'ENOENT') throw error;
                await new Promise(resolve => { setTimeout(resolve, 20); });
            }
        }
        assert.deepEqual(args, [filename]);
    } finally {
        await fs.rm(folder, { recursive: true, force: true });
    }
});
