import {
    createDirectory, getJoinedPath, getParentPath,
    writeBinaryFile,
    writeFile
} from '../../shared/neutralinoAdapter.js';
import { getSetFolderPath } from '../sets/setManager.js';
import { checkFolderExists } from '../../shared/fsUtils.js';
import * as progress from '../../ui/systems/progressSystem.js';

/**
 * @typedef DagNode
 * @template {CardMagicianExporter} T
 * @property {string} id - The id of the exporter this node wraps.
 * @property {T} value - The exporter instance this node wraps.
 * @property {Array<DagNode>} children - The children that consume this node's outputs.
 */

class ExporterDAG {
    constructor() {
        this.nodesById = {};
        this.nodesWithParents = new Set();
    }

    get totalSteps() {
        const countSteps = (nodes, baseCount = 0) => {
            if (!nodes) return 0;
            return nodes.reduce((total, node) => {
                const count = node.value.getOutputCount(baseCount);
                return total + count + countSteps(node.children, count);
            }, 0);
        };

        return countSteps(this.footNodes);
    }

    get nodes() {
        return Object.values(this.nodesById);
    }

    feed(value) {
        return this.nodesById[value.id] ??= { id: value.id, value, children: [] };
    }

    addParent(node, exporter) {
        const parentNode = this.feed(exporter);
        parentNode.children.push(node);
        this.nodesWithParents.add(node);
    }

    dontEatYourTail() {
        const visiting = new Set();
        const visited = new Set();

        function visit(node) {
            if (visiting.has(node))
                throw new Error(`Cycle detected at exporter ${node.id}`);
            if (visited.has(node)) return;

            visiting.add(node);
            for (const child of node.children) visit(child);
            visiting.delete(node);
            visited.add(node);
        }

        for (const node of this.nodes)
            visit(node);
    }

    get footNodes() {
        return this.nodes.filter(node => !this.nodesWithParents.has(node));
    }
}

export function feedTheDag(exporters) {
    log('export').debug('Feeding the DAG');
    const exportersById = exporters.toDictionary(exporter => exporter.id);
    const theDag = new ExporterDAG();
    exporters.forEach(exporter => {
        const node = theDag.feed(exporter);
        exporter.dependencies.forEach(id => {
            const exporter = exportersById[id];
            if (!exporter) throw new Error(`Exporter ${id} not found.`);
            theDag.addParent(node, exporter);
        });
    });
    progress.setOperation('Checking for circular dependencies');
    theDag.dontEatYourTail();
    progress.setMax(theDag.totalSteps);
    return theDag.footNodes;
}

const outputHandlers = [{
    match: output => typeof output === 'string',
    write: async (filePath, output) => writeFile(filePath, output)
}, {
    match: output => output.constructor === Uint8Array,
    write: async (filePath, output) => writeBinaryFile(filePath, output)
}];

async function saveArtifact(exporter, localPath, artifact) {
    const output = await artifact.toBuffer();
    const handler = outputHandlers.find(h => h.match(output));
    if (!handler) {
        throw new Error(
            `Exporter ${exporter.id} returned unexpected type:\n`
            + `  ${typeof output}, constructor ${output?.constructor?.name}`
        );
    }
    const setFolderPath = getSetFolderPath();
    const filePath = await getJoinedPath(setFolderPath, 'output', exporter.id, localPath);
    const parentPath = await getParentPath(filePath);
    if (!await checkFolderExists(parentPath))
        await createDirectory(parentPath);
    log('export').info(`Saving ${filePath}`);
    await handler.write(filePath, output);
}

/**
 *
 * @param {ExportArtifact} sourceArtifact
 * @param {Array<DagNode>} targetNodes
 * @returns {Promise<void>}
 */
async function passArtifactDown(sourceArtifact, targetNodes) {
    for (const node of targetNodes) {
        log('export').debug(`Passing to "${node.id}"`);
        const exporter = node.value;
        for await (const { filePath, artifact } of exporter.transform(sourceArtifact)) {
            log('export').debug(`Produced artifact "${filePath}"`);
            progress.setOperation(`Produced ${filePath}`);
            progress.increment();
            if (exporter.saveOutputs)
                await saveArtifact(exporter, filePath, artifact);
            await passArtifactDown(artifact, node.children);
        }
    }
}

/**
 * @param {Array<DagNode>} dagFootNodes
 * @returns {Promise<void>}
 */
export async function walkTheDag(dagFootNodes) {
    log('export').debug('Walking the DAG');
    for (const node of dagFootNodes) {
        progress.setStatus(`Exporting from ${node.id}`);
        log('export').debug(`Walking from "${node.id}"`);
        const exporter = node.value;
        for await (const { filePath, artifact } of exporter.produce()) {
            log('export').debug(`Produced artifact "${filePath}"`);
            progress.setOperation(`Produced ${filePath}`);
            progress.increment();
            if (exporter.saveOutputs)
                await saveArtifact(exporter, filePath, artifact);
            await passArtifactDown(artifact, node.children);
        }
    }
}
