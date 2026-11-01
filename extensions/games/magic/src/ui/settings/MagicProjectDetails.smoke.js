import { wideSymbol } from '../../domain/setSymbol/setSymbol.fixture.js';

describe('Magic project settings', () => {
    let settings, originalSymbol;

    beforeEach(() => {
        originalSymbol = activeProject.symbol;
        activeProject.symbol = wideSymbol;
        settings = document.createElement('cm-magic-project-details');
        document.body.append(settings);
    });

    afterEach(() => {
        settings.remove();
        activeProject.symbol = originalSymbol;
        changed(activeProject, 'symbol');
    });

    it('previews all five palettes at their natural aspect ratio', () => {
        const preview = settings.querySelector('cm-edit-set-symbol');
        const symbols = [...preview.querySelectorAll('svg')];
        expect(symbols.length).toBe(5);
        const colors = symbols.map(svg => {
            return svg.querySelector('stop').getAttribute('stop-color');
        });
        expect(colors).toEqual([
            '#000000', '#6c7d8f', '#876c13', '#b02929', '#240f3d'
        ]);
        for (const svg of symbols) {
            const bounds = svg.getBoundingClientRect();
            expect(bounds.height).toBeGreaterThan(0);
            expect(bounds.width / bounds.height).toBeCloseTo(2);
        }
        activeProject.symbol = wideSymbol.replace('200 100', '100 100');
        changed(activeProject, 'symbol');
        expect(preview.querySelectorAll('svg').length).toBe(5);
        expect(preview.querySelector('svg').getAttribute('width')).toBe('100');
    });
});
