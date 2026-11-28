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

    it('indexes keywords across faces and saves them on the card', async () => {
        await platform.createDirectory(activeProject.cardsFolderPath);
        const front = {
            rulesText: 'Flying, trample\nTarget creature gains haste.',
            adventure: { rulesText: 'Vigilance' }
        };
        await writeCard('Keywords.yml', { front, back: { rulesText: 'Trample' } });
        const project = await loadProject();
        const [card] = project.cards;

        expect(card.keywords).toEqual(['flying', 'trample', 'vigilance']);
        expect(activeGame.filter(project.cards, 'kw:trample')).toEqual([card]);
        expect(activeGame.filter(project.cards, 'kw:haste')).toEqual([]);

        card.front.rulesText = 'Flying';
        card.back.rulesText = '';
        await card.saveData();
        const path = await platform.getJoinedPath(
            project.cardsFolderPath, 'Keywords.yml'
        );
        const saved = await YAMLSerializer.load(path);
        expect(saved.keywords).toEqual(['flying', 'vigilance']);
        expect(saved.front.keywords).toBeUndefined();
        expect(activeGame.filter(project.cards, 'kw:trample')).toEqual([]);
    });
});
