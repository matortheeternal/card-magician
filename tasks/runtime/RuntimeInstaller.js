import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { access, chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { unzip } from 'unzipit';

const sha256 = data => createHash('sha256').update(data).digest('hex');

async function fileMatches(filePath, checksum) {
    try { return sha256(await readFile(filePath)) === checksum; }
    catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

async function executableMatches(filePath) {
    if (process.platform === 'win32') return true;
    try { await access(filePath, constants.X_OK); return true; }
    catch (error) {
        if (['ENOENT', 'EACCES'].includes(error.code)) return false;
        throw error;
    }
}

async function replaceFile(filePath, data, executable = false) {
    await mkdir(dirname(filePath), { recursive: true });
    const temporary = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(temporary, data);
    if (executable && process.platform !== 'win32') await chmod(temporary, 0o755);
    await rename(temporary, filePath);
}

/** Installs the exact runtime/client bytes recorded in neutralino.lock.json. */
export default class RuntimeInstaller {
    constructor(root, lock) {
        this.root = root;
        this.lock = lock;
        this.cache = join(root, '.tmp', 'neutralino-runtime');
    }

    async download(asset) {
        const cachePath = join(this.cache, asset.sha256);
        if (await fileMatches(cachePath, asset.sha256)) return readFile(cachePath);
        console.log(`Downloading ${asset.url}`);
        const response = await fetch(asset.url, { signal: AbortSignal.timeout(120000) });
        if (!response.ok) throw new Error(`Download failed: ${response.status} ${asset.url}`);
        const data = Buffer.from(await response.arrayBuffer());
        if (sha256(data) !== asset.sha256)
            throw new Error(`SHA-256 mismatch: ${asset.url}`);
        await replaceFile(cachePath, data);
        return data;
    }

    async verify() {
        const missing = [];
        for (const [name, checksum] of Object.entries(this.lock.binaries)) {
            const filePath = join(this.root, 'bin', name);
            if (!await fileMatches(filePath, checksum) || !await executableMatches(filePath))
                missing.push(`bin/${name}`);
        }
        for (const [filePath, asset] of Object.entries(this.lock.client.files)) {
            if (!await fileMatches(join(this.root, filePath), asset.sha256))
                missing.push(filePath);
        }
        return missing;
    }

    async installRuntime() {
        const archive = await this.download(this.lock.archive);
        const { entries } = await unzip(archive);
        const metadata = await entries['runtime.json']?.json();
        if (metadata?.revision !== this.lock.revision
                || metadata?.tag !== this.lock.tag
                || metadata?.repository !== this.lock.repository)
            throw new Error('Runtime archive does not match the pinned fork revision.');

        const binaries = [];
        for (const [name, checksum] of Object.entries(this.lock.binaries)) {
            if (!entries[name]) throw new Error(`Missing runtime binary: ${name}`);
            const data = Buffer.from(await entries[name].arrayBuffer());
            if (sha256(data) !== checksum || metadata.binaries[name] !== checksum)
                throw new Error(`SHA-256 mismatch: ${name}`);
            binaries.push({ name, data });
        }
        // Validate every target before replacing any installed binary.
        for (const { name, data } of binaries)
            await replaceFile(join(this.root, 'bin', name), data, true);
    }

    async install() {
        const missing = await this.verify();
        if (!missing.length) return;
        if (missing.some(filePath => filePath.startsWith('bin/')))
            await this.installRuntime();
        for (const [filePath, asset] of Object.entries(this.lock.client.files)) {
            if (!missing.includes(filePath)) continue;
            await replaceFile(join(this.root, filePath), await this.download(asset));
        }
        const remaining = await this.verify();
        if (remaining.length) throw new Error(`Runtime verification failed: ${remaining}`);
        console.log(`Installed ${this.lock.repository}@${this.lock.tag}`);
    }
}
