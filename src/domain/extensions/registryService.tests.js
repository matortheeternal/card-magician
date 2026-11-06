import { RegistryService } from './registryService.js';
import {
    normalizeVersion, isCompatible, selectRelease, mergeExtensions,
    filterExtensions, dependencyRanges
} from './extensionMetadata.js';

describe('Extension registry cache', () => {
    it('loads every page and revalidates cached pages with ETags', async () => {
        const requests = [];
        const service = new RegistryService({
            load: async () => ({}), save: async () => {},
            request: async (endpoint, etag) => {
                requests.push({ endpoint, etag });
                if (etag) return { status: 304 };
                return { status: 200, etag: 'catalog-v1', data: {
                    extensions: [{ id: endpoint.endsWith('offset=0') ? 'a' : 'b' }],
                    nextOffset: endpoint.endsWith('offset=0') ? 100 : null
                } };
            }
        });
        expect((await service.catalog()).map(e => e.id)).toEqual(['a', 'b']);
        await service.catalog();
        expect(requests.length).toBe(2);
        expect((await service.catalog({ refresh: true })).length).toBe(2);
        expect(requests.slice(2).every(r => r.etag === 'catalog-v1'))
            .toBeTrue();
    });

    it('uses persistent cache offline and reports uncached resources', async () => {
        const endpoint = '/v1/extensions?limit=100&offset=0';
        const service = new RegistryService({
            load: async () => ({ [endpoint]: { data: {
                extensions: [{ id: 'cached' }], nextOffset: null
            }, time: 0 } }),
            request: async () => { throw new Error('Offline'); },
            save: async () => {}
        });
        expect((await service.catalog())[0].id).toBe('cached');
        expect(service.offline).toBeTrue();
        await expectAsync(service.versions('unknown')).toBeRejectedWithError('Offline');
    });

    it('treats an unlisted local extension as having no registry releases', async () => {
        const service = new RegistryService({ load: async () => ({}),
            save: async () => {}, request: async () => {
                throw Object.assign(new Error('Not found'), { code: 'REGISTRY_404' });
            } });
        expect(await service.versions('local-only')).toEqual([]);
        expect(service.offline).toBeFalse();
    });

    it('refreshes release information when the catalog is refreshed', async () => {
        let releaseRequests = 0;
        const service = new RegistryService({ load: async () => ({}),
            save: async () => {}, request: async endpoint => {
                if (endpoint.endsWith('/versions')) {
                    releaseRequests++;
                    return { status: 200, data: { versions: [] } };
                }
                return { status: 200, data: { extensions: [], nextOffset: null } };
            } });
        await service.versions('frame');
        await service.versions('frame');
        expect(releaseRequests).toBe(1);
        await service.catalog({ refresh: true });
        await service.versions('frame');
        expect(releaseRequests).toBe(2);
    });

    it('rejects nonadvancing pagination instead of looping', async () => {
        const service = new RegistryService({ load: async () => ({}),
            save: async () => {}, request: async () => ({ status: 200, data: {
                extensions: [], nextOffset: 0
            } }) });
        await expectAsync(service.catalog()).toBeRejectedWithError(
            'Invalid catalog pagination.');
    });
});

describe('Extension browser metadata', () => {
    it('normalizes legacy versions and chooses compatible published releases', () => {
        expect(normalizeVersion('0.1')).toBe('0.1.0');
        expect(normalizeVersion('invalid')).toBeNull();
        expect(isCompatible({ compatibility: { cardMagician: '<1.0.0' } },
                            '1.0.1')).toBeFalse();
        const versions = [
            { version: '0.1.0', state: 'published', metadata: {} },
            { version: '0.2.0', state: 'revoked', metadata: {} },
            { version: '0.3.0', state: 'deprecated', metadata: {} },
            { version: '0.4.0', state: 'published', metadata: {
                compatibility: { cardMagician: '<0.1.0' }
            } }
        ];
        expect(selectRelease(versions).version).toBe('0.1.0');
    });

    it('merges local-only extensions and applies combined filters', () => {
        const rows = mergeExtensions([
            { id: 'magic/Frame', type: 'cardpart', metadata: { author: 'Mator' } }
        ], [{ id: 'local', type: 'game', version: '0.1', metadata: {} }]);
        expect(rows.length).toBe(2);
        expect(filterExtensions(rows, { installed: true })[0].id).toBe('local');
        expect(filterExtensions(rows, { type: 'cardpart', query: 'FRAME mator' })[0]
            .id).toBe('magic/Frame');
        expect(filterExtensions(rows, { type: 'cardpart', installed: true })).toEqual([]);
        expect(dependencyRanges({ gameId: 'magic', card: ['frame'],
            subcards: { back: ['text'] }, dependencies: { frame: '^0.1' } }))
            .toEqual({ magic: '*', frame: '^0.1', text: '*' });
    });
});
