import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { waitFor } from '../electron/fixture.js';

async function removeImage(driver) {
    const clicked = await driver.evaluate(`(() => {
        const button = document.querySelector('cm-edit-face-symbol .clear-btn');
        if (!button) return false;
        button.click();
        return true;
    })()`);
    assert.equal(clicked, true, 'The image editor must expose its real clear button.');
    await waitFor(() => driver.evaluate('exitSmoke.pending'),
                  'scheduled image removal', 1000);
}

function modalVisible(driver) {
    return driver.evaluate(`(() => {
        const modal = document.querySelector('cm-progress-modal');
        return !!modal && getComputedStyle(modal.parentElement).display !== 'none';
    })()`);
}

async function readSymbols(folder) {
    return YAML.parse(await fs.readFile(path.join(folder, 'symbols.yml'), 'utf8'));
}

async function verifyFile(folder, embedded) {
    const data = await readSymbols(folder);
    assert.equal(data[0].name, 'Exit smoke symbol');
    assert.equal(!!data[0].image.imageUrl, embedded,
                 'Persisted image bytes are incorrect.');
}

export async function releaseAndWaitForExit(fixture) {
    try {
        await fixture.driver.evaluate('exitSmoke.release()');
    } catch (error) {
        // Releasing the shutdown gate can terminate Electron before CDP replies.
        if (error.message !== 'DevTools connection closed.') throw error;
    }
    await fixture.stopped();
}

async function requestClose(driver, menu) {
    if (!menu) return driver.closePage().catch(() => {});
    await driver.evaluate(`(() => {
        const file = [...document.querySelectorAll('title-bar-menu')]
            .find(element => element.menu.id === 'file');
        [...file.querySelectorAll('sl-menu-item')]
            .find(item => item.value === 'Exit').click();
    })()`);
}

async function closeWithProgress(fixture, folder, menu) {
    const { driver } = fixture;
    await verifyFile(folder, true);
    const debounceDelay = await driver.evaluate('exitSmoke.debounceDelay');
    await removeImage(driver);
    const requested = Date.now();
    await requestClose(driver, menu);
    await waitFor(() => modalVisible(driver), 'shutdown progress modal', 2000);
    assert.ok(Date.now() - requested < debounceDelay,
              'Close was not requested before the debounce.');
    assert.equal(fixture.child.exitCode, null,
                 'The window must stay alive while flushing.');
    await waitFor(async () => !(await readSymbols(folder))[0].image.imageUrl,
                  'the cleared image to reach disk before the debounce', 1500);
    await releaseAndWaitForExit(fixture);
    await verifyFile(folder, false);
}

async function reopen(fixture) {
    assert.equal(await fixture.driver.evaluate('exitSmoke.imageUrl'), null);
    await fixture.driver.evaluate('exitSmoke.release()');
    await fixture.driver.closePage().catch(() => {});
    await fixture.stopped();
}

async function failedSave(fixture, folder) {
    const { driver } = fixture;
    const backup = folder + '.saved';
    let blocked = false;
    try {
        await removeImage(driver);
        await fs.rename(folder, backup);
        await fs.writeFile(folder, 'A real file blocks the collection directory.');
        blocked = true;
        await driver.closePage().catch(() => {});
        await waitFor(() => modalVisible(driver), 'shutdown progress modal');
        await driver.evaluate('exitSmoke.release()');
        await waitFor(() => driver.evaluate(`
            !!document.querySelector('cm-progress-modal.error')
        `), 'save error modal');
        assert.equal(fixture.child.exitCode, null, 'A failed save must prevent exit.');
        await fs.unlink(folder);
        await fs.rename(backup, folder);
        blocked = false;
        await driver.closePage().catch(() => {});
        await fixture.stopped();
        await verifyFile(folder, false);
    } finally {
        if (blocked) {
            await fs.unlink(folder);
            await fs.rename(backup, folder);
        }
    }
}

async function nativeExit(fixture) {
    void fixture.driver.evaluate('void exitSmoke.terminate(); true').catch(() => {});
    await fixture.stopped();
}

export async function runExitSmokeTests({ launchApp }) {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-symbols-'));
    async function scenario(label, test, reload = false) {
        console.log(`Running Exit: ${label}...`);
        const fixture = await launchApp(folder, reload);
        try { await test(fixture, folder); } finally { await fixture.cleanup(); }
    }
    try {
        const selected = process.env.EXIT_SMOKE_CASE;
        for (const menu of [false, true]) {
            if (selected && selected !== (menu ? 'menu' : 'window')) continue;
            await scenario(menu ? 'File menu' : 'window close', fixture => {
                return closeWithProgress(fixture, folder, menu);
            });
        }
        if (selected) return;
        await scenario('reopen persisted collection', reopen, true);
        await scenario('failed write stays open, then retries', failedSave);
        await scenario('direct native exit cleans up browser processes', nativeExit);
    } finally { await fs.rm(folder, { recursive: true, force: true }); }
}
