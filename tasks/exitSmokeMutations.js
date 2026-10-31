import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');

const bundlePath = path.join(root, 'resources/js/main.js');
const original = await fs.readFile(bundlePath, 'utf8');
const mutations = [
    {
        label: 'collection flushing removed',
        from: 'managers.map((manager) => manager.flush())',
        to: 'managers.map(() => Promise.resolve())',
        expected: /cleared image to reach disk before the debounce/
    },
    {
        label: 'close-request registration removed',
        from: 'await setupExitHandling();',
        to: 'await Promise.resolve();',
        expected: /shutdown progress modal/
    }
];

try {
    for (const mutation of mutations) {
        assert.ok(original.includes(mutation.from),
                  `Mutation target missing: ${mutation.label}`);
        await fs.writeFile(bundlePath, original.replace(mutation.from, mutation.to));
        const result = await new Promise((resolve, reject) => {
            const child = spawn(process.execPath, ['tasks/exitSmoke.js'], {
                cwd: root, env: { ...process.env, EXIT_SMOKE_CASE: 'window' },
                stdio: ['ignore', 'pipe', 'pipe']
            });
            let output = '';
            child.stdout.on('data', bytes => { output += bytes; });
            child.stderr.on('data', bytes => { output += bytes; });
            child.once('error', reject);
            child.once('close', code => resolve({ code, output }));
        });
        assert.notEqual(result.code, 0, `Smoke test missed: ${mutation.label}`);
        assert.match(result.output, mutation.expected,
                     `Smoke test failed for an unexpected reason: ${result.output}`);
        console.log(`Verified smoke failure: ${mutation.label}`);
    }
} finally {
    await fs.writeFile(bundlePath, original);
}
