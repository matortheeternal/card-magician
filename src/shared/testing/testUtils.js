import { executeAction } from '../../ui/systems/actionSystem.js';
import FieldInteractor from './FieldInteractor.js';
import { getJoinedPath, rmrf } from '../neutralinoAdapter.js';
import { newProject } from '../../domain/projects/projectManager.js';

/**
 * Waits until the provided asynchronous condition becomes true.
 *
 * @param {() => any} predicate Condition to evaluate.
 * @param {object} [options] Polling options.
 * @param {number} [options.timeout=2000] Maximum time to wait, in milliseconds.
 * @param {number} [options.interval=50] Delay between attempts, in milliseconds.
 * @returns {Promise<any>}
 * @throws {Error} If the condition does not become true before the timeout.
 */
export async function eventually(predicate, {
    timeout = 2000,
    interval = 50,
} = {}) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const result = await predicate();
        if (result) return result;
        await new Promise(resolve => {
            setTimeout(resolve, interval);
        });
    }
    const result = await predicate();
    if (result) return result;
    throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Returns whether two files contain identical binary contents.
 *
 * @param {string} firstPath
 * @param {string} secondPath
 * @returns {Promise<boolean>}
 */
export async function filesAreEqual(firstPath, secondPath) {
    // TODO
}

/**
 * Sets multiple fields on the currently selected card through the card form UI.
 *
 * @param {Record<string, *>} fields
 * @returns {Promise<void>}
 */
export async function setCardFields(fields) {
    for (const [field, value] of Object.entries(fields)) {
        const interactor = new FieldInteractor(field);
        interactor.value = value;
    }
}

/**
 * Creates a card through the normal application workflow.
 *
 * @returns {Promise<CardMagicianCard>}
 */
export async function createCard() {
    await executeAction('add-card');
}

/**
 * Creates a new project and sets its filePath to ./temp_test_project/test.cmproj.
 *
 * @returns {Promise<CardMagicianProject>}
 */
export async function createTestProject() {
    const testProjectDir = await getJoinedPath(NL_CWD, 'temp_test_project');
    const projectFilePath = await getJoinedPath(testProjectDir, 'test.cmproj');
    try { await rmrf(testProjectDir); } catch {}
    await newProject();
    await activeProject.setFilePath(projectFilePath);
    return activeProject;
}

/**
 * Deletes a project if it is saved at a filepath that ends with "test.cmproj".
 *
 * @returns {Promise<void>}
 */
export async function deleteTestProject() {
    if (!activeProject.filePath.endsWith('test.cmproj'))
        throw new Error('Project file is not test.cmproj? Escaping.');
    try { await rmrf(activeProject.folderPath); } catch {}
}
