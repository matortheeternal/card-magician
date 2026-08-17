import { checkFileExists, } from '../shared/fsUtils.js';
import {
    createCard,
    createTestProject,
    deleteTestProject,
    eventually,
    setCardFields
} from '../shared/testing/testUtils.js';

describe('Card/Project Persistence', () => {
    let project;

    beforeAll(async () => {
        project = await createTestProject();
    });

    afterAll(async () => {
        await deleteTestProject();
    });

    it('saves the project file to the filesystem', async () => {
        try {
            expect(project.filePath).toMatch(/test.cmproj$/);
            await project.save();
            const projectFileExists = await checkFileExists(project.filePath);
            expect(projectFileExists).toBeTrue();
        } catch (e) {
            fail(e);
        }
    });

    it('persists a new card to the filesystem', async () => {
        try {
            await createCard();
            await setCardFields({ name: 'Test' });
            const cardDataPath = await eventually(
                () => selectedCard.files.get('data')
            );
            const cardFileExists = await checkFileExists(cardDataPath);
            expect(cardFileExists).toBeTrue();
        } catch (e) {
            fail(e);
        }
    });
});
