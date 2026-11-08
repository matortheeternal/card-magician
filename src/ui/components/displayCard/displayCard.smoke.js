import platform from '../../../shared/platformAdapter.js';
import { watch } from '../../../shared/reactivity.js';
import {
    createCard, createTestProject, deleteTestProject, eventually, flushCard,
    setCardFields
} from '../../../shared/testing/testUtils.js';

describe('Card display', () => {
    beforeEach(async () => {
        await createTestProject();
        activeProject.symbol = `<svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 100"><path fill="black" stroke="white"
            stroke-width="8" d="M10 10h180v80H10z"/></svg>`;
    });

    afterEach(async () => { await deleteTestProject(); });

    it('renders a wide icon at 22px high on an actual card', async () => {
        await createCard();
        await setCardFields({ rarity: 'rare' });
        await flushCard();
        const svg = await eventually(() => {
            const face = document.querySelector('cm-display-card cm-card-face.front');
            return face?.shadowRoot.querySelector(
                'module-container[module="Rarity"] svg.rarity-rare'
            );
        });
        const style = getComputedStyle(svg);
        expect(style.height).toBe('22px');
        expect(style.width).toBe('44px');
        const bounds = svg.getBoundingClientRect();
        expect(bounds.width / bounds.height).toBeCloseTo(2);
    });

    it('reloads external symbol edits in settings and on the visible card', async () => {
        await activeProject.saveSymbol();
        await createCard();
        await setCardFields({ rarity: 'rare' });
        await flushCard();
        const settings = document.createElement('cm-magic-project-details');
        document.body.append(settings);
        const source = activeProject.symbol.replace('200 100', '100 100');
        let changes = 0;
        const unwatch = watch(activeProject, 'symbol', () => { changes++; });
        try {
            await platform.writeFile(activeProject.symbolPath, source);
            await eventually(() => activeProject.symbol === source);
            await eventually(() => {
                const face = document.querySelector('cm-display-card cm-card-face.front');
                const svg = face?.shadowRoot.querySelector(
                    'module-container[module="Rarity"] svg'
                );
                return svg?.getAttribute('viewBox') === '0 0 100 100';
            });
            expect(settings.querySelector('cm-edit-set-symbol svg')
                .getAttribute('viewBox')).toBe('0 0 100 100');
            const beforeSave = changes;
            await activeProject.saveSymbol();
            await new Promise(resolve => { setTimeout(resolve, 700); });
            expect(changes).toBe(beforeSave);
            await platform.rmrf(activeProject.symbolPath);
            await new Promise(resolve => { setTimeout(resolve, 700); });
            expect(activeProject.symbol).toBe(source);
            await platform.writeFile(activeProject.symbolPath, '<svg><broken');
            await new Promise(resolve => { setTimeout(resolve, 700); });
            expect(activeProject.symbol).toBe(source);
            const next = source.replace('100 100', '300 100');
            await platform.writeFile(activeProject.symbolPath, next);
            await eventually(() => activeProject.symbol === next);
        } finally {
            unwatch();
            settings.remove();
        }
    });


});
