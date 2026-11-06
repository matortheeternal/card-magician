import { activateExtension } from './activation/activationRegistry.js';
import { findExtension } from '../../shared/extensionManager.js';
import {
    createDirectory, writeFile, getJoinedPath, rmrf
} from '../../shared/platformAdapter.js';
import {
    getTemplate, getTemplates, registerTemplate
} from '../template/templateRegistry.js';
import {
    getExporter, getLoadedExporters, loadExporter
} from '../export/exporterManager.js';
import { buildCard } from '../card/cardBuilder.js';
import BaseCardModel from '../card/BaseCardModel.js';
import {
    createTestProject, createCard, deleteTestProject, eventually
} from '../../shared/testing/testUtils.js';

// Real files and native mounts, isolated under the smoke profile's appdata.
describe('Extension hotloading', () => {
    const paths = [];
    let settings;

    beforeEach(async () => {
        await createTestProject();
        await createCard();
    });

    afterEach(async () => {
        settings?.remove();
        settings = null;
        await deleteTestProject();
        for (const folder of paths.splice(0)) await rmrf(folder);
    });

    async function extension(type, files, metadata = {}) {
        const id = `magic/hot-${crypto.randomUUID()}`;
        const row = { id, type, metadata: { id, version: '0.1', ...metadata } };
        const folders = { cardpart: 'cardparts', template: 'templates',
            exporter: 'exporters' };
        const folder = await getJoinedPath(appEnvironment.paths.userExtensions,
                                           folders[type], ...id.split('/'));
        paths.push(folder);
        await createDirectory(folder);
        for (const [filename, content] of Object.entries(files)) {
            const target = await getJoinedPath(folder, filename);
            await writeFile(target, content);
        }
        return { row, folder };
    }

    it('makes a new cardpart available with relative imports and assets', async () => {
        const { row, folder } = await extension('cardpart', {
            'main.js': `import value from './helper.js';
                export default class extends CardMagicianModule {
                    marker = value;
                }`,
            'helper.js': 'export default "hotloaded";',
            'assets/example.txt': 'asset contents'
        });
        await writeFile(await getJoinedPath(folder, 'module.json'),
                        JSON.stringify(row.metadata));
        expect(await activateExtension(row, false)).toBeTrue();
        const face = new BaseCardModel('test');
        const module = await face.loadModule(row.id);
        expect(module.marker).toBe('hotloaded');
        expect(module.directory.url()).toMatch(/^\/extension-runtime-/);
        const response = await fetch(module.resolveAsset('example.txt'));
        expect(await response.text()).toBe('asset contents');
        expect(await module.loadFile('assets/example.txt')).toBe('asset contents');
        module.dispose();
    });

    it('refreshes existing template selectors without rebuilding card data', async () => {
        const face = activeEditorCard.front;
        face.name = 'Unsaved card name';
        const previousTemplate = face.template;
        const form = document.querySelector('cm-face-form[data-face-id="front"]');
        const selector = form.querySelector(
            'form-field[field-id="template"] cm-template-field');
        const { row, folder } = await extension('template', {
            'template.html': '<div>Hotloaded template</div>',
            'template.css': '.card { color: inherit; }',
            'form.html': '<div>Hotloaded form</div>'
        }, { label: 'ZZZ hotloaded template', gameId: 'magic', card: [] });
        await writeFile(await getJoinedPath(folder, 'template.json'),
                        JSON.stringify(row.metadata));
        expect(await activateExtension(row, false)).toBeTrue();
        expect(selector.select.querySelector(`sl-option[value="${row.id}"]`))
            .not.toBeNull();
        expect(selector.select.value).toBe(previousTemplate);
        expect(activeEditorCard.front).toBe(face);
        expect(face.name).toBe('Unsaved card name');
        const template = getTemplate(row.id);
        await registerTemplate(template.folder);
        expect(getTemplates().filter(entry => entry.id === row.id).length).toBe(1);
        const card = await buildCard({ front: { template: row.id } });
        expect(card.front.dom.root.textContent).toContain('Hotloaded template');
        card.front.dispose();
    });

    it('refreshes the exporter picker and loads its code on demand', async () => {
        settings = document.createElement('cm-configure-exporters');
        document.body.appendChild(settings);
        const { row, folder } = await extension('exporter', {
            'main.js': `import value from './helper.js';
                export default class extends CardMagicianExporter {
                    marker = value;
                }`,
            'helper.js': 'export default "new exporter";',
            'info.txt': 'exporter asset'
        }, { label: 'New test exporter' });
        await writeFile(await getJoinedPath(folder, 'exporter.json'),
                        JSON.stringify(row.metadata));
        expect(await activateExtension(row, false)).toBeTrue();
        const item = settings.querySelector(`sl-menu-item[value="${row.id}"]`);
        expect(item).not.toBeNull();
        const exporter = getExporter(row.id);
        expect(exporter.ExporterClass).toBeUndefined();
        item.click();
        await eventually(() => Object.hasOwn(activeProject.export, row.id));
        const Constructor = await loadExporter(exporter);
        const instance = new Constructor({}, exporter);
        expect(instance.marker).toBe('new exporter');
        expect(await instance.loadFile('info.txt')).toBe('exporter asset');
        expect(getLoadedExporters().filter(entry => entry.id === row.id).length).toBe(1);
    });

    it('requires reload for games and existing extensions', async () => {
        const template = getTemplate('magic/M15/Main');
        const rows = [
            { type: 'game', id: 'new-game' },
            { type: 'template', id: 'magic/M15/Main' },
            { type: 'cardpart', id: 'magic/M15/Name' },
            { type: 'exporter', id: 'WebExporter' }
        ];
        for (const row of rows)
            expect(await activateExtension(row, true)).toBeFalse();
        expect(await activateExtension(rows[0], false)).toBeFalse();
        expect(getTemplate('magic/M15/Main')).toBe(template);
    });

    it('cleans up failed activation and keeps the installed files', async () => {
        const { row, folder } = await extension('template', {});
        await writeFile(await getJoinedPath(folder, 'template.json'),
                        JSON.stringify(row.metadata));
        await expectAsync(activateExtension(row, false))
            .toBeRejectedWithError('Template is missing required views.');
        expect(getTemplate(row.id)).toBeUndefined();
        // The files remain installed for inspection or correction.
        expect(await (await findExtension(`templates/${row.id}`))
            .readJson('template.json')).toEqual(row.metadata);
    });
});
