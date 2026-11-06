import ExtensionSettings from './ExtensionSettings.js';
import { createExtensionAction } from './extensionActions/actionRegistry.js';
import { planInstallation, removalDependents }
    from '../../domain/extensions/extensionService.js';
import { registryService } from '../../domain/extensions/registryService.js';

// Runs with the normal settings components in the Extensions browser smoke suite.
describe('Extensions browser', () => {
    let element;
    const catalog = [
        { id: 'magic/frame', type: 'cardpart', metadata: {
            author: 'Mator', description: '<img src=x onerror=alert(1)>'
        } },
        { id: 'magic/template', type: 'template', metadata: { label: 'Example' } }
    ];

    beforeEach(async () => {
        spyOn(registryService, 'versions').and.callFake(async id => [
            { version: '0.2.0', state: 'published', size: 100,
                metadata: catalog.find(row => row.id === id)?.metadata ?? {} }
        ]);
        element = new ExtensionSettings();
        spyOn(element, 'load').and.callFake(async () => {
            element.catalog = catalog;
            element.installed = [{ id: 'magic/frame', type: 'cardpart',
                version: '0.1', bundled: true, metadata: catalog[0].metadata }];
            element.updateRows();
        });
        document.body.appendChild(element);
        await Promise.resolve();
        await Promise.resolve();
    });

    afterEach(() => element.remove());

    it('filters the full local catalog and keeps selection in sync', async () => {
        expect(element.querySelectorAll('.results > .extension-result').length).toBe(2);
        const installed = element.querySelector('.extension-installed');
        installed.checked = true;
        installed.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
        expect(element.querySelectorAll('.results > .extension-result').length).toBe(1);
        const search = element.querySelector('.extension-search');
        search.value = 'nothing';
        search.dispatchEvent(new CustomEvent('sl-input', { bubbles: true }));
        expect(element.querySelectorAll('.results > .extension-result').length).toBe(0);
        expect(element.querySelector('.extension-empty').hidden).toBeFalse();
        expect(element.querySelector('cm-extension-details').textContent)
            .toContain('Select an extension');
    });

    it('keeps filter controls on the settings tab', () => {
        expect(element.resultsControl.querySelector('sl-input, sl-select, sl-switch'))
            .toBeNull();
        expect(element.searchControl.closest('cm-extension-results')).toBeNull();
        expect(element.querySelector('.extension-count').textContent)
            .toBe('2 extensions');
    });

    it('selects a result and updates the detail view through the component event', () => {
        const results = element.resultsControl;
        results.querySelector('[data-extension-id="magic/template"]').click();
        expect(results.selected.id).toBe('magic/template');
        expect(element.detailsControl.extension.id).toBe('magic/template');
        expect(results.querySelector('.extension-result.selected').dataset.extensionId)
            .toBe('magic/template');
        expect(results.querySelectorAll('.extension-result.selected').length).toBe(1);
    });

    it('applies the result column and row styles', () => {
        const results = element.resultsControl;
        expect(getComputedStyle(results).overflowY).toBe('auto');
        expect(getComputedStyle(results).flexBasis).toBe('45%');
        const rowStyle = getComputedStyle(results.querySelector('.extension-result'));
        expect(rowStyle.display).toBe('flex');
    });

    it('keeps the current release details when filtering preserves selection', () => {
        registryService.versions.calls.reset();
        element.searchControl.value = 'frame';
        element.filterResults();
        element.filterResults();
        expect(registryService.versions).not.toHaveBeenCalled();
        expect(element.detailsControl.versions[0].version).toBe('0.2.0');
    });

    it('ignores release responses from an older selection', async () => {
        const pending = new Map();
        registryService.versions.and.callFake(id => new Promise(resolve => {
            pending.set(id, resolve);
        }));
        const details = element.detailsControl;
        const first = details.show(catalog[0]);
        const second = details.show(catalog[1]);
        pending.get(catalog[1].id)([]);
        await second;
        pending.get(catalog[0].id)([
            { version: '9.0.0', state: 'published', metadata: {} }
        ]);
        await first;
        expect(details.extension.id).toBe(catalog[1].id);
        expect(details.versions).toEqual([]);
        expect(details.model.loading).toBeFalse();
    });

    it('reports an action failure', async () => {
        spyOn(element, 'getAction').and.returnValue({
            execute: async () => { throw new Error('Download failed'); }
        });
        spyOn(element, 'refreshInstalled').and.resolveTo();
        await element.perform('install');
        const status = element.querySelector('.extension-status');
        expect(status.getAttribute('role')).toBe('alert');
        expect(status.textContent).toBe('Download failed');
    });

    it('does not report success after a cancelled action', async () => {
        spyOn(element, 'getAction').and.returnValue({ execute: async () => false });
        spyOn(element, 'refreshInstalled').and.resolveTo();
        await element.perform('remove');
        expect(element.querySelector('.extension-status').textContent).toBe('');
    });

    it('allows filtering and selection while refreshing the catalog', async () => {
        element.load.and.callThrough();
        spyOn(element, 'loadInstalled').and.resolveTo();
        let finish;
        spyOn(registryService, 'catalog').and.returnValue(new Promise(resolve => {
            finish = resolve;
        }));
        const loading = element.load(true);
        await Promise.resolve();
        expect(element.loading).toBeTrue();
        element.resultsControl.selectExtension('magic/template');
        expect(element.selected.id).toBe('magic/template');
        finish(catalog);
        await loading;
        expect(element.loading).toBeFalse();
    });

    it('keeps installed results usable when catalog loading fails', async () => {
        element.load.and.callThrough();
        spyOn(element, 'loadInstalled').and.callFake(async () => {
            element.catalog = [];
            element.updateRows();
        });
        spyOn(registryService, 'catalog').and.rejectWith(new Error('Offline'));
        await element.load(true);
        expect(element.resultsControl.rows.map(row => row.id)).toEqual(['magic/frame']);
        expect(element.querySelector('.extension-status').textContent)
            .toContain('Registry unavailable');
    });

    it('cancels a dependency installation before applying any changes', async () => {
        const confirm = spyOn(dialog, 'confirm').and.resolveTo(false);
        const progress = jasmine.createSpy('progress');
        const action = createExtensionAction('install', {
            row: catalog[1], catalog, installed: element.installed,
            onProgress: progress,
            releases: [{ version: '0.2.0', state: 'published', metadata: {
                dependencies: { 'magic/frame': '^0.2' }
            } }]
        });
        expect(await action.execute()).toBeFalse();
        expect(confirm.calls.mostRecent().args[0]).toContain('magic/frame 0.2.0');
        expect(confirm.calls.mostRecent().args[0]).toContain('magic/template 0.2.0');
        expect(progress).not.toHaveBeenCalled();
    });

    it('plans dependencies first and blocks missing requirements', async () => {
        const dependency = { id: 'frame', type: 'cardpart', metadata: {} };
        const target = { id: 'template', type: 'template', metadata: {} };
        registryService.versions.and.resolveTo([
            { version: '0.1.0', state: 'published', metadata: {} }
        ]);
        const release = { version: '0.1.0', metadata: {
            dependencies: { frame: '^0.1' }
        } };
        const plan = await planInstallation(target, release, [], [dependency, target]);
        expect(plan.map(entry => entry.row.id)).toEqual(['frame', 'template']);
        await expectAsync(planInstallation(target, release, [], [target]))
            .toBeRejectedWithError('Required extension unavailable: frame ^0.1');
        expect(removalDependents({ id: 'frame', installed: {} }, [{
            id: 'template', metadata: release.metadata
        }]).length).toBe(1);
    });

    it('shows update actions and protects bundled extensions', () => {
        const details = element.querySelector('cm-extension-details');
        expect(details.querySelector('[data-click-action="install"]').textContent)
            .toContain('Update');
        expect(details.querySelector('[data-click-action="remove"]')).toBeNull();
        expect(details.querySelector('img')).toBeNull();
        const action = spyOn(element, 'perform');
        details.querySelector('[data-click-action="install"]').click();
        expect(action).toHaveBeenCalledWith('install');
    });

    describe('Details', () => {
        function values() {
            const result = new Map();
            for (const term of element.detailsControl.querySelectorAll('dt')) {
                const value = term.nextElementSibling.textContent.trim();
                result.set(term.textContent.trim(), value);
            }
            return result;
        }

        it('renders field values and omits absent optional metadata', async () => {
            const installed = values();
            expect(installed.get('Type')).toBe('cardpart');
            expect(installed.get('Author')).toBe('Mator');
            expect(installed.get('Installed version')).toBe('0.1');
            expect(installed.get('Available version')).toBe('0.2.0');
            expect(installed.get('Download size')).toBe('1 KiB');
            expect(installed.has('Game')).toBeFalse();
            await element.detailsControl.show(catalog[1]);
            const available = values();
            expect(available.get('Installed version')).toBe('Not installed');
            expect(available.has('Author')).toBeFalse();
            expect(element.detailsControl.querySelector('[data-click-action="install"]')
                .textContent.trim()).toBe('Install');
        });

        it('supports author arrays and removing an installed update', async () => {
            registryService.versions.and.resolveTo([]);
            await element.detailsControl.show({
                id: 'local-template', type: 'template', metadata: {
                    authors: ['Mator', 'Aanginer'], gameId: 'magic'
                }, installed: { version: '0.1', bundled: false, hasBundled: true }
            });
            const fields = values();
            expect(fields.get('Author')).toBe('Mator, Aanginer');
            expect(fields.get('Game')).toBe('magic');
            expect(fields.get('Available version')).toBe('No compatible release');
            expect(fields.has('Download size')).toBeFalse();
            expect(element.detailsControl.querySelector('[data-click-action="remove"]')
                .textContent.trim()).toBe('Remove update');
        });

        it('shows revocation and bundled notices without install actions', async () => {
            registryService.versions.and.resolveTo([
                { version: '0.1.0', state: 'revoked', metadata: {} }
            ]);
            const details = element.detailsControl;
            await details.show(element.selected);
            expect(details.querySelector('.extension-warning').textContent)
                .toContain('revoked');
            expect(details.textContent).toContain('Included with Card Magician');
            expect(details.querySelector('sl-button')).toBeNull();
            expect(values().has('Download size')).toBeFalse();
        });

        it('replaces the loading message with escaped error text', async () => {
            let fail;
            registryService.versions.and.returnValue(new Promise((resolve, reject) => {
                fail = reject;
            }));
            const details = element.detailsControl;
            const pending = details.show(catalog[1]);
            expect(details.querySelector('[role="status"]').textContent)
                .toContain('Loading releases');
            fail(new Error('<b>Connection failed</b>'));
            await pending;
            expect(details.querySelector('[role="status"]')).toBeNull();
            expect(details.querySelector('[role="alert"]').textContent)
                .toBe('<b>Connection failed</b>');
            expect(details.querySelector('b')).toBeNull();
        });
    });
});
