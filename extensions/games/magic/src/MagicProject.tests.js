import { installProject } from '../../../../src/domain/projects/projectManager.js';
import { buildCard } from '../../../../src/domain/card/cardBuilder.js';
import RenderScheduler from '../../../../src/domain/template/renderScheduler.js';
import { useGame } from '../../../../src/shared/testing/gameFixture.js';

describe('Magic auto numbering', () => {
    useGame('magic');

    function addCard(project, name) {
        const card = new activeGame.Card({ front: { template: 'magic/M15/Main', name } });
        project.cards.push(card);
        changed(project, 'cards');
        return card;
    }

    it('renumbers cards and the open editor as soon as cards change', async () => {
        const project = new activeGame.Project({ collectorNumberFormat: 'four' });
        installProject(project);
        const zebra = addCard(project, 'Zebra');
        expect(zebra.front.autoCollectorNumber).toBe('0001');
        const editor = await buildCard(zebra);
        try {
            expect(editor.front.autoCollectorNumber).toBe('0001');
            addCard(project, 'Aardvark');
            expect(zebra.front.autoCollectorNumber).toBe('0002');
            expect(editor.front.autoCollectorNumber).toBe('0002');
            zebra.front.name = 'Aaa';
            changed(project, 'cards');
            expect(editor.front.autoCollectorNumber).toBe('0001');
        } finally {
            await RenderScheduler.settle();
            editor.front.dispose();
        }
    });
});
