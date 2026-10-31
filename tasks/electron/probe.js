import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, withTestProfile } from './fixture.js';

const outputArgument = process.argv.find(arg => arg.startsWith('--output='));
const output = path.resolve(outputArgument?.slice('--output='.length)
    ?? '.tmp/electron-evidence');

async function verifyBridge(driver, profile) {
    const denied = await driver.evaluate(`cardMagicianNative.call('notAnOperation', [])`);
    assert.equal(denied.error.code, 'ACCESS_DENIED');
    const module = await driver.evaluate(`fetch('/games/magic/main.js').then(r => ({
        status: r.status, type: r.headers.get('content-type')
    }))`);
    assert.equal(module.status, 200);
    assert.match(module.type, /javascript/);
    if (process.env.ELECTRON_SMOKE_BINARY) await verifyLoosePlugins(driver, profile);
    if (process.platform !== 'win32') await verifyMountContainment(driver, profile);
}

async function verifyLoosePlugins(driver, profile) {
    const paths = await driver.evaluate('appEnvironment.paths');
    const binary = await fs.realpath(process.env.ELECTRON_SMOKE_BINARY);
    assert.equal(await fs.realpath(paths.plugins), path.dirname(binary),
                 'Plugins must be installed beside the executable.');
    for (const folder of ['games', 'modules', 'exporters', 'templates']) {
        assert.ok((await fs.stat(path.join(paths.plugins, folder))).isDirectory());
        await assert.rejects(fs.access(path.join(paths.content, folder)), {
            code: 'ENOENT'
        });
    }
    const name = `${path.basename(profile)}.txt`;
    const filename = path.join(paths.plugins, 'games', name);
    const text = 'Loaded directly from the installed plugin folder';
    try {
        await fs.writeFile(filename, text);
        const result = await driver.evaluate(`cardMagicianNative.call('readFile', [
            ${JSON.stringify(`games/${name}`)}
        ])`);
        assert.equal(result.value, text);
        const fetched = await driver.evaluate(`fetch(
            ${JSON.stringify(`/games/${name}`)}
        ).then(response => response.text())`);
        assert.equal(fetched, text);
    } finally { await fs.rm(filename, { force: true }); }
}

async function verifyMountContainment(driver, profile) {
    const mount = path.join(profile, 'public');
    const privateFile = path.join(profile, 'private.txt');
    await fs.mkdir(mount);
    await fs.writeFile(privateFile, 'Private file outside the mount');
    await fs.symlink(privateFile, path.join(mount, 'escape.txt'));
    await driver.evaluate(`cardMagicianNative.call('mount', [
        '/containment-test', ${JSON.stringify(mount)}
    ])`);
    const changing = path.join(mount, 'changing.txt');
    const readChanging = () => driver.evaluate(`
        fetch('/containment-test/changing.txt').then(response => response.text())
    `);
    await fs.writeFile(changing, 'first');
    assert.equal(await readChanging(), 'first');
    await fs.writeFile(changing, 'second');
    assert.equal(await readChanging(), 'second', 'Mounted resources must not be stale.');
    const status = await driver.evaluate(`
        fetch('/containment-test/escape.txt').then(response => response.status)
    `);
    assert.equal(status, 403, 'Resource mounts must reject symlink escapes.');
}

async function saveArtifacts(driver, profile, evidence) {
    await fs.mkdir(output, { recursive: true });
    const screenshot = await driver.send('Page.captureScreenshot', {}, driver.session);
    await fs.writeFile(path.join(output, 'window.png'),
                       Buffer.from(screenshot.data, 'base64'));
    await fs.copyFile(path.join(profile, 'data/feasibility-card.png'),
                      path.join(output, 'card.png'));
    const json = JSON.stringify(evidence, null, 2) + '\n';
    await fs.writeFile(path.join(output, 'metrics.json'), json);
}

await withTestProfile('probe', async profile => {
    const started = performance.now();
    const fixture = await launch({
        profile, url: '/', id: 'cardmagician.feasibility.electron',
        args: ['--test-feasibility']
    });
    try {
        const { driver } = fixture;
        const evidence = await driver.evaluate('window.feasibility');
        evidence.launchThroughExportMs = performance.now() - started;
        assert.ok(evidence.export.bytes > 1000);
        assert.ok(evidence.export.width > 300 && evidence.export.height > 400);
        const metrics = await driver.evaluate(
            `cardMagicianNative.call('testMetrics', [])`
        );
        evidence.processes = metrics.value;
        evidence.totalWorkingSetMiB = evidence.processes.reduce((sum, item) => {
            return sum + item.memory.workingSetSize;
        }, 0) / 1024;
        await verifyBridge(driver, profile);
        await saveArtifacts(driver, profile, evidence);
        console.log(JSON.stringify({ output, export: evidence.export,
            uiReadyMs: evidence.uiReadyMs,
            launchThroughExportMs: evidence.launchThroughExportMs,
            totalWorkingSetMiB: evidence.totalWorkingSetMiB }, null, 2));
        await driver.evaluate(`cardMagicianNative.call('testWindowClose', [])`);
        await fixture.stopped();
    } finally { await fixture.cleanup(); }
});
