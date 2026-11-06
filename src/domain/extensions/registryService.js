import {
    registryRequest, getStoredData, storeData
} from '../../shared/platformAdapter.js';

const storageKey = 'extension-registry-v1';
const freshness = 5 * 60 * 1000;

export class RegistryService {
    constructor({ request = registryRequest, load = () => getStoredData(storageKey),
        save = data => storeData(storageKey, data), clock = Date.now } = {}) {
        Object.assign(this, { request, load, save, clock });
        this.cache = {};
        this.pending = new Map();
        this.offline = false;
    }

    async ready() {
        this.loading ??= (async () => {
            try {
                const stored = await this.load();
                const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
                if (data && typeof data === 'object' && !Array.isArray(data))
                    this.cache = data;
            } catch { /* A missing or corrupt cache can be rebuilt. */ }
        })();
        await this.loading;
    }

    async json(endpoint, refresh = false) {
        await this.ready();
        if (this.pending.has(endpoint)) return this.pending.get(endpoint);
        const cached = this.cache[endpoint];
        if (!refresh && cached && this.clock() - cached.time < freshness)
            return cached.data;
        const task = (async () => {
            try {
                const response = await this.request(endpoint, cached?.etag);
                const data = response.status === 304 ? cached?.data : response.data;
                if (!data) throw new Error('Invalid registry response.');
                this.cache[endpoint] = {
                    data, time: this.clock(), etag: response.etag ?? cached?.etag
                };
                try {
                    await this.save(this.cache);
                } catch { /* Memory cache still works. */ }
                return data;
            } catch (error) {
                if (error.code?.startsWith('REGISTRY_4')) throw error;
                this.offline = true;
                if (cached) return cached.data;
                throw error;
            }
        })();
        this.pending.set(endpoint, task);
        try { return await task; } finally { this.pending.delete(endpoint); }
    }

    async catalog({ refresh = false } = {}) {
        await this.ready();
        this.offline = false;
        if (refresh) {
            for (const [endpoint, cached] of Object.entries(this.cache)) {
                if (endpoint.endsWith('/versions'))
                    cached.time = this.clock() - freshness;
            }
        }
        const result = [];
        let offset = 0;
        do {
            const page = await this.json(`/v1/extensions?limit=100&offset=${offset}`,
                                         refresh);
            if (!Array.isArray(page.extensions)) throw new Error('Invalid catalog.');
            result.push(...page.extensions);
            if (page.nextOffset === null) break;
            if (!Number.isInteger(page.nextOffset) || page.nextOffset <= offset
                || result.length > 10000) throw new Error('Invalid catalog pagination.');
            offset = page.nextOffset;
        } while (offset !== null);
        return result;
    }

    async versions(id, { refresh = false } = {}) {
        const endpoint = `/v1/extensions/${encodeURIComponent(id)}/versions`;
        let data;
        try {
            data = await this.json(endpoint, refresh);
        } catch (error) {
            if (error.code === 'REGISTRY_404') return [];
            throw error;
        }
        if (!Array.isArray(data.versions)) throw new Error('Invalid release list.');
        return data.versions;
    }
}

export const registryService = new RegistryService();
