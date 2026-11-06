import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { crc32 } from 'node:zlib';
import ExtensionRegistry, { validateArchive, registryOrigin }
    from './ExtensionRegistry.js';

function zip(files) {
    const local = [];
    const directory = [];
    let offset = 0;
    for (const [filename, text] of Object.entries(files)) {
        const name = Buffer.from(filename);
        const bytes = Buffer.from(text);
        const header = Buffer.alloc(30);
        header.writeUInt32LE(0x04034b50);
        header.writeUInt16LE(20, 4);
        header.writeUInt32LE(crc32(bytes), 14);
        header.writeUInt32LE(bytes.length, 18);
        header.writeUInt32LE(bytes.length, 22);
        header.writeUInt16LE(name.length, 26);
        local.push(header, name, bytes);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50);
        central.writeUInt16LE(20, 4);
        central.writeUInt16LE(20, 6);
        central.writeUInt32LE(crc32(bytes), 16);
        central.writeUInt32LE(bytes.length, 20);
        central.writeUInt32LE(bytes.length, 24);
        central.writeUInt16LE(name.length, 28);
        central.writeUInt32LE(offset, 42);
        directory.push(central, name);
        offset += header.length + name.length + bytes.length;
    }
    const end = Buffer.alloc(22);
    const central = Buffer.concat(directory);
    end.writeUInt32LE(0x06054b50);
    end.writeUInt16LE(directory.length / 2, 8);
    end.writeUInt16LE(directory.length / 2, 10);
    end.writeUInt32LE(central.length, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat([...local, central, end]);
}

function archive(extra = {}, metadata = { id: 'magic/Frame', version: '0.1',
    gameId: 'magic' }) {
    const root = 'magic/cardparts/magic/Frame/';
    return zip({
        [root + 'module.json']: JSON.stringify(metadata),
        [root + 'main.js']: 'export default {};', ...extra
    });
}

async function fixture(t) {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-registry-install-'));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    const environment = { version: '1.0.1', paths: {
        plugins: path.join(directory, 'bundle'),
        userExtensions: path.join(directory, 'user')
    } };
    let bytes = archive();
    let state = 'published';
    let badHash = false;
    const registry = new ExtensionRegistry(environment, async url => {
        if (url.includes('/v1/packages/')) return new Response(bytes);
        return Response.json({ version: '0.1.0', state,
            metadata: { id: 'magic/Frame' },
            downloadUrl: registryOrigin + '/v1/packages/abc',
            size: bytes.length,
            sha256: badHash ? 'wrong'
                : createHash('sha256').update(bytes).digest('hex') });
    });
    return { registry, environment, change: changes => {
        if (changes.bytes) bytes = changes.bytes;
        if (changes.state) state = changes.state;
        if (changes.badHash !== undefined) badHash = changes.badHash;
    } };
}

test('installs into user paths and preserves bundled files', async t => {
    const { registry, environment, change } = await fixture(t);
    const bundled = path.join(environment.paths.plugins,
                              'extensions/cardparts/magic/Frame');
    await fs.mkdir(bundled, { recursive: true });
    await fs.writeFile(path.join(bundled, 'module.json'),
                       JSON.stringify({ id: 'magic/Frame', version: '0.0' }));
    await registry.install('magic/Frame', 'cardpart', '0.1.0');
    const target = path.join(environment.paths.userExtensions, 'cardparts/magic/Frame');
    assert.equal(await fs.readFile(path.join(target, 'main.js'), 'utf8'),
                 'export default {};');
    const installed = (await registry.installed()).extensions[0];
    assert.equal(installed.bundled, false);
    assert.equal(installed.hasBundled, true);
    change({ badHash: true });
    await assert.rejects(() => registry.install('magic/Frame', 'cardpart', '0.1.0'),
                         /integrity/);
    assert.equal(await fs.readFile(path.join(target, 'main.js'), 'utf8'),
                 'export default {};');
    await registry.uninstall('magic/Frame', 'cardpart');
    assert.equal((await registry.installed()).extensions[0].bundled, true);
    assert.equal(JSON.parse(await fs.readFile(path.join(bundled, 'module.json')))
        .version, '0.0');
});

test('rejects revoked releases, unsafe paths and wrong identities', async t => {
    const { registry, change } = await fixture(t);
    change({ state: 'revoked' });
    await assert.rejects(() => registry.install('magic/Frame', 'cardpart', '0.1.0'),
                         /no longer available/);
    for (const extra of [
        { 'magic/cardparts/magic/Frame/../../escape.js': 'bad' },
        { 'magic/cardparts/magic/Frame/MAIN.JS': 'collision' },
        { 'elsewhere/main.js': 'bad' },
        { 'magic/cardparts/magic/Frame/nested/game.json': '{}' }
    ]) {
        await assert.rejects(() => validateArchive(archive(extra), 'magic/Frame',
                                                   'cardpart', '0.1.0'));
    }
    await assert.rejects(() => validateArchive(archive({}, {
        id: 'wrong', version: '0.1'
    }), 'magic/Frame', 'cardpart', '0.1.0'), /identity/);
});

test('rejects symlink targets and non-registry URLs', async t => {
    const { registry, environment } = await fixture(t);
    await fs.mkdir(path.join(environment.paths.userExtensions, 'cardparts'),
                   { recursive: true });
    const outside = path.join(environment.paths.plugins, 'outside');
    await fs.mkdir(outside, { recursive: true });
    await fs.symlink(outside,
                     path.join(environment.paths.userExtensions, 'cardparts/magic'));
    await assert.rejects(() => registry.install('magic/Frame', 'cardpart', '0.1.0'),
                         /regular directory/);
    await assert.rejects(() => registry.request('https://example.com/v1/extensions'),
                         /Invalid registry endpoint/);
    await assert.rejects(() => registry.uninstall('../outside', 'cardpart'),
                         /identity/);
});


test('rejects replacing a group folder containing other extensions', async t => {
    const { registry, environment } = await fixture(t);
    await fs.mkdir(path.join(environment.paths.userExtensions,
                             'cardparts/magic/Frame'), { recursive: true });
    await assert.rejects(() => registry.target('magic', 'cardpart'), /overlap/);
});

test('restores an existing installation when staging replacement fails', async t => {
    const { registry, environment, change } = await fixture(t);
    await registry.install('magic/Frame', 'cardpart', '0.1.0');
    change({ bytes: archive({ 'magic/cardparts/magic/Frame/main.js': 'updated' }) });
    const rename = fs.rename.bind(fs);
    t.mock.method(fs, 'rename', async (source, destination) => {
        if (path.basename(source) === 'new') throw new Error('Expected rename failure');
        return rename(source, destination);
    });
    await assert.rejects(() => registry.install('magic/Frame', 'cardpart', '0.1.0'),
                         /Expected rename failure/);
    const target = await registry.target('magic/Frame', 'cardpart');
    assert.equal(await fs.readFile(path.join(target, 'main.js'), 'utf8'),
                 'export default {};');
    assert.deepEqual(await fs.readdir(environment.paths.userExtensions), ['cardparts']);
});

test('preserves the backup when installation rollback fails', async t => {
    const { registry, environment } = await fixture(t);
    await registry.install('magic/Frame', 'cardpart', '0.1.0');
    const rename = fs.rename.bind(fs);
    t.mock.method(fs, 'rename', async (source, destination) => {
        if (['new', 'old'].includes(path.basename(source)))
            throw new Error('Expected rename failure');
        return rename(source, destination);
    });
    await assert.rejects(() => registry.install('magic/Frame', 'cardpart', '0.1.0'),
                         /Restore failed. Previous files:/);
    const entries = await fs.readdir(environment.paths.userExtensions);
    const temporary = entries.find(name => name.startsWith('.registry-'));
    assert.ok(temporary);
    const backup = path.join(environment.paths.userExtensions, temporary, 'old/main.js');
    assert.equal(await fs.readFile(backup, 'utf8'), 'export default {};');
});

test('warns about invalid metadata while finding other installed extensions', async t => {
    const { registry, environment } = await fixture(t);
    await registry.install('magic/Frame', 'cardpart', '0.1.0');
    const broken = path.join(environment.paths.userExtensions, 'templates/broken');
    await fs.mkdir(broken, { recursive: true });
    await fs.writeFile(path.join(broken, 'template.json'), '{');
    const inventory = await registry.installed();
    assert.deepEqual(inventory.extensions.map(extension => extension.id),
                     ['magic/Frame']);
    assert.deepEqual(inventory.warnings, [`Could not read ${broken}`]);
});
