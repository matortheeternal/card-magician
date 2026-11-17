import platform from '../shared/platformAdapter.js';
import { executeAction } from '../ui/systems/actionSystem.js';
import { closeModal, getActiveModal } from '../ui/modals/modalManager.js';
import { watch } from '../shared/reactivity.js';
import {
    createTestProject, deleteTestProject, eventually, flushCard, setCardFields
} from '../shared/testing/testUtils.js';
import { loadImageFixture } from '../shared/testing/steps/fixtures.js';
import { cardFilePaths, expectFilesExist } from '../shared/testing/steps/disk.js';
import { addNamedCard } from '../shared/testing/steps/cardList.js';
import { dismissDialog } from '../shared/testing/steps/dialogs.js';
import { emptyDataFolder } from '../shared/testing/steps/projects.js';

const SYMBOL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
    <path d="M0 0h100v100z"/></svg>`;

async function openNewProjectDialog() {
    await executeAction('new-project');
    const modal = getActiveModal();
    await eventually(() => modal.locationFields.folderInput.value);
    return modal;
}

function chooseLocation(modal, name, folder) {
    modal.locationFields.projectName = name;
    modal.locationFields.setFolder(folder);
}

async function createProjectNamed(name, folder) {
    const modal = await openNewProjectDialog();
    chooseLocation(modal, name, folder);
    await modal.create();
}

describe('Projects', () => {
    let art, folder;

    beforeAll(async () => {
        art = await loadImageFixture('art.jpg');
    });

    afterEach(async () => {
        closeModal();
        await flushCard();
        if (folder) await platform.rmrf(folder);
        folder = undefined;
    });

    async function expectCreatedProject(name) {
        const expected = await platform.getJoinedPath(folder, name, `${name}.cmproj`);
        expect(activeProject.filePath).toBe(expected);
        await expectFilesExist([expected]);
        expect(activeGame.config.recentProjects[0].filePath).toBe(expected);
    }

    async function switchWithPendingEdits(card) {
        await setCardFields({ rulesText: 'Saved before switching' });
        const modal = await openNewProjectDialog();
        expect(modal.locationFields.location).toEqual({ name: '', folder });
        chooseLocation(modal, 'Second Set', folder);
        await modal.create();
        await flushCard();
        await expectCreatedProject('Second Set');
        expect(await platform.readFile(card.files.get('data')))
            .toContain('Saved before switching');
        expect(await platform.checkFolderExists(activeProject.cardsFolderPath))
            .withContext('pending edits written into the new project').toBeFalse();
    }

    async function refuseExistingFolder() {
        await platform.createDirectory(await platform.getJoinedPath(folder, 'Taken'));
        const previous = activeProject;
        const modal = await openNewProjectDialog();
        chooseLocation(modal, 'Taken', folder);
        const creating = modal.create();
        expect(await dismissDialog()).toContain('Taken');
        await creating;
        expect(getActiveModal()).toBe(modal);
        expect(activeProject).toBe(previous);
    }

    it('creates projects from the New project dialog and switches between them',
       async () => {
           folder = await emptyDataFolder('new-projects');
           await createProjectNamed('My Set', folder);
           await expectCreatedProject('My Set');
           const card = await addNamedCard('Pending', { artImage: art });
           await expectFilesExist(cardFilePaths([card]));
           await switchWithPendingEdits(card);
           await refuseExistingFolder();
       }, 30000);

    it('stops watching the files of a project it has left or moved away from',
       async () => {
           await createTestProject();
           activeProject.symbol = SYMBOL;
           const left = activeProject;
           await left.saveSymbol();
           await createTestProject();
           const seen = [];
           const unwatch = watch(activeProject, 'symbol', () => {
               seen.push(activeProject.symbol);
           });
           const previousPath = activeProject.symbolPath;
           const originalSymbol = activeProject.symbol;
           const relocated = await platform.getJoinedPath(
               activeProject.folderPath, 'relocated', 'test.cmproj'
           );
           await platform.writeFile(
               await platform.getJoinedPath(activeProject.folderPath, 'relocated',
                                            'symbol.svg'),
               SYMBOL.replace('200 100', '400 100')
           );
           await activeProject.setFilePath(relocated);
           expect(activeProject.symbol).toBe(originalSymbol);
           try {
               await platform.writeFile(
                   left.symbolPath, SYMBOL.replace('200 100', '100 100')
               );
               await platform.writeFile(
                   previousPath, SYMBOL.replace('200 100', '300 100')
               );
               await platform.writeFile(activeProject.symbolPath, SYMBOL);
               await eventually(() => activeProject.symbol === SYMBOL);
               expect(left.symbol).toBe(SYMBOL);
               expect(seen.filter(symbol => symbol?.includes('300 100'))).toEqual([]);
           } finally {
               unwatch();
               await deleteTestProject();
           }
       });
});
