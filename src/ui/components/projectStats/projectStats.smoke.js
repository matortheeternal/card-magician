import { queryStatistics } from '../../../domain/statistics/queryStatistics.js';
import StatisticsRegistry from '../../../domain/statistics/StatisticsRegistry.js';
import {
    createTestProject, deleteTestProject, eventually
} from '../../../shared/testing/testUtils.js';

describe('Statistics', () => {
    let stats;
    let tabs;
    let curve;
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
        curve = stats.querySelector('cm-chart[report="mana-curve"]');
        tabs.show('statistics');
        await eventually(() => stats.querySelector('.stats-chart svg'));
    });

    afterEach(async () => {
        curve.selectedType = null;
        curve.hiddenSeries.clear();
        curve.filterChecked = false;
        curve.requestUpdate();
        await deleteTestProject();
    });

    afterAll(async () => {
        await createTestProject();
        tabs.show('cards');
        await deleteTestProject();
    });

    it('counts each card once by color and rarity, and each applicable type', () => {
        const data = stats.querySelector('[report="color-rarity"]').data;
        const types = stats.querySelector('[report="color-type"]').data;
        expect(data.total).toBe(4);
        expect(data.rowTotals).toEqual([1, 1, 0, 0, 0, 1, 1]);
        expect(data.cells[0][0]).toBe(1);
        expect(types.cells[0][0]).toBe(1);
        expect(types.cells[0][3]).toBe(1);
        expect(data.columns.length).toBe(5);
        expect(curve.data.cardCount).toBe(4);
        expect(curve.data.labels).toEqual(['0', '1', '2', '3', '4']);
        expect(curve.data.series[0].values).toEqual([0, 0, 1, 0, 0]);
    });

    it('uses overrides, excludes back faces, and bounds extreme custom costs', () => {
        const card = makeCard('99R', 'Creature', 'rare', { colorOverride: ['g'] });
        card.back = { manaCost: activeGame.ManaScribe.ManaCost.parse('U') };
        const registry = activeGame.statistics;
        const record = registry.prepare(card);
        expect(record.color).toBe('g');
        const definition = registry.reports.get('mana-curve');
        const data = queryStatistics([record], registry, definition, 'series');
        expect(data.labels.at(-1)).toBe('8+');
        expect(data.series[4].values.at(-1)).toBe(1);
        expect(queryStatistics([], registry, definition, 'series').total).toBe(0);
        expect(queryStatistics([{ ...record, manaValue: null }], registry,
                               definition, 'series').excludedCount).toBe(1);
    });

    it('renders both matrices and accessible color symbols', async () => {
        expect(stats.querySelectorAll('.stats-render.stats-matrix tbody tr').length)
            .toBe(14);
        const symbol = stats.querySelector('.stats-render.stats-matrix sl-tooltip');
        expect(symbol.content).toBe('White');
        expect(symbol.querySelector('img').getAttribute('aria-label')).toBe('White');
        expect(stats.querySelector('[aria-label="Multicolor"] img').src)
            .toContain('/games/magic/assets/multicolor.svg');
        await eventually(() => [...stats.querySelectorAll('img')]
            .every(image => image.complete && image.naturalWidth > 0));
    });

    it('switches D3 between lines and grouped bars and hides colors', async () => {
        curve.querySelector('[data-series="1"]').click();
        await eventually(() => stats.querySelectorAll('.stats-chart path').length === 6);
        expect(curve.querySelector('[data-series="1"]').getAttribute('aria-pressed'))
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
        curve.querySelector('[data-series="1"]').click();
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
        activeProject.cards.push(makeCard('', 'Land', 'rare'));
        changed(activeProject, 'cards');
        await eventually(() => curve.data.cardCount === 4);
        const checkbox = curve.querySelector('[data-filter-toggle]');
        checkbox.click();
        await eventually(() => curve.data.cardCount === 5);
        for (const button of curve.querySelectorAll('[data-series]')) button.click();
        await eventually(() => stats.querySelector('.stats-chart-empty'));
        expect(stats.querySelector('.stats-chart-empty').textContent)
            .toContain('Select a series');
        activeProject.cards = [];
        changed(activeProject, 'cards');
        expect(stats.context.records.length).toBe(0);
        expect(stats.querySelector('.stats-empty').hidden).toBeFalse();
    });

    it('excludes auxiliary cards and unsupported rarities from every chart', async () => {
        activeProject.cards.push(
            makeCard('1W', 'Token Creature'),
            makeCard('', 'Emblem', 'special'),
            makeCard('2G', 'Creature', 'common', { template: 'magic/M15/Token' }),
            makeCard('3R', 'Creature', 'bonus'),
            makeCard('', 'Basic Land', 'basic'),
            makeCard('2B', 'Creature', 'special')
        );
        changed(activeProject, 'cards');
        await eventually(() => curve.data.cardCount === 5);
        for (const chart of stats.querySelectorAll('cm-chart'))
            expect(chart.data.cardCount).toBe(5);
        expect(stats.querySelector('.stats-scope').textContent).toBe('');
        expect(curve.querySelector('.stats-description').textContent).toBe('');
        const registry = activeGame.statistics;
        const data = queryStatistics([
            registry.prepare(makeCard('8R', 'Creature')),
            registry.prepare(makeCard('7R', 'Creature')),
            registry.prepare(makeCard('6R', 'Creature'))
        ], registry, registry.reports.get('mana-curve'), 'series');
        expect(data.labels.at(-1)).toBe('8+');
        expect(data.series[3].values.at(-1)).toBe(2);
    });

    it('supports declarative non-Magic charts and visible configuration errors', async () => {
        const registry = new StatisticsRegistry();
        registry.registerDimension('faction', {
            label: 'Faction', values: record => [record.faction]
        });
        registry.registerDimension('rank', {
            label: 'Rank', values: record => [record.rank]
        });
        const chart = document.createElement('cm-chart');
        chart.setAttribute('type', 'matrix');
        chart.setAttribute('rows', 'faction');
        chart.setAttribute('columns', 'rank');
        chart.context = {
            registry, records: [{ faction: 'North', rank: 'Scout' }]
        };
        document.body.appendChild(chart);
        try {
            await eventually(() => chart.querySelector('tbody td'));
            expect(chart.querySelector('tbody th').textContent).toBe('North');
            expect(chart.querySelector('tbody td').textContent).toBe('1');
            chart.setAttribute('columns', 'unknown');
            await eventually(() => !chart.querySelector('.stats-chart-error').hidden);
            expect(chart.querySelector('.stats-chart-error').textContent)
                .toContain('Unknown statistics dimension');
        } finally { chart.remove(); }
    });

    it('supports game-scoped renderer registration and disposes renderers', async () => {
        const registry = new StatisticsRegistry();
        registry.registerDimension('group', {
            label: 'Group', values: record => [record.group]
        });
        const dispose = jasmine.createSpy('dispose');
        const calls = [];
        registry.registerChartType('test:summary', {
            label: 'Summary', shape: 'matrix',
            create: container => ({
                render: data => {
                    calls.push('render');
                    container.textContent = `Count: ${data.total}`;
                },
                resize: () => { calls.push('resize'); },
                dispose
            })
        });
        const chart = document.createElement('cm-chart');
        chart.definition = {
            type: 'test:summary', rows: 'group', columns: 'group'
        };
        chart.context = { registry, records: [{ group: 'A' }] };
        document.body.appendChild(chart);
        try {
            await eventually(() => chart.querySelector('.stats-render').textContent);
            expect(chart.querySelector('.stats-render').textContent).toBe('Count: 1');
            expect(calls[0]).toBe('render');
            chart.style.width = '400px';
            await eventually(() => calls.includes('resize'));
            expect(new StatisticsRegistry().getChartType('test:summary')).toBeUndefined();
        } finally { chart.remove(); }
        expect(dispose).toHaveBeenCalledTimes(1);
    });
});
