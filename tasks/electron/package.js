import fs from 'node:fs/promises';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { build } from '../build.js';
import { pluginFolders } from '../../electron/pluginFolders.js';

const stagePath = path.resolve('.tmp/package');
const pluginStagePath = path.resolve('.tmp/package-plugins');
const lockPath = path.resolve('.tmp/package.lock');
const contentFolders = ['scripts'];

function includeFile(sourcePath) {
    const normalizedPath = sourcePath.replaceAll(path.sep, '/');
    return !/(?:^|\/)(?:node_modules|tests|unused)(?:\/|$)/.test(normalizedPath)
        && normalizedPath !== 'extensions/games/magic/src'
        && !/\.(?:map|test\.js|tests\.js|smoke\.js)$/.test(normalizedPath)
        && !/(?:^|\/)(?:package(?:-lock)?\.json|.*config\.js)$/.test(normalizedPath);
}

async function stageApplication() {
    for (const directoryPath of [stagePath, pluginStagePath]) {
        await fs.rm(directoryPath, { recursive: true, force: true });
        await fs.mkdir(directoryPath, { recursive: true });
    }
    const folders = [...pluginFolders, 'electron', 'resources', ...contentFolders];
    for (const folder of folders) {
        const destinationPath = pluginFolders.includes(folder)
            ? pluginStagePath
            : stagePath;
        await fs.cp(folder, path.join(destinationPath, folder), {
            recursive: true,
            filter: includeFile
        });
    }
    await fs.copyFile('LICENSE', path.join(stagePath, 'LICENSE'));
    await writePackageMetadata();
}

async function writePackageMetadata() {
    const metadata = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const {
        name, version, description, author,
        license, homepage, main, type
    } = metadata;
    await fs.writeFile(
        path.join(stagePath, 'package.json'),
        JSON.stringify({
            name, version, description,
            author, license, homepage, main, type,
            dependencies: {},
            desktopName: 'card-magician'
        }, null, 2)
    );
}

async function createInstallers() {
    const cliPath = path.resolve('node_modules/electron-builder/cli.js');
    const args = [cliPath, '--config', 'electron-builder.yml',
                  '--publish', 'never', ...process.argv.slice(2)];
    const child = spawn(process.execPath, args, { stdio: 'inherit' });
    const code = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('close', resolve);
    });
    if (code !== 0) throw new Error(`Installer packaging failed (${code}).`);
}

async function acquireLock() {
    await fs.mkdir(path.dirname(lockPath), { recursive: true });
    try {
        await fs.mkdir(lockPath);
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        throw new Error(
            'Another installer build is using .tmp/package. '
            + 'Run builds sequentially.'
        );
    }
    process.once('exit', () => rmSync(lockPath, { recursive: true, force: true }));
}

await acquireLock();
await build({ minify: true, tests: false });
await stageApplication();
await createInstallers();
