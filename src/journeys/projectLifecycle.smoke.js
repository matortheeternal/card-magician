import platform from '../shared/platformAdapter.js';
import {
    createCard, eventually, expectFilesToMatch, flushCard, setCardFields
} from '../shared/testing/testUtils.js';
import { finishProgress } from '../shared/testing/steps/progress.js';

const PROJECT_NAME = 'Lifecycle Set';

function nextEvent(target, eventName) {
    return new Promise(resolve => {
        target.addEventListener(eventName, resolve, { once: true });
    });
}

function typeInto(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('sl-input', { bubbles: true, composed: true }));
}

function findMenuItem(menuId, label) {
    const items = document.querySelectorAll(
        `title-bar-menu[data-menu-id="${menuId}"] sl-menu-item`
    );
    return [...items].find(item => {
        return item.querySelector('.menu-item > div')?.textContent.trim() === label;
    });
}

async function createProjectFromStartScreen(folder) {
    const startScreen = await eventually(() => {
        return document.querySelector('cm-start-screen cm-project-select');
    });
    startScreen.querySelector('[data-click-action="newProject"]').click();
    const form = await eventually(() => document.querySelector('cm-new-project-form'));
    const fields = form.locationFields;
    await eventually(() => fields.folderInput.value);
    typeInto(fields.nameInput, PROJECT_NAME);
    fields.setFolder(folder);
    expect(form.gameSelect.selectedGameId).toBe('magic');
    await form.createButton.updateComplete;
    const loaded = nextEvent(document.body, 'cm-loaded');
    form.createButton.click();
    await loaded;
}

async function exportAll() {
    findMenuItem('export', 'Export All').click();
    await finishProgress('export');
}

async function reopenFromRecentProjects() {
    const previous = activeProject;
    findMenuItem('file', `${PROJECT_NAME}.cmproj`).click();
    await eventually(() => activeProject !== previous);
}

describe('Project lifecycle', () => {
    let folder, art;

    beforeAll(async () => {
        folder = await platform.getJoinedPath(appEnvironment.paths.data, 'lifecycle');
        try { await platform.rmrf(folder); } catch {}
        const response = await fetch('/tests/fixtures/art.jpg');
        art = new File([await response.blob()], 'art.jpg', { type: 'image/jpeg' });
    });

    afterAll(async () => {
        await platform.rmrf(folder);
    });

    const flow = 'creates a project from the start screen, exports it, and reopens it';

    it(flow, async () => {
        await createProjectFromStartScreen(folder);
        const projectPath = await platform.getJoinedPath(
            folder, PROJECT_NAME, `${PROJECT_NAME}.cmproj`
        );
        expect(activeProject.filePath).toBe(projectPath);

        const card = await createCard();
        await setCardFields({ name: 'Lifecycle Bear', artImage: art });
        await flushCard();
        await exportAll();
        const exported = activeProject.exportInfo[card.baseName].imageExports.front;
        const exportedPath = await platform.getJoinedPath(
            activeProject.folderPath, 'dist', exported.filePath
        );
        expect(await platform.checkFileExists(exportedPath)).toBeTrue();
        expect(await platform.checkFileExists(activeProject.exportInfoPath)).toBeTrue();

        await reopenFromRecentProjects();
        expect(activeProject.filePath).toBe(projectPath);
        const [reopened] = activeProject.cards;
        expect(reopened.front.name).toBe('Lifecycle Bear');
        const artPath = reopened.files.get('front.artImage');
        const artBytes = await platform.readBinaryFile(artPath);
        await expectFilesToMatch(new File([artBytes], ''), art);
        expect(activeProject.exportInfo[reopened.baseName].imageExports.front)
            .toEqual(exported);
    }, 60000);
});
