import platform from '../shared/platformAdapter.js';
import { executeAction } from '../ui/systems/actionSystem.js';
import { createProject } from '../domain/projects/projectManager.js';
import { getActiveModal } from '../ui/modals/modalManager.js';
import { eventually, expectCardData } from '../shared/testing/testUtils.js';
import { loadImageFixture } from '../shared/testing/steps/fixtures.js';
import { expectFileContent } from '../shared/testing/steps/disk.js';
import { finishProgress } from '../shared/testing/steps/progress.js';
import { emptyDataFolder, reopenProject } from '../shared/testing/steps/projects.js';

async function copyFixtureTo(folder, name) {
    const response = await fetch(`/tests/fixtures/${name}`);
    const filePath = await platform.getJoinedPath(folder, name);
    await platform.writeBinaryFile(filePath, await response.arrayBuffer());
    return filePath;
}

async function chooseImportLocation(folder) {
    const modal = await eventually(() => {
        const active = getActiveModal();
        return active?.locationFields && active;
    });
    expect(modal.locationFields.location.name).toBe('fixture');
    modal.locationFields.setFolder(folder);
    await modal.create();
    await finishProgress('import');
}

async function chooseImportDestination(label) {
    const button = await eventually(() => {
        const buttons = document.querySelectorAll('sl-dialog.service-dialog sl-button');
        return [...buttons].find(button => button.textContent === label);
    });
    button.click();
}

async function expectImportedCards(project, art) {
    const [bear, bolt] = project.cards;
    expect(project.cards.length).toBe(2);
    expectCardData(bear.front, {
        name: 'Fixture Bear', manaCost: '1G', superType: 'Creature', subType: 'Bear',
        rarity: 'uncommon', rulesText: 'Trample', power: '2', toughness: '2',
        illustrator: 'Fixture Artist'
    });
    expectCardData(bolt.front, {
        name: 'Fixture Bolt', manaCost: 'R', superType: 'Instant', rarity: 'common'
    });
    await expectFileContent(bear.files.get('front.artImage'), art);
}

async function prepareFixture(folderName) {
    const folder = await emptyDataFolder(folderName);
    await platform.createDirectory(folder);
    const art = await loadImageFixture('art.jpg');
    const setPath = await copyFixtureTo(folder, 'fixture.mse-set');
    spyOn(platform, 'openSingleFileDialog').and.resolveTo(setPath);
    return { folder, art };
}

function expectStartScreenLayout(projectSelect) {
    const header = projectSelect.querySelector('header');
    const actions = [...header.querySelectorAll('sl-button')];
    const searchBounds = header.querySelector('sl-input').getBoundingClientRect();
    const list = projectSelect.querySelector('ul');
    const projectBounds = projectSelect.getBoundingClientRect();
    const actionBounds = actions.map(action => action.getBoundingClientRect());
    expect(actionBounds.every(bounds => bounds.top === searchBounds.top)).toBeTrue();
    expect(searchBounds.width).toBeGreaterThanOrEqual(192);
    expect(actionBounds.at(-1).right).toBeLessThan(window.innerWidth);
    expect(list.getBoundingClientRect().right).toBeCloseTo(window.innerWidth, 0);
    expect(list.getBoundingClientRect().bottom).toBeCloseTo(projectBounds.bottom, 0);
    expect(getComputedStyle(list).paddingRight).not.toBe('0px');
    expect(getComputedStyle(list).overflowY).toBe('auto');
}

describe('Start screen MSE import', () => {
    let folder;

    afterEach(async () => {
        if (folder) await platform.rmrf(folder);
    });

    it('opens an MSE set as a new project from the start screen', async () => {
        const fixture = await prepareFixture('start-imported-sets');
        folder = fixture.folder;
        const projectSelect = document.querySelector('cm-project-select');
        await Promise.all([...projectSelect.querySelectorAll('sl-button, sl-input')]
            .map(control => control.updateComplete));
        expectStartScreenLayout(projectSelect);
        const dropdown = projectSelect.querySelector('sl-dropdown');
        dropdown.querySelector('sl-button[slot="trigger"]').click();
        await eventually(() => dropdown.open);
        dropdown.querySelector('sl-menu-item[value="mse"]').click();
        await chooseImportLocation(folder);
        expect(document.querySelector('#workspace-tabs')).not.toBeNull();
        const expected = await platform.getJoinedPath(
            folder, 'fixture', 'fixture.cmproj'
        );
        expect(activeProject.filePath).toBe(expected);
        expect(activeGame.config.recentProjects[0].filePath).toBe(expected);
        await expectImportedCards(await reopenProject(), fixture.art);
    }, 30000);
});

describe('MSE import', () => {
    let folder;

    afterEach(async () => {
        if (folder) await platform.rmrf(folder);
    });

    it('reuses an empty project and offers destinations once it has cards', async () => {
        const fixture = await prepareFixture('imported-sets');
        folder = fixture.folder;
        const currentPath = await platform.getJoinedPath(folder, 'current.cmproj');
        await createProject(currentPath);
        const project = activeProject;

        await executeAction('import-mse-set');
        await finishProgress('import');
        expect(activeProject).toBe(project);
        expect(activeProject.filePath).toBe(currentPath);
        await expectImportedCards(await reopenProject(), fixture.art);

        const cancelImport = executeAction('import-mse-set');
        await chooseImportDestination('Cancel');
        await cancelImport;
        expect(activeProject.cards.length).toBe(2);

        const appendImport = executeAction('import-mse-set');
        await chooseImportDestination('Add to current project');
        await appendImport;
        await finishProgress('import');
        expect(activeProject.filePath).toBe(currentPath);
        const appended = await reopenProject();
        expect(appended.cards.length).toBe(4);
        expect(new Set(appended.cards.map(card => card.baseName)).size).toBe(4);

        const newImport = executeAction('import-mse-set');
        await chooseImportDestination('Create a new project');
        await newImport;
        await chooseImportLocation(folder);
        const expected = await platform.getJoinedPath(
            folder, 'fixture', 'fixture.cmproj'
        );
        expect(activeProject.filePath).toBe(expected);
        await expectImportedCards(await reopenProject(), fixture.art);
    }, 60000);
});
