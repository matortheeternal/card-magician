import { checkFileExists, } from '../shared/fsUtils.js';
import { newProject } from './projects/projectManager.js';
import { getJoinedPath, rmrf } from '../shared/neutralinoAdapter.js';
import { executeAction } from '../ui/systems/actionSystem.js';

async function eventually(predicate, {
    timeout = 2000,
    interval = 50,
} = {}) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (await predicate()) return true;
        await new Promise(resolve => {
            setTimeout(resolve, interval);
        });
    }
    if (await predicate()) return true;
    throw new Error(`Condition not met within ${timeout}ms`);
}

describe('Card Persistence', () => {
    let testProjectDir;
    let projectFilePath;
    let project;

    beforeAll(async () => {
        testProjectDir = await getJoinedPath(NL_CWD, 'temp_test_project');
        projectFilePath = await getJoinedPath(testProjectDir, 'test.cmproj');
        try { await rmrf(testProjectDir); } catch {}
        await newProject();
        project = window.activeProject;
        await project.setFilePath(projectFilePath);
    });

    afterAll(async () => {
        try { await rmrf(testProjectDir); } catch {}
    });

    it('saves the project file to the filesystem', async () => {
        try {
            await project.save();
            expect(await checkFileExists(projectFilePath)).toBeTrue();
        } catch (e) {
            fail(e);
        }
    });

    it('persists a new card to the filesystem', async () => {
        try {
            await executeAction('add-card');
            const nameInput = document.querySelector(
                'form-field[field-id="name"] sl-input'
            );
            nameInput.value = 'Test';
            nameInput.dispatchEvent(new Event('sl-input', { bubbles: true }));
            const cardFilePath = await getJoinedPath(
                project.cardsFolderPath,
                'Test.yml'
            );

            const result = await eventually(() => checkFileExists(cardFilePath));
            expect(result).toBeTrue();
        } catch (e) {
            fail(e);
        }
    });
});
