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
});
