import { readDirectory } from '../../shared/neutralinoAdapter.js';
import { checkFileExists, loadJson, loadTextFile } from '../../shared/fsUtils.js';
import { feedTheDag, walkTheDag } from './exporterDag.js';
import { getActiveSet, selectSetFolderPath } from '../sets/setManager.js';
import { registerAction } from '../../ui/systems/actionSystem.js';
import { updateBaseNames } from '../sets/cardNamer.js';
import { openModal } from '../../ui/modals/modalManager.js';
import * as progress from '../../ui/systems/progressSystem.js';

const exporters = [];

export async function loadExporters() {
    const exporterFolders = await readDirectory('exporters');
    for (const exporterFolder of exporterFolders) {
        log('startup').debug('Reading exporter:', exporterFolder.path);
        const jsonPath = ['.', exporterFolder.path, 'exporter.json'].join('/');
        if (!await checkFileExists(jsonPath)) {
            log('startup').debug('No exporter.json found at', jsonPath);
            continue;
        }
        const exporter = await loadJson(jsonPath);
        exporter.path = exporterFolder.path;
        const formPath = ['.', exporterFolder.path, 'form.html'].join('/');
        if (await checkFileExists(jsonPath))
            exporter.form = await loadTextFile(formPath);
        exporters.push(exporter);
    }
}

export function addNativeExporter(exporter) {
    exporter.native = true;
    exporters.push(exporter);
}

async function loadExporter(exporterMetadata) {
    if (exporterMetadata.ExporterClass)
        return exporterMetadata.ExporterClass;

    const mainPath = [exporterMetadata.path, 'main.js'].join('/');
    return exporterMetadata.ExporterClass = (await import('/' + mainPath)).default;
}

export function getExporter(id) {
    const exporter = exporters.find(exporter => exporter.id === id);
    if (!exporter)
        throw new Error(`Exporter ${id} not found`);
    return exporter;
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
    for (const id of exporter.dependencies) {
        if (Object.hasOwn(params, id)) continue;
        params[id] = { id, config: set.export[id] };
        addDependencyParams(id, set, params);
    }
}

export function gatherExporterParams(targetExporterId) {
    const set = getActiveSet();
    const params = {};
    for (const [id, config] of Object.entries(set.export)) {
        if (targetExporterId !== 'all' && targetExporterId !== id)
            continue;
        addDependencyParams(id, set, params);
        params[id] ??= { id, config };
    }
    return Object.values(params);
}

registerAction('run-exporter', async exporterId => {
    if (!await selectSetFolderPath()) return;
    openModal('cm-progress-modal', { title: `Exporting...` });
    try {
        progress.setStatus('Preparing cards');
        const cards = getActiveSet().cards;
        updateBaseNames(cards);
        progress.setStatus('Preparing exporters');
        const params = gatherExporterParams(exporterId);
        await runExporters(params);
        progress.setTitle('Export Complete');
        progress.complete();
    } catch (error) {
        progress.setTitle('Export failed');
        progress.onError(error);
        log('user').error(`Error during export`, error);
    }
});
