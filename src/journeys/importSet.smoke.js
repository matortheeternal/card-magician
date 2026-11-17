import platform from '../shared/platformAdapter.js';
import { executeAction } from '../ui/systems/actionSystem.js';
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

async function importSetInto(setPath, folder) {
    spyOn(platform, 'openSingleFileDialog').and.resolveTo(setPath);
    await executeAction('import-mse-set');
    await eventually(() => getActiveModal()?.locationFields);
    const modal = getActiveModal();
    expect(modal.locationFields.location.name).toBe('fixture');
    modal.locationFields.setFolder(folder);
    await modal.create();
    await finishProgress('import');
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

describe('MSE import', () => {
    let folder;

    afterEach(async () => {
        await platform.rmrf(folder);
    });

    it('imports an MSE set into a new project and reopens it', async () => {
        folder = await emptyDataFolder('imported-sets');
        await platform.createDirectory(folder);
        const art = await loadImageFixture('art.jpg');
        const setPath = await copyFixtureTo(folder, 'fixture.mse-set');

        await importSetInto(setPath, folder);
        const expected = await platform.getJoinedPath(
            folder, 'fixture', 'fixture.cmproj'
        );
        expect(activeProject.filePath).toBe(expected);
        expect(activeGame.config.recentProjects[0].filePath).toBe(expected);
        await expectImportedCards(activeProject, art);

        await expectImportedCards(await reopenProject(), art);
    }, 30000);
});
