import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, waitFor } from './fixture.js';
import { releaseAndWaitForExit, runExitSmokeTests } from '../dev/exitSmoke.js';

export async function runShutdownTests(temp) {
    let index = 0;
    const launchApp = (folder, reopen = false) => launch({
        profile: path.join(temp, 'exit-profile'), url: '/',
        id: `cardmagician.exit.electron${++index}`,
        args: ['--test-exit', `--exit-test-folder=${folder}`,
               ...(reopen ? ['--exit-test-reopen'] : [])]
    });
    await runExitSmokeTests({ launchApp, waitFor });
    if (!process.env.EXIT_SMOKE_CASE) await testApplicationQuit(launchApp, temp);
}

async function testApplicationQuit(launchApp, temp) {
    console.log('Running Exit: application quit with pending writes...');
    const folder = path.join(temp, 'quit-symbols');
    const fixture = await launchApp(folder);
    try {
        await fixture.driver.evaluate(`
            document.querySelector('cm-edit-face-symbol .clear-btn').click()
        `);
        await fixture.driver.evaluate('cardMagicianNative.call(\'testAppQuit\', [])');
        await waitFor(() => fixture.driver.evaluate(
            '!!document.querySelector(\'cm-progress-modal\')'), 'quit progress modal');
        assert.equal(fixture.child.exitCode, null);
        await releaseAndWaitForExit(fixture);
        const saved = await fs.readFile(path.join(folder, 'symbols.yml'), 'utf8');
        assert.ok(!saved.includes('base64,'));
    } finally { await fixture.cleanup(); }
}
