import fs from 'node:fs/promises';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { build } from '../build.js';

const stage = path.resolve('.tmp/package');
const lock = path.resolve('.tmp/package.lock');
const contentFolders = [
    'modules', 'templates', 'games', 'exporters', 'scripts', 'locales'
];

function includeFile(source) {
    const normalized = source.replaceAll(path.sep, '/');
    return !/(?:^|\/)(?:node_modules|tests|unused)(?:\/|$)/.test(normalized)
        && normalized !== 'games/magic/src'
        && !/\.(?:map|tests\.js|smoke\.js)$/.test(normalized)
        && !/(?:^|\/)(?:package(?:-lock)?\.json|.*config\.js)$/.test(normalized);
}

async function stageApplication() {
    await fs.rm(stage, { recursive: true, force: true });
    await fs.mkdir(stage, { recursive: true });
    for (const folder of ['electron', 'resources', ...contentFolders]) {
        await fs.cp(folder, path.join(stage, folder), { recursive: true,
            filter: source => includeFile(source) && !source.endsWith('.test.js') });
    }
    await fs.copyFile('LICENSE', path.join(stage, 'LICENSE'));
    const metadata = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const { name, version, description, author, license, homepage, main, type }
        = metadata;
    await fs.writeFile(path.join(stage, 'package.json'), JSON.stringify({
        name, version, description, author, license, homepage, main, type,
        dependencies: {}, desktopName: 'card-magician'
    }, null, 2));
}

async function createInstallers() {
    const cli = path.resolve('node_modules/electron-builder/cli.js');
    const args = [cli, '--config', 'electron-builder.yml',
                  '--publish', 'never', ...process.argv.slice(2)];
    const child = spawn(process.execPath, args, { stdio: 'inherit' });
    const code = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('close', resolve);
    });
    if (code !== 0) throw new Error(`Installer packaging failed (${code}).`);
}

await fs.mkdir(path.dirname(lock), { recursive: true });
try {
    await fs.mkdir(lock);
} catch (error) {
    if (error.code === 'EEXIST') {
        throw new Error('Another installer build is using .tmp/package. '
            + 'Run builds sequentially.');
    }
    throw error;
}
const cleanupLock = () => rmSync(lock, { recursive: true, force: true });
process.once('exit', cleanupLock);
try {
    await build({ minify: true, tests: false });
    await stageApplication();
    await createInstallers();
} finally {
    process.removeListener('exit', cleanupLock);
    await fs.rm(lock, { recursive: true, force: true });
}
