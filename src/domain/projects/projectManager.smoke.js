import platform from '../../shared/platformAdapter.js';
import { executeAction } from '../../ui/systems/actionSystem.js';
import { dialogSystem } from '../../ui/systems/dialogSystem.js';
import { closeModal, getActiveModal } from '../../ui/modals/modalManager.js';
import {
    createCard, createTestProject, deleteTestProject, eventually, flushCard,
    setCardFields
} from '../../shared/testing/testUtils.js';

describe('Project manager', () => {
    const folders = [];
    let art;

    async function dataFolder(name) {
        const folder = await platform.getJoinedPath(appEnvironment.paths.data, name);
        try { await platform.rmrf(folder); } catch {}
        folders.push(folder);
        return folder;
    }

    beforeAll(async () => {
        const response = await fetch('/tests/fixtures/art.jpg');
        art = new File([await response.blob()], 'art.jpg', { type: 'image/jpeg' });
    });

    afterEach(async () => {
        await flushCard();
        for (const folder of folders.splice(0))
            try { await platform.rmrf(folder); } catch {}
    });

    describe('project files', () => {
        beforeEach(async () => {
            await createTestProject();
            activeProject.symbol = `<svg xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 100"><path d="M0 0h100v100z"/></svg>`;
        });
        afterEach(async () => { await deleteTestProject(); });

        it('stops observing the old project after switching projects or saving elsewhere',
           async () => {
               const old = activeProject;
               const source = old.symbol;
               await old.saveSymbol();
               await createTestProject();
               await platform.writeFile(
                   old.symbolPath, source.replace('200 100', '100 100')
               );
               await new Promise(resolve => { setTimeout(resolve, 700); });
               expect(old.symbol).toBe(source);
               const previousPath = activeProject.symbolPath;
               const destination = await platform.getJoinedPath(
                   activeProject.folderPath, 'relocated', 'test.cmproj'
               );
               const originalSymbol = activeProject.symbol;
               const destinationSymbol = await platform.getJoinedPath(
                   activeProject.folderPath, 'relocated', 'symbol.svg'
               );
               await platform.writeFile(
                   destinationSymbol, source.replace('200 100', '400 100')
               );
               await activeProject.setFilePath(destination);
               expect(activeProject.symbol).toBe(originalSymbol);
               await platform.writeFile(
                   previousPath, source.replace('200 100', '300 100')
               );
               await new Promise(resolve => { setTimeout(resolve, 700); });
               expect(activeProject.symbol).not.toContain('300 100');
               await platform.writeFile(activeProject.symbolPath, source);
               await eventually(() => activeProject.symbol === source);
           });
    });

    describe('new projects', () => {
        async function openNewProjectModal() {
            await executeAction('new-project');
            const modal = getActiveModal();
            await eventually(() => modal.locationFields.folderInput.value);
            return modal;
        }

        async function chooseNewProject({ name, folder }) {
            spyOn(dialogSystem, 'alert').and.resolveTo();
            const modal = await openNewProjectModal();
            modal.locationFields.projectName = name;
            modal.locationFields.setFolder(folder);
            await modal.create();
            return modal;
        }

        afterEach(() => { closeModal(); });

        it('creates the project on disk in its own folder', async () => {
            const folder = await dataFolder('new-projects');
            await chooseNewProject({ name: 'My Set', folder });
            const expected = await platform.getJoinedPath(
                folder, 'My Set', 'My Set.cmproj'
            );
            expect(activeProject.filePath).toBe(expected);
            expect(await platform.checkFileExists(expected)).toBeTrue();
            const recent = activeGame.config.recentProjects[0];
            expect(recent.filePath).toBe(expected);
        });

        it('offers the last used location for the next project', async () => {
            const folder = await dataFolder('new-project-location');
            await chooseNewProject({ name: 'First', folder });
            const { locationFields } = await openNewProjectModal();
            expect(locationFields.location).toEqual({ name: '', folder });
        });

        it('persists cards edited in a new project', async () => {
            const folder = await dataFolder('new-project-cards');
            await chooseNewProject({ name: 'Cards', folder });
            const card = await createCard();
            await setCardFields({ name: 'Unsaved', artImage: art });
            await flushCard();
            expect(await platform.checkFileExists(card.files.get('data'))).toBeTrue();
            const image = card.files.get('front.artImage');
            expect(await platform.checkFileExists(image)).toBeTrue();
        });

        it('keeps the modal open instead of reusing an existing folder', async () => {
            const folder = await dataFolder('new-project-taken');
            await platform.createDirectory(await platform.getJoinedPath(folder, 'Taken'));
            const previous = activeProject;
            const modal = await chooseNewProject({ name: 'Taken', folder });
            expect(dialogSystem.alert).toHaveBeenCalledTimes(1);
            expect(getActiveModal()).toBe(modal);
            expect(activeProject).toBe(previous);
        });
    });

    describe('switching', () => {
        it('saves pending card edits to the previous project first', async () => {
            const project = await createTestProject();
            folders.push(project.folderPath);
            const card = await createCard();
            await setCardFields({ name: 'Pending' });
            await flushCard();
            const dataPath = card.files.get('data');
            await setCardFields({ rulesText: 'Saved before switching' });
            const next = await createTestProject();
            folders.push(next.folderPath);
            await new Promise(resolve => { setTimeout(resolve, 1500); });
            expect(await platform.readFile(dataPath)).toContain('Saved before switching');
            const leaked = await platform.checkFolderExists(next.cardsFolderPath);
            expect(leaked).toBeFalse();
        });
    });
});
