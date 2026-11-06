import { readExtensionDirectories } from '../../shared/extensionManager.js';
import { feedTheDag, walkTheDag } from './exporterDag.js';
import { registerAction } from '../../ui/systems/actionSystem.js';
import { openModal } from '../../ui/modals/modalManager.js';
import * as progress from '../../ui/systems/progressSystem.js';

const L = localize('export-manager');
const report = createReporter({
    unit: 'ExporterManager',
    label: 'Export System'
});

export const exporterRegistry = { exporters: [] };
const exporters = exporterRegistry.exporters;

const NO_EXPORTER_FORM_HTML = (
    `<div class="exporter-no-options">
        ${L`This exporter has no settings.`}
    </div>`
);

export async function loadExporters() {
    const exporterFolders = await readExtensionDirectories(
        'exporters', { recursive: true }
    );
    for (const folder of exporterFolders) await registerExporter(folder);
}

async function readExporterForm(folder) {
    if (!await folder.exists('form.html')) return NO_EXPORTER_FORM_HTML;
    return folder.readText('form.html');
}

export async function registerExporter(folder) {
    if (!await folder.exists('exporter.json')) return null;
    const exporter = await folder.readJson('exporter.json');
    exporter.path = folder.url().slice(1);
    exporter.directory = folder;
    exporter.form = await readExporterForm(folder);
    const index = exporters.findIndex(entry => entry.id === exporter.id);
    if (index !== -1 && exporters[index].native) return exporters[index];
    if (index !== -1) exporters.splice(index, 1);
    exporters.push(exporter);
    changed(exporterRegistry, 'exporters');
    return exporter;
}

export function addNativeExporter(exporter) {
    exporter.native = true;
    exporters.push(exporter);
}

export async function loadExporter(exporterMetadata) {
    if (exporterMetadata.ExporterClass)
        return exporterMetadata.ExporterClass;

    const mainPath = exporterMetadata.directory.url('main.js');
    return exporterMetadata.ExporterClass = (await import(mainPath)).default;
}

export function hasExporter(id) {
    return exporters.some(exporter => exporter.id === id);
}

export function getExporter(id) {
    const exporter = exporters.find(exporter => exporter.id === id);
    if (!exporter)
        throw new Error(`Exporter ${id} not found`);
    return exporter;
}

/**
 * Returns an array of loaded exporters.
 *
 * @param {boolean} includeNative
 * @returns {Array<CardMagicianExporter>}
 */
export function getLoadedExporters(includeNative = false) {
    return exporters.filter(e => !e.native || includeNative);
}

/**
 * @typedef ExporterParams
 * @property {string} id - The id of the exporter to run.
 * @property {object} config - The configuration options to pass to the exporter.
 */

/**
 * Loads and creates an exporter module.
 *
 * @param {ExporterParams} params
 * @returns {Promise<CardMagicianExporter>}
 */
async function createExporter(params) {
    const exporterMetadata = getExporter(params.id);
    const ExporterModule = await loadExporter(exporterMetadata);
    return new ExporterModule(params.config, exporterMetadata);
}

/**
 * Runs a collection of exporters.
 *
 * @param {Array<ExporterParams>} exporterParams - Array of parameters corresponding to
 * the exporters to run. Must include all required exporters, if an exporter is required
 * due to a dependency but isn't present in this array, an error will be thrown.
 * @returns {Promise<void>}
 */
export async function runExporters(exporterParams) {
    const exporters = await Promise.all(
        exporterParams.map(params => createExporter(params))
    );
    await Promise.all(exporters.map(exporter => exporter.prepare()));
    progress.setOperation('Building dependency tree');
    const dagFootNodes = feedTheDag(exporters);
    await walkTheDag(dagFootNodes);
}

function addDependencyParams(exporterId, set, params) {
    const exporter = getExporter(exporterId);
    if (!exporter.dependencies) return;
    for (const id of Object.keys(exporter.dependencies)) {
        if (Object.hasOwn(params, id)) continue;
        params[id] = { id, config: set.export[id] };
        addDependencyParams(id, set, params);
    }
}

export function gatherExporterParams(targetExporterId) {
    const params = {};
    for (const [id, config] of Object.entries(activeProject.export)) {
        if (!hasExporter(id)) continue;
        if (targetExporterId !== 'all' && targetExporterId !== id)
            continue;
        addDependencyParams(id, activeProject, params);
        params[id] ??= { id, config };
    }
    return Object.values(params);
}

registerAction('run-exporter', async exporterId => {
    if (!activeProject.folderPath) {
        await dialog.alert(L`Project must be saved before exporting.`);
        return;
    }
    openModal('cm-progress-modal', { title: `Exporting...` });
    try {
        progress.setStatus('Preparing cards');
        progress.setStatus('Preparing exporters');
        const params = gatherExporterParams(exporterId);
        if (Object.keys(params).length === 0) {
            progress.setTitle('Exporter not found.');
            progress.onError(new Error(`Could not export ${exporterId}`));
            return;
        }
        await runExporters(params);
        progress.setTitle('Saving cards');
        for (const card of activeProject.cards)
            await card.saveData();
        progress.setTitle('Export Complete');
        progress.complete();
    } catch (error) {
        progress.setTitle('Export failed');
        progress.onError(error);
        report('runExport', error, [exporterId, exporters]);
        log('user').error(`Error during export`, error);
    }
});
