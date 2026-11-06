import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import semver from 'semver';

import { kinds, maxPackage } from './extensionRegistry/extensionMetadata.js';
import ExtensionPaths from './extensionRegistry/ExtensionPaths.js';
import ExtensionInventory from './extensionRegistry/ExtensionInventory.js';
import ExtensionInstallation from './extensionRegistry/ExtensionInstallation.js';
import { validateArchive } from './extensionRegistry/ExtensionArchive.js';

export { validateArchive };
export const registryOrigin = 'https://cm-registry.fly.dev';

async function readLimited(response, limit) {
    if (Number(response.headers.get('content-length')) > limit)
        throw new Error('Registry response exceeds the size limit.');
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > limit)
                throw new Error('Registry response exceeds the size limit.');
            chunks.push(value);
        }
    } finally { await reader.cancel(); }
    return Buffer.concat(chunks, size);
}

function registryEndpoint(endpoint) {
    const url = new URL(endpoint, registryOrigin);
    if (url.origin !== registryOrigin || !url.pathname.startsWith('/v1/extensions')
        || !endpoint.startsWith('/v1/extensions') || url.hash)
        throw new Error('Invalid registry endpoint.');
    return url;
}

async function readRegistryResponse(response) {
    if (response.status === 304) return { status: 304 };
    if (!response.ok) {
        const error = new Error(`Registry request failed (${response.status}).`);
        error.code = `REGISTRY_${response.status}`;
        throw error;
    }
    const data = JSON.parse((await readLimited(response, 8 * 1024 * 1024))
        .toString('utf8'));
    return { status: 200, etag: response.headers.get('etag'), data };
}

function packageUrl(downloadUrl) {
    const url = new URL(downloadUrl);
    if (url.origin !== registryOrigin
        || !/^\/v1\/packages\/[A-Za-z0-9-]+$/.test(url.pathname))
        throw new Error('Invalid registry package URL.');
    return url;
}

function validateIntegrity(bytes, release) {
    if (bytes.length !== release.size
        || createHash('sha256').update(bytes).digest('hex') !== release.sha256)
        throw new Error('The downloaded package failed its integrity check.');
}

export default class ExtensionRegistry {
    constructor(environment, fetcher = fetch) {
        this.environment = environment;
        this.fetch = fetcher;
        this.busy = false;
    }

    async request(endpoint, etag) {
        const url = registryEndpoint(endpoint);
        const response = await this.fetch(url.href, {
            headers: etag ? { 'If-None-Match': etag } : {},
            redirect: 'error', signal: AbortSignal.timeout(20000)
        });
        return readRegistryResponse(response);
    }

    installed() {
        return new ExtensionInventory().scan(this.environment);
    }

    target(id, type) {
        return new ExtensionPaths(this.environment.paths.userExtensions).target(id, type);
    }

    async exclusive(action) {
        if (this.busy) throw new Error('Another extension operation is in progress.');
        this.busy = true;
        try { return await action(); } finally { this.busy = false; }
    }

    install(id, type, version) {
        return this.exclusive(async () => {
            const target = await this.target(id, type);
            const endpoint = `/v1/extensions/${encodeURIComponent(id)}/versions/`
                + encodeURIComponent(version);
            const { data: release } = await this.request(endpoint);
            if (release.state !== 'published' || release.version !== version)
                throw new Error('This release is no longer available for installation.');
            this.validateCompatibility(release);
            const bytes = await this.download(release);
            const files = await validateArchive(bytes, id, type, version);
            await new ExtensionInstallation(this, id, type, target).install(files);
            return { id, version };
        });
    }

    validateCompatibility(release) {
        const range = release.metadata?.compatibility?.cardMagician;
        if (range && !semver.satisfies(this.environment.version, range))
            throw new Error('This release is incompatible with Card Magician.');
    }

    async download(release) {
        const url = packageUrl(release.downloadUrl);
        const response = await this.fetch(url.href, {
            redirect: 'error', signal: AbortSignal.timeout(120000)
        });
        if (!response.ok) throw new Error(`Download failed (${response.status}).`);
        const bytes = await readLimited(response, maxPackage);
        validateIntegrity(bytes, release);
        return bytes;
    }

    uninstall(id, type) {
        return this.exclusive(async () => {
            const target = await this.target(id, type);
            const metadata = JSON.parse(await fs.readFile(
                path.join(target, kinds[type][1]), 'utf8'));
            if (metadata.id !== id) throw new Error('Installed extension ID mismatch.');
            const trash = path.join(this.environment.paths.userExtensions,
                                    `.registry-removed-${randomUUID()}`);
            await fs.rename(target, trash);
            await fs.rm(trash, { recursive: true, force: true });
        });
    }
}
