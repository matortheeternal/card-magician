import fs from 'node:fs/promises';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { build } from './build.js';

const EXCLUDED_DIRECTORY_PATTERN = /(?:^|\/)(?:node_modules|tests|unused)(?:\/|$)/;
const EXCLUDED_EXTENSION_PATTERN = /\.(?:map|test\.js|tests\.js|smoke\.js)$/;
const EXCLUDED_METADATA_PATTERN = /(?:^|\/)(?:package(?:-lock)?\.json|.*config\.js)$/;

const SUPPORTED_PLATFORM_ARGS = ['--linux', '--win', '--mac'];
const ELECTRON_BUILDER_COMPRESSION_LEVEL = 6;
const EXTENSION_BUNDLE_SOURCE = 'extensions';
const EXTENSION_BUNDLE_OUTPUT_DIRECTORY = 'dist';
const stagePath = path.resolve('dist/.staging/package');
const lockPath = path.resolve('dist/.staging/package.lock');

function includeFile(sourcePath) {
    const normalizedPath = sourcePath.replaceAll(path.sep, '/');
    return !EXCLUDED_DIRECTORY_PATTERN.test(normalizedPath)
        && !EXCLUDED_EXTENSION_PATTERN.test(normalizedPath)
        && !EXCLUDED_METADATA_PATTERN.test(normalizedPath);
}

async function stageApplication() {
    await fs.rm(stagePath, { recursive: true, force: true });
    await fs.mkdir(stagePath, { recursive: true });
    for (const folder of ['electron', 'resources']) {
        await fs.cp(folder, path.join(stagePath, folder), {
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

function checkPlatform(arg) {
    if (SUPPORTED_PLATFORM_ARGS.includes(arg)) return;
    throw new Error(`Unknown release argument: ${arg}.`);
}

function getReleasePlatforms(args, host = process.platform) {
    if (args.length === 0) {
        const defaults = { linux: '--linux', win32: '--win', darwin: '--mac' };
        if (!Object.hasOwn(defaults, host))
            throw new Error(`Unsupported release host: ${host}`);
        return [defaults[host].slice(2)];
    }
    for (const arg of args)
        checkPlatform(arg);
    return [...new Set(args.map(arg => arg.slice(2)))];
}

async function createInstallers(platforms) {
    for (const platform of platforms)
        await createPlatformInstallers(platform);
}

async function createPlatformInstallers(platform) {
    const cliPath = path.resolve('node_modules/electron-builder/cli.js');
    const args = [cliPath, '--config', `electron-builder.${platform}.yml`,
                  '--publish', 'never', `--${platform}`];
    const env = {
        ...process.env,
        ELECTRON_BUILDER_COMPRESSION_LEVEL
    };
    const child = spawn(process.execPath, args, { stdio: 'inherit', env });
    const code = await waitForExit(child);
    if (code !== 0) throw new Error(`${platform} installer packaging failed (${code}).`);
}

function waitForExit(child) {
    return new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('close', resolve);
    });
}

function getReleaseDate(date = new Date()) {
    const year = String(date.getFullYear() % 100).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function createExtensionBundle() {
    const outputDirectory = EXTENSION_BUNDLE_OUTPUT_DIRECTORY;
    const basename = path.join(outputDirectory, `magic-${getReleaseDate()}`);
    await fs.mkdir(outputDirectory, { recursive: true });
    const command = `cmpack pack ${EXTENSION_BUNDLE_SOURCE} `
        + `--bundle --force --output "${basename}"`;
    const child = spawn(command, { stdio: 'inherit', shell: true });
    const code = await waitForExit(child);
    if (code !== 0)
        throw new Error(`Extension bundle failed (${code}). Is cmpack installed?`);
}

async function acquireLock() {
    await fs.mkdir(path.dirname(lockPath), { recursive: true });
    try {
        await fs.mkdir(lockPath);
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        throw new Error(
            'Another installer build is using dist/.staging/package. '
            + 'Run builds sequentially.'
        );
    }
    process.once('exit', () => rmSync(lockPath, { recursive: true, force: true }));
}

const platforms = getReleasePlatforms(process.argv.slice(2));
await acquireLock();
await build({ minify: true, tests: false });
await createExtensionBundle();
await stageApplication();
await createInstallers(platforms);
