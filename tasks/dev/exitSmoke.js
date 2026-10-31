import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import YAML from 'yaml';
import ChromeDriver from './chromeDriver.js';
import { root } from './testHelpers.js';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(check, label, timeout = 15000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        const value = await check();
        if (value) return value;
        await pause(50);
    }
    throw new Error(`Timed out waiting for ${label}`);
}

function alive(pid) {
    try { process.kill(pid, 0); return true; }
    catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}

function binaryPath() {
    if (process.env.NEUTRALINO_BINARY) return process.env.NEUTRALINO_BINARY;
    const platform = { linux: 'linux', darwin: 'mac', win32: 'win' }[process.platform];
    const suffix = process.platform === 'win32' ? '.exe' : '';
    return path.join(root, 'bin', `neutralino-${platform}_${process.arch}${suffix}`);
}

async function launch(folder, reopen = false) {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-exit-'));
    const id = `cardmagician.exit.${path.basename(temp).slice('card-magician-exit-'.length)}`;
    const configPath = path.join(root, '.tmp', `${id}.json`);
    const profile = path.join(temp, 'chrome');
    const config = JSON.parse(await fs.readFile(path.join(root, 'neutralino.config.json')));
    config.applicationId = id;
    config.logging.writeToLogFile = false;
    config.modes.chrome.userDataDir = profile;
    if (process.env.CHROME_NO_SANDBOX === '1') config.modes.chrome.args += ' --no-sandbox';
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config));
    const child = spawn(binaryPath(), [
        '--load-dir-res', `--path=${root}`,
        `--config-file=/.tmp/${id}.json`, '--url=/tests/exit.html',
        '--test-exit', `--exit-test-folder=${folder}`,
        ...(reopen ? ['--exit-test-reopen'] : [])
    ], { cwd: root, detached: process.platform !== 'win32',
        env: { ...process.env, XDG_DATA_HOME: path.join(temp, 'data') },
        stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', bytes => { output += bytes; });
    child.stderr.on('data', bytes => { output += bytes; });
    let spawnError;
    child.on('error', error => { spawnError = error; });
    let driver;
    let browserPids = [];
    const fixture = {
        child,
        get driver() { return driver; },
        async stopped() {
            await waitFor(async () => child.exitCode !== null, 'Neutralino exit', 5000);
            assert.equal(child.exitCode, 0, output);
            await waitFor(async () => browserPids.every(pid => !alive(pid)),
                'owned Chrome processes to exit', 5000);
        },
        async cleanup() {
            if (driver?.socket.readyState === 1)
                await driver.send('Browser.close').catch(() => {});
            if (child.exitCode === null) {
                if (process.platform !== 'win32') {
                    try { process.kill(-child.pid, 'SIGTERM'); }
                    catch (error) { if (error.code !== 'ESRCH') throw error; }
                } else child.kill();
            }
            driver?.disconnect();
            await fs.rm(configPath, { force: true });
            await fs.rm(temp, { recursive: true, force: true });
        }
    };
    try {
        const activePort = await waitFor(async () => {
            if (spawnError) throw spawnError;
            if (child.exitCode !== null) throw new Error(`Neutralino exited early: ${output}`);
            try {
                const lines = (await fs.readFile(path.join(profile, 'DevToolsActivePort'),
                    'utf8')).trim().split('\n');
                return lines.length === 2 ? lines : false;
            } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
        }, 'private Chrome endpoint');
        if (process.env.DEBUG_EXIT) console.log('Targets', await (await fetch(`http://127.0.0.1:${activePort[0]}/json`)).json());
        driver = await ChromeDriver.connect(`ws://127.0.0.1:${activePort[0]}${activePort[1]}`);
        await waitFor(() => driver.attach(), 'application page');
        await waitFor(() => driver.evaluate('!!window.exitSmoke'), 'application startup');
        const { processInfo } = await driver.send('SystemInfo.getProcessInfo');
        browserPids = processInfo.map(info => info.id);
        assert.equal(await driver.evaluate('window.NL_CHROME_CLOSE_GUARD'), true,
            'The test requires the close-intercepting Neutralino binary.');
        return fixture;
    } catch (error) {
        await fixture.cleanup();
        throw new Error(`${error.message}\n${output}\n${JSON.stringify(driver?.errors)}`);
    }
}

async function removeImage(driver) {
    assert.equal(await driver.evaluate(`(() => {
        const button = document.querySelector('cm-edit-face-symbol .clear-btn');
        if (!button) return false;
        button.click();
        return true;
    })()`), true, 'The image editor must expose its real clear button.');
    await waitFor(() => driver.evaluate('exitSmoke.pending'), 'scheduled image removal', 1000);
}

async function modalVisible(driver) {
    return driver.evaluate(`(() => {
        const modal = document.querySelector('cm-progress-modal');
        return !!modal && getComputedStyle(modal.parentElement).display !== 'none';
    })()`);
}

async function verifyFile(folder, embedded) {
    const text = await fs.readFile(path.join(folder, 'symbols.yml'), 'utf8');
    const data = YAML.parse(text);
    assert.equal(data[0].name, 'Exit smoke symbol');
    assert.equal(!!data[0].image.imageUrl, embedded, 'Persisted image bytes are incorrect.');
}

async function closeWithProgress(fixture, folder, menu = false) {
    const { driver } = fixture;
    await verifyFile(folder, true);
    await removeImage(driver);
    const requested = Date.now();
    if (menu) {
        await driver.evaluate(`(() => {
            const menus = [...document.querySelectorAll('title-bar-menu')];
            const file = menus.find(element => element.menu.id === 'file');
            [...file.querySelectorAll('sl-menu-item')]
                .find(item => item.value === 'Exit').click();
        })()`);
    } else {
        void driver.closePage().catch(() => {});
    }
    await waitFor(() => modalVisible(driver), 'shutdown progress modal', 2000);
    assert.ok(Date.now() - requested < 3000, 'Close was not requested before the debounce.');
    assert.equal(fixture.child.exitCode, null, 'The window must stay alive while flushing.');
    await waitFor(async () => {
        const text = await fs.readFile(path.join(folder, 'symbols.yml'), 'utf8');
        return !YAML.parse(text)[0].image.imageUrl;
    }, 'the cleared image to reach disk before the debounce', 1500);
    await driver.evaluate('exitSmoke.release()');
    await fixture.stopped();
    await verifyFile(folder, false);
}

export async function runExitSmokeTests() {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'card-magician-symbols-'));
    try {
        const selected = process.env.EXIT_SMOKE_CASE;
        for (const menu of [false, true]) {
            if (selected && selected !== (menu ? 'menu' : 'window')) continue;
            console.log(`Running Exit: ${menu ? 'File menu' : 'window close'}...`);
            const fixture = await launch(folder);
            try { await closeWithProgress(fixture, folder, menu); }
            finally { await fixture.cleanup(); }
        }
        if (selected) { console.log('Exit smoke test passed.'); return; }
        console.log('Running Exit: reopen persisted collection...');
        const reopened = await launch(folder, true);
        try {
            assert.equal(await reopened.driver.evaluate('exitSmoke.imageUrl'), null);
            await reopened.driver.evaluate('exitSmoke.release()');
            void reopened.driver.closePage().catch(() => {});
            await reopened.stopped();
        } finally { await reopened.cleanup(); }

        console.log('Running Exit: failed write stays open, then retries...');
        const failed = await launch(folder);
        const backup = folder + '.saved';
        let blocked = false;
        try {
            await removeImage(failed.driver);
            await fs.rename(folder, backup);
            await fs.writeFile(folder, 'A real file blocks the collection directory.');
            blocked = true;
            void failed.driver.closePage().catch(() => {});
            await waitFor(() => modalVisible(failed.driver), 'shutdown progress modal');
            await failed.driver.evaluate('exitSmoke.release()');
            await waitFor(() => failed.driver.evaluate(
                "!!document.querySelector('cm-progress-modal.error')"), 'save error modal');
            assert.equal(failed.child.exitCode, null, 'A failed save must prevent exit.');
            await fs.unlink(folder);
            await fs.rename(backup, folder);
            blocked = false;
            void failed.driver.closePage().catch(() => {});
            await failed.stopped();
            await verifyFile(folder, false);
        } finally {
            await failed.cleanup();
            if (blocked) { await fs.unlink(folder); await fs.rename(backup, folder); }
        }

        console.log('Running Exit: app.exit cleans up its Chrome processes...');
        const direct = await launch(folder);
        try {
            void direct.driver.evaluate('void exitSmoke.terminate(); true').catch(() => {});
            await direct.stopped();
        } finally { await direct.cleanup(); }
        console.log('Exit smoke tests passed.');
    } finally { await fs.rm(folder, { recursive: true, force: true }); }
}
