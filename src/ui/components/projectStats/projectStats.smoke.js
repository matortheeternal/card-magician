import { aggregateStatistics, cardRecord, CARD_TYPES } from './statisticsData.js';
import {
    createTestProject, deleteTestProject, eventually
} from '../../../shared/testing/testUtils.js';

describe('Statistics', () => {
    let stats;
    let tabs;
    const makeCard = (manaCost, superType, rarity = 'common', other = {}) => (
        new activeGame.Card({ front: {
            manaCost: activeGame.ManaScribe.ManaCost.parse(manaCost),
            superType, rarity, ...other
        } })
    );

    beforeEach(async () => {
        await createTestProject();
        activeProject.cards = [
            makeCard('1W', 'Artifact Creature'),
            makeCard('UU', 'Instant', 'rare'),
            makeCard('2RG', 'Creature', 'uncommon'),
            makeCard('', 'Basic Land', 'land'),
            makeCard('3', 'Artifact')
        ];
        changed(activeProject, 'cards');
        tabs = document.querySelector('#workspace-tabs');
        stats = document.querySelector('cm-project-stats');
        tabs.show('statistics');
        await eventually(() => stats.querySelector('.stats-chart svg'));
    });

    afterEach(async () => {
        stats.chartType = 'line';
        stats.hiddenColors.clear();
        stats.includeLands = false;
        stats.update();
        await deleteTestProject();
    });

    afterAll(async () => {
        await createTestProject();
        tabs.show('cards');
        await deleteTestProject();
    });

    it('counts each card once by color and rarity, and each applicable type', () => {
        const data = stats.data;
        expect(data.total).toBe(5);
        expect(data.totals).toEqual([1, 1, 0, 0, 0, 1, 2]);
        expect(data.rarity[0][0]).toBe(1);
        expect(data.type[0][CARD_TYPES.indexOf('Creature')]).toBe(1);
        expect(data.type[0][CARD_TYPES.indexOf('Artifact')]).toBe(1);
        expect(data.rarity[6][5]).toBe(1);
        expect(data.curveTotal).toBe(4);
        expect(data.labels).toEqual(['0', '1', '2', '3', '4']);
        expect(data.series[0].values).toEqual([0, 0, 1, 0, 0]);
    });

    it('uses overrides, excludes back faces, and bounds extreme custom costs', () => {
        const card = makeCard('99R', 'Creature', 'rare', { colorOverride: ['g'] });
        card.back = { manaCost: activeGame.ManaScribe.ManaCost.parse('U') };
        const record = cardRecord(card, activeGame);
        expect(record.color).toBe('g');
        const data = aggregateStatistics([record]);
        expect(data.labels.at(-1)).toBe('20+');
        expect(data.series[4].values.at(-1)).toBe(1);
        expect(aggregateStatistics([]).total).toBe(0);
        expect(aggregateStatistics([{ ...record, manaValue: null }])
            .invalidCosts).toBe(1);
    });

    it('renders both matrices and accessible color symbols', async () => {
        expect(stats.querySelectorAll('[data-matrix] tbody tr').length).toBe(14);
        const symbol = stats.querySelector('[data-matrix] sl-tooltip');
        expect(symbol.content).toBe('White');
        expect(symbol.querySelector('img').getAttribute('aria-label')).toBe('White');
        expect(stats.querySelector('[data-color="m"] img').src)
            .toContain('/games/magic/assets/multicolor.svg');
        await eventually(() => [...stats.querySelectorAll('img')]
            .every(image => image.complete && image.naturalWidth > 0));
    });

    it('switches D3 between lines and grouped bars and hides colors', async () => {
        stats.querySelector('[data-color="u"]').click();
        await eventually(() => stats.querySelectorAll('.stats-chart path').length === 6);
        expect(stats.querySelector('[data-color="u"]').getAttribute('aria-pressed'))
            .toBe('false');
        stats.querySelector('[data-chart-type="bar"]').click();
        await eventually(() => stats.querySelectorAll('.stats-chart g rect').length > 0);
        expect(stats.querySelectorAll('.stats-chart path').length).toBe(0);
        expect(stats.querySelectorAll('.stats-curve-table tbody tr').length).toBe(6);
    });

    it('shows a shared tooltip on hover and keyboard focus in both chart types', async () => {
        const hoverManaTwo = () => {
            const region = stats.querySelectorAll('.stats-hit-region')[2];
            region.dispatchEvent(new PointerEvent('pointerenter'));
            return region;
        };
        let region = hoverManaTwo();
        let tooltip = stats.querySelector('.stats-chart-tooltip');
        expect(tooltip.hidden).toBeFalse();
        expect(tooltip.textContent).toContain('Mana value 2');
        expect(tooltip.querySelectorAll('.stats-tooltip-row').length).toBe(7);
        expect(tooltip.textContent).toContain('White1 card');
        region.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(tooltip.hidden).toBeTrue();
        region.focus();
        expect(tooltip.hidden).toBeFalse();
        stats.querySelector('[data-color="u"]').click();
        await eventually(() => stats.querySelectorAll('.stats-tooltip-row').length === 6);
        stats.querySelector('[data-chart-type="bar"]').click();
        await eventually(() => stats.querySelectorAll('.stats-chart circle').length === 0);
        region = hoverManaTwo();
        tooltip = stats.querySelector('.stats-chart-tooltip');
        expect(tooltip.hidden).toBeFalse();
        expect(tooltip.textContent).not.toContain('Blue');
        stats.querySelector('.stats-chart svg')
            .dispatchEvent(new PointerEvent('pointerleave'));
        expect(tooltip.hidden).toBeTrue();
    });

    it('handles hidden series, land inclusion, and project updates', async () => {
        const checkbox = stats.querySelector('[data-include-lands]');
        checkbox.click();
        expect(stats.data.curveTotal).toBe(5);
        for (const button of stats.querySelectorAll('[data-color]')) button.click();
        await eventually(() => stats.querySelector('.stats-chart-empty'));
        expect(stats.querySelector('.stats-chart-empty').textContent)
            .toContain('Select a color');
        activeProject.cards = [];
        changed(activeProject, 'cards');
        expect(stats.data.total).toBe(0);
        expect(stats.querySelector('.stats-empty').hidden).toBeFalse();
    });
});
