import { executeAction } from '../../ui/systems/actionSystem.js';
import FieldInteractor from './FieldInteractor.js';
import { getJoinedPath, rmrf } from '../neutralinoAdapter.js';

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

async function hashFile(file) {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);

    return Array.from(
        new Uint8Array(digest),
        byte => byte.toString(16).padStart(2, '0'),
    ).join('');
}

export async function expectFilesToMatch(actual, expected) {
    expect(actual.size).withContext('File sizes differ').toBe(expected.size);
    if (actual.size !== expected.size) return;

    const [actualHash, expectedHash] = await Promise.all([
        hashFile(actual),
        hashFile(expected),
    ]);
    expect(actualHash).withContext('File contents differ').toBe(expectedHash);
}

/**
 * Sets multiple fields on the currently selected card through the card form UI.
 *
 * @param {Record<string, *>} fields
 * @param {object} options
 */
export async function setCardFields(fields, options = { faceKey: 'front' }) {
    const changes = Object.entries(fields).map(([field, value]) => {
        const interactor = new FieldInteractor(field, options);
        interactor.addIfMissing();
        return interactor.setValue(value);
    });
    return Promise.all(changes);
}

/**
 * Creates a card through the normal application workflow.
 *
 * @returns {Promise<CardMagicianCard>}
 */
export async function createCard() {
    await executeAction('add-card');
    return selectedProjectCard;
}

let testIndex = 0;

/**
 * Creates a new project and sets its filePath to ./temp_test_project/test.cmproj.
 *
 * @returns {Promise<CardMagicianProject>}
 */
export async function createTestProject() {
    const testProjectDir = await getJoinedPath(NL_DATAPATH, `test-${testIndex++}`);
    const projectFilePath = await getJoinedPath(testProjectDir, 'test.cmproj');
    try { await rmrf(testProjectDir); } catch {}
    executeAction('new-project');
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

function normalizeImage(image) {
    return {
        width: image.width,
        height: image.height,
        cropWidth: image.crop.width,
        cropHeight: image.crop.height,
        xOffset: image.crop.xOffset,
        yOffset: image.crop.yOffset,
    };
}

function normalizeCardData(value) {
    if (Array.isArray(value))
        return value.map(normalizeCardData);
    if (value === null || typeof value !== 'object')
        return value;
    if (value.constructor?.name === 'ManaCost')
        return String(value);
    if (value.constructor?.name === 'ImageFieldValue')
        return normalizeImage(value);

    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
            key,
            normalizeCardData(item),
        ])
    );
}

export function expectCardData(actual, expected) {
    expect(normalizeCardData(actual)).toEqual(
        jasmine.objectContaining(expected)
    );
}

export async function toggleFace(face) {
    const cardForm = document.querySelector('cm-card-form');
    await cardForm.toggleFace(face);
}

export async function flushCard() {
    const cardForm = document.querySelector('cm-card-form');
    await cardForm.save.flush();
}

export async function flushCardProperties() {
    const cardProperties = document.querySelector('cm-card-properties');
    await cardProperties.save.flush();
}

export function selectRow(index) {
    const rows = document.querySelectorAll('cm-list-view tr');
    const row = rows[index + 1];
    row.click();
}
