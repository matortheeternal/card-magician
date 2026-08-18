import { checkFileExists } from '../shared/fsUtils.js';
import {
    createCard,
    createTestProject,
    deleteTestProject,
    eventually,
    setCardFields
} from '../shared/testing/testUtils.js';
import YAMLSerializer from './projects/serializers/YAMLSerializer.js';
import { readFile } from '../shared/neutralinoAdapter.js';

describe('Persistence', () => {
    let project;
    let expectedBlankCardData;

    beforeAll(async () => {
        const response = await fetch('/tests/fixtures/Blank.yml');
        expectedBlankCardData = await response.text();
    });

    beforeEach(async () => {
        project = await createTestProject();
    });

    afterAll(async () => {
        await deleteTestProject();
    });

    it('saves the project file to the filesystem', async () => {
        expect(project.filePath).toMatch(/test.cmproj$/);
        await project.save();
        const projectFileExists = await checkFileExists(project.filePath);
        expect(projectFileExists).toBeTrue();
    });

    describe('basic fields', () => {
        it('persists a new card to the filesystem', async () => {
            await createCard();
            setCardFields({ name: 'Test' });
            const path = await eventually(() => selectedProjectCard.files.get('data'));
            const exists = await checkFileExists(path);
            expect(exists).toBeTrue();
            expect(path).toMatch(/cards\/Test.yml$/);
        });

        it('persists default card data', async () => {
            await createCard();
            setCardFields({ name: 'Test' });
            setCardFields({ name: '' });
            const path = await eventually(() => selectedProjectCard.files.get('data'));
            const data = await readFile(path);
            expect(data).toEqual(expectedBlankCardData);
        });

        it('persists multiple cards', async () => {
            const cardA = await createCard();
            setCardFields({ name: 'Card A' });
            const cardB = await createCard();
            setCardFields({ name: 'Card B' });
            const pathA = await eventually(() => cardA.files.get('data'));
            const pathB = await eventually(() => cardB.files.get('data'));
            const existsA = await checkFileExists(pathA);
            const existsB = await checkFileExists(pathB);
            expect(existsA).toBeTrue();
            expect(existsB).toBeTrue();
            expect(pathA).toMatch(/cards\/Card A.yml$/);
            expect(pathB).toMatch(/cards\/Card B.yml$/);
        });

        it('persists changes to multiple fields', async () => {
            await createCard();
            setCardFields({ name: 'Test', manaCost: 'WUBRG' });
            const path = await eventually(() => selectedProjectCard.files.get('data'));
            const data = await YAMLSerializer.load(path);
            expect(data.front?.name).toEqual('Test');
            expect(String(data.front?.manaCost)).toEqual('WUBRG');
        });

        it('persists the final value after multiple changes', async () => {
            await createCard();
            setCardFields({ name: 'Swamp', superType: 'Land' });
            setCardFields({ superType: 'Basic Land', subType: 'Swamp' });
            const path = await eventually(() => selectedProjectCard.files.get('data'));
            const data = await YAMLSerializer.load(path);
            expect(data.front).toEqual(
                jasmine.objectContaining({
                    name: 'Swamp',
                    superType: 'Basic Land',
                    subType: 'Swamp',
                })
            );
        });

        it('persists changing fields to empty values', async () => {

        });

        it('persists changes to all fields correctly', async () => {

        });

        it('persists front and back face fields', async () => {

        });

        it('persists card tags', async () => {

        });

        it('persists card notes', async () => {

        });
    });

    describe('file naming', () => {
        it('defaults empty name to "blank"', async () => {

        });

        it('sanitizes filenames', async () => {

        });

        it('sanitizes " - " in filenames', async () => {

        });

        it('handles filename conflicts without changing card names', async () => {

        });

        it('is case insensitive when handling naming conflicts', async () => {

        });
    });

    describe('images', () => {
        it('persists card image files', async () => {

        });

        it('persists front and back image files', async () => {

        });

        it('persists changes to an image', async () => {

        });

        it('persists image crops', async () => {

        });

        it('removes image files when image is removed', async () => {

        });

        it('handles naming collisions', async () => {

        });
    });

    describe('renaming', () => {
        it('does not rename when name is changed but matches', async () => {

        });

        it('renames the card file when the card name changes', async () => {

        });

        it('renames to a safe filename when a conflict exists', async () => {

        });

        it('renames card image files when the card name changes', async () => {

        });
    });

    describe('removal', () => {
        it('removes the card data file when card is deleted', async () => {

        });

        it('removes the card image files when card is deleted', async () => {

        });

        it('removes the right files when a naming conflict exists', async () => {

        });

        it('works with removing multiple cards at the same time', async () => {

        });

        it('does not rename cards named to avoid collisions', async () => {

        });

        it('does not recreate the card when a save was pending', async () => {

        });
    });

    describe('copy/paste', () => {
        it('creates a new card', async () => {

        });

        it('can create multiple cards', async () => {

        });

        it('copies all field values', async () => {

        });

        it('saves image to a new file', async () => {

        });

        it('does not change pasted card when source is changed later', async () => {

        });

        it('does not change the source card when pasted card is changed', async () => {

        });

        it('creates a card after source is removed', async () => {

        });

        it('works with copying a pasted card', async () => {

        });

        it('creates multiple independent cards on multiple pastes', async () => {

        });
    });
});
