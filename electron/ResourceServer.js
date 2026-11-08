import { net, protocol } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isInside } from './paths.js';

const MOUNT_URL_PATTERN = /^\/[a-zA-Z0-9_-]+$/;

export const origin = 'cm-app://app';

export function registerResourceScheme() {
    protocol.registerSchemesAsPrivileged([{
        scheme: 'cm-app',
        privileges: { standard: true, secure: true, supportFetchAPI: true }
    }]);
}

export default class ResourceServer {
    mounts = new Map();

    constructor(resourcePath) {
        this.resourcePath = resourcePath;
    }

    start() {
        protocol.handle('cm-app', request => this.serve(request));
    }

    mount(url, target) {
        if (!MOUNT_URL_PATTERN.test(url)) throw new Error('Invalid mount URL');
        this.mounts.set(url, path.resolve(target));
    }

    unmount(url) {
        this.mounts.delete(url);
    }

    getMounts() {
        return Object.fromEntries(this.mounts);
    }

    async resolve(pathname) {
        const mount = [...this.mounts.keys()].sort((a, b) => b.length - a.length)
            .find(key => pathname === key || pathname.startsWith(`${key}/`));
        const base = mount ? this.mounts.get(mount) : this.resourcePath;
        const relative = mount ? pathname.slice(mount.length) : pathname;
        const resource = relative === '/' ? '/index.html' : relative;
        const target = path.resolve(base, `.${resource}`);
        if (!isInside(base, target)) return null;
        const [realBase, realTarget] = await Promise.all([
            fs.realpath(base), fs.realpath(target)
        ]);
        return isInside(realBase, realTarget) ? realTarget : null;
    }

    async serve(request) {
        try {
            const url = new URL(request.url);
            if (url.host !== 'app' || !['GET', 'HEAD'].includes(request.method))
                return new Response('Forbidden', { status: 403 });
            const target = await this.resolve(decodeURIComponent(url.pathname));
            if (!target) return new Response('Forbidden', { status: 403 });
            const file = await net.fetch(pathToFileURL(target).href);
            const response = new Response(file.body, {
                status: file.status, headers: file.headers
            });
            response.headers.set('Cache-Control', 'no-store');
            return response;
        } catch (error) {
            const missing = ['ENOENT', 'ENOTDIR'].includes(error.code);
            return new Response(missing ? 'Not found' : 'Unable to load resource', {
                status: missing ? 404 : 500
            });
        }
    }
}
