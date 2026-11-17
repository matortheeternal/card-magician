import platform from '../../shared/platformAdapter.js';
import YAMLSerializer from './serializers/YAMLSerializer.js';
import { useGame } from '../../shared/testing/gameFixture.js';
import { useProjectOnDisk } from '../../shared/testing/projectFixture.js';

describe('Project loading', () => {
    useGame('magic');
    useProjectOnDisk('project-loading');

    async function writeCard(fileName, data) {
        const folder = activeProject.cardsFolderPath;
        const path = await platform.getJoinedPath(folder, fileName);
        await YAMLSerializer.save(path, { front: { name: fileName }, ...data });
    }

    async function loadProject() {
        await activeProject.save();
        return activeGame.Project.load(activeProject.filePath);
    }

    it('loads cards in creation order, then unnumbered cards by file name', async () => {
        await platform.createDirectory(activeProject.cardsFolderPath);
        await writeCard('Zebra.yml', { sequence: 2 });
        await writeCard('Lightning Bolt.yml', {});
        await writeCard('Ant.yml', { sequence: 1 });
        await writeCard('Lightning Bolt-2.yml', {});

        const project = await loadProject();

        expect(project.cards.map(card => card.front.name)).toEqual([
            'Ant.yml', 'Zebra.yml', 'Lightning Bolt-2.yml', 'Lightning Bolt.yml'
        ]);
        expect(project.cards.map(card => card.sequence)).toEqual([1, 2, 3, 4]);
        const next = new activeGame.Card();
        project.numberCard(next);
        expect(next.sequence).toBe(5);
    });
});
