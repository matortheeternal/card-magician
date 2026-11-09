import { queryStatistics } from '../../../domain/statistics/queryStatistics.js';
import StatisticsRegistry from '../../../domain/statistics/StatisticsRegistry.js';
import Localization from '../../../shared/Localization.js';
import { setLocalization } from '../../../shared/localize.js';
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
        await new Promise(resolve => {
            requestAnimationFrame(() => { requestAnimationFrame(resolve); });
        });
        await eventually(() => stats.checkVisibility()
            && curve.querySelector('.stats-chart svg'));
    });

    afterEach(async () => {
        for (const chart of stats.querySelectorAll('cm-chart'))
            chart.definition = undefined;
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
        expect(curve.data.columns.map(column => column.label))
            .toEqual(['0', '1', '2', '3', '4']);
        expect(curve.data.cells[0]).toEqual([0, 0, 1, 0, 0]);
    });

    it('uses overrides, excludes back faces, and bounds extreme custom costs', () => {
        const card = makeCard('99R', 'Creature', 'rare', { colorOverride: ['g'] });
        card.back = { manaCost: activeGame.ManaScribe.ManaCost.parse('U') };
        const registry = activeGame.statistics;
        const record = registry.prepare(card);
        expect(record.color).toBe('g');
        const definition = registry.reports.get('mana-curve');
        const data = queryStatistics([record], registry, definition);
        expect(data.columns.at(-1).label).toBe('8+');
        expect(data.cells[4].at(-1)).toBe(1);
        expect(queryStatistics([], registry, definition).total).toBe(0);
        expect(queryStatistics([{ ...record, manaValue: null }], registry,
                               definition).excludedCount).toBe(1);
    });

    it('renders both matrices and accessible color symbols', async () => {
        expect(stats.querySelector('[data-chart-selection]')).toBeNull();
        expect(stats.querySelector('[report="color-rarity"]')
            .querySelectorAll('tbody tr').length).toBe(7);
        expect(stats.querySelector('[report="color-type"]')
            .querySelectorAll('tbody tr').length).toBe(7);
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
        await eventually(() => curve.querySelectorAll('.stats-chart path').length === 6);
        expect(curve.querySelector('[data-series="1"]').getAttribute('aria-pressed'))
            .toBe('false');
        stats.querySelector('[data-chart-type="bar"]').click();
        await eventually(() => curve.querySelectorAll('.stats-chart g rect').length > 0);
        expect(curve.querySelectorAll('.stats-chart path').length).toBe(0);
        expect(curve.querySelectorAll('.stats-curve-table tbody tr').length).toBe(6);
    });

    it(
        'shows a shared tooltip on hover and keyboard focus in both chart types',
        async () => {
            const hoverManaTwo = () => {
                const region = curve.querySelectorAll('.stats-hit-region')[2];
                region.dispatchEvent(new PointerEvent('pointerenter'));
                return region;
            };
            const region = hoverManaTwo();
            let tooltip = curve.querySelector('.stats-chart-tooltip');
            expect(tooltip.hidden).toBeFalse();
            expect(tooltip.textContent).toContain('Mana value 2');
            expect(tooltip.querySelectorAll('.stats-tooltip-row').length).toBe(7);
            expect(tooltip.textContent).toContain('White1 card');
            region.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            expect(tooltip.hidden).toBeTrue();
            region.focus({ preventScroll: true });
            expect(document.activeElement)
                .withContext('series region focus').toBe(region);
            expect(tooltip.hidden).toBeFalse();
            curve.querySelector('[data-series="1"]').click();
            await eventually(
                () => curve.querySelectorAll('.stats-tooltip-row').length === 6
            );
            stats.querySelector('[data-chart-type="bar"]').click();
            await eventually(() => {
                const circles = curve.querySelectorAll('.stats-chart circle');
                return circles.length === 0;
            });
            hoverManaTwo();
            tooltip = curve.querySelector('.stats-chart-tooltip');
            expect(tooltip.hidden).toBeFalse();
            expect(tooltip.textContent).not.toContain('Blue');
            curve.querySelector('.stats-chart svg')
                .dispatchEvent(new PointerEvent('pointerleave'));
            expect(tooltip.hidden).toBeTrue();
        });

    it('handles hidden series and project updates with lands excluded', async () => {
        activeProject.cards.push(makeCard('', 'Land', 'rare'));
        changed(activeProject, 'cards');
        await eventually(() => curve.data.cardCount === 4);
        expect(curve.controls.filterControl.hidden).toBeTrue();
        expect(curve.data.getRecords().some(record => record.isLand)).toBeFalse();
        for (const button of curve.querySelectorAll('[data-series]')) button.click();
        await eventually(() => curve.querySelector('.stats-chart-empty'));
        expect(curve.querySelector('.stats-chart-empty').textContent)
            .toContain('Select a series');
        activeProject.cards = [];
        changed(activeProject, 'cards');
        expect(stats.context.records.length).toBe(0);
        expect(stats.querySelector('.stats-empty').hidden).toBeFalse();
    });

    it('uses rarity alone to determine inclusion in every chart', async () => {
        activeProject.cards.push(
            makeCard('1W', 'Token Creature', 'token'),
            makeCard('', 'Emblem', 'emblem'),
            makeCard('2G', 'Creature', 'token', { template: 'magic/M15/Token' }),
            makeCard('3R', 'Creature', 'bonus'),
            makeCard('', 'Basic Land', 'basic'),
            makeCard('2B', 'Creature', 'special')
        );
        changed(activeProject, 'cards');
        await eventually(() => curve.data.cardCount === 5);
        const charts = stats.querySelectorAll(
            '[report="color-rarity"], [report="color-type"], [report="mana-curve"]'
        );
        for (const chart of charts)
            expect(chart.data.cardCount).toBe(5);
        expect(stats.querySelector('.stats-scope').textContent).toBe('');
        expect(curve.querySelector('.stats-description').textContent).toBe('');
        const registry = activeGame.statistics;
        expect(registry.include(registry.prepare(
            makeCard('W', 'Token Creature', 'common')
        ))).toBeTrue();
        expect(registry.include(registry.prepare(
            makeCard('', 'Emblem', 'special')
        ))).toBeTrue();
        const data = queryStatistics([
            registry.prepare(makeCard('8R', 'Creature')),
            registry.prepare(makeCard('7R', 'Creature')),
            registry.prepare(makeCard('6R', 'Creature'))
        ], registry, registry.reports.get('mana-curve'));
        expect(data.columns.at(-1).label).toBe('8+');
        expect(data.cells[3].at(-1)).toBe(2);
    });

    it(
        'supports declarative non-Magic charts and visible configuration errors',
        async () => {
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

    it(
        'analyzes creature support, text distributions, medians and wordiest cards',
        async () => {
            const words = count => Array(count).fill('word').join(' ');
            activeProject.cards = [
                makeCard('1G', 'Creature', 'common', {
                    name: 'Twin', subType: 'Elf Scout', rulesText: words(3)
                }),
                makeCard('2G', 'Creature', 'common', {
                    name: 'Elder', subType: 'Elf Shaman', rulesText: words(3)
                }),
                makeCard('3G', 'Creature', 'common', {
                    name: 'Twin', subType: 'Elf Warrior', rulesText: words(30)
                }),
                makeCard('R', 'Instant', 'rare', {
                    name: 'Long spell', rulesText: words(40)
                }),
                makeCard('', 'Token Creature', 'token', {
                    name: 'Excluded', subType: 'Dragon', rulesText: words(500)
                })
            ];
            changed(activeProject, 'cards');
            const wordiest = stats.querySelector('[report="wordiest-cards"]');
            await eventually(() => wordiest.data?.cells[0]?.[0] === 40);
            expect(wordiest.data.rows.length).toBe(4);
            expect(new Set(wordiest.data.rows.map(row => row.id)).size).toBe(4);
            expect(wordiest.data.rows[0].label).toBe('Long spell');
            expect(wordiest.data.cells.map(row => row[0])).toEqual([40, 30, 3, 3]);
            const creatures = stats.querySelector('[report="creature-types"]');
            expect(creatures.data.rows[0].label).toBe('Elf');
            expect(creatures.data.rowTotals[0]).toBe(3);
            expect(creatures.querySelectorAll('.stats-ranking-row').length).toBe(4);
            creatures.querySelector('[data-chart-type="matrix"]').click();
            await eventually(() => creatures.querySelector('tbody tr'));
            expect(creatures.data.total).toBe(3);
            const commons = stats.querySelector('[report="common-creature-curve"]');
            expect(commons.data.cardCount).toBe(3);
            const histogram = stats.querySelector('[report="rules-text-length"]');
            expect(histogram.data.columns.map(column => column.label))
                .toEqual(['0', '1–19', '20–39', '40–59']);
            expect(histogram.data.cells[0]).toEqual([0, 2, 1, 0]);
            const summary = stats.querySelector('[report="rules-text-by-color"]');
            expect(summary.data.cells[4][0]).toBe(12);
            const select = summary.querySelector('[data-measure]');
            select.value = 'median-words';
            select.dispatchEvent(new Event('change', { bubbles: true }));
            await eventually(() => summary.data.measureLabel === 'Median words');
            expect(summary.data.cells[4][0]).toBe(3);
            expect(stats.querySelectorAll('.stats-chart-error:not([hidden])').length)
                .toBe(0);
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
            chart.context.records.push({ group: 'A' });
            chart.resizePending = true;
            chart.requestUpdate();
            await eventually(() => chart.viewport.textContent === 'Count: 2');
            expect(calls.at(-1)).toBe('render');
            expect(new StatisticsRegistry().getChartType('test:summary')).toBeUndefined();
        } finally { chart.remove(); }
        expect(dispose).toHaveBeenCalledTimes(1);
    });

    it(
        'localizes JSON reports, category labels, controls and shared tooltips',
        async () => {
            const translations = {
                statistics: {
                    Measure: 'Mesure', 'View chart data': 'Voir les données',
                    Lines: 'Lignes', Bars: 'Barres', Cards: 'Cartes',
                    '%{0} card': '%{0} carte', '%{0} cards': '%{0} cartes'
                },
                'game-magic-statistics': {
                    'Color × rarity': 'Couleur × rareté', White: 'Blanc', Blue: 'Bleu',
                    Common: 'Commune', Color: 'Couleur', 'Mana value': 'Valeur de mana',
                    'Mana curve by color': 'Courbe de mana',
                    'Average words': 'Moyenne', 'Median words': 'Médiane'
                }
            };
            const locale = new Localization(
                'statistics-test', JSON.stringify(translations)
            );
            const load = spyOn(Localization, 'load')
                .and.returnValue(Promise.resolve(locale));
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'position:fixed;left:-10000px;width:800px';
            try {
                expect(await setLocalization('statistics-test')).toBeTrue();
                const game = new activeGame.constructor({
                    path: activeGame.gamePath, id: activeGame.id,
                    version: activeGame.version
                });
                const context = {
                    registry: game.statistics,
                    records: activeProject.cards.map(card => (
                        game.statistics.prepare(card)
                    ))
                };
                const matrix = document.createElement('cm-chart');
                matrix.setAttribute('report', 'color-rarity');
                matrix.context = context;
                const mana = document.createElement('cm-chart');
                mana.setAttribute('report', 'mana-curve');
                mana.context = context;
                wrapper.append(matrix, mana);
                document.body.appendChild(wrapper);
                await eventually(() => mana.querySelector('.stats-hit-region'));
                expect(matrix.controls.title.textContent).toBe('Couleur × rareté');
                expect(matrix.data.rows[0].id).toBe('w');
                expect(matrix.data.rows[0].label).toBe('Blanc');
                expect(matrix.data.columns[0].id).toBe('common');
                expect(matrix.data.columns[0].label).toBe('Commune');
                expect(mana.controls.filterControl.hidden).toBeTrue();
                expect(mana.controls.typeButtons[0].textContent).toBe('Lignes');
                expect(mana.dataDetails.textContent).toContain('Voir les données');
                mana.querySelectorAll('.stats-hit-region')[2]
                    .dispatchEvent(new PointerEvent('pointerenter'));
                const tooltip = mana.querySelector('.stats-chart-tooltip');
                expect(tooltip.textContent).toContain('Valeur de mana 2');
                expect(tooltip.textContent).toContain('Blanc1 carte');
                expect(tooltip.textContent).toContain('Bleu1 carte');
                matrix.setAttribute('report', 'rules-text-by-color');
                await eventually(
                    () => matrix.controls.measureSelect.value === 'average-words'
                );
                expect(matrix.controls.measureControl.textContent).toContain('Mesure');
                expect(matrix.controls.measureSelect.options[0].textContent)
                    .toBe('Moyenne');
                expect(game.statistics.reports.get('mana-curve').filters)
                    .toEqual(['nonland']);
            } finally {
                wrapper.remove();
                load.and.returnValue(Promise.resolve({ resolve: () => null }));
                await setLocalization('default-test-locale');
            }
        });

    it('uses rarity gradients and shared tooltips on stacked color bars', async () => {
        activeProject.cards = [
            makeCard('1G', 'Creature', 'common', { subType: 'Elf' }),
            makeCard('W', 'Creature', 'uncommon', { subType: 'Elf' }),
            makeCard('G', 'Creature', 'common', { subType: 'Elf' }),
            makeCard('R', 'Instant', 'rare')
        ];
        changed(activeProject, 'cards');
        const creatures = stats.querySelector('[report="creature-types"]');
        const histogram = stats.querySelector('[report="rules-text-length"]');
        await eventually(() => creatures.data?.rowTotals[0] === 3
            && histogram.data?.cardCount === 4);
        const segments = creatures.querySelectorAll('.stats-ranking-segment');
        expect(segments.length).toBe(2);
        expect(parseFloat(segments[0].style.width)).toBeCloseTo(100 / 3);
        expect(parseFloat(segments[1].style.width)).toBeCloseTo(200 / 3);
        const row = creatures.querySelector('.stats-ranking-row');
        row.dispatchEvent(new PointerEvent('pointerenter', {
            clientX: window.innerWidth - 1, clientY: 200
        }));
        const tooltip = creatures.querySelector('.stats-chart-tooltip');
        expect(tooltip.hidden).toBeFalse();
        expect(tooltip.textContent).toContain('Elf — 3 cards');
        expect(tooltip.textContent).toContain('White1 card');
        expect(tooltip.textContent).toContain('Green2 cards');
        expect(tooltip.querySelectorAll('.stats-tooltip-row').length).toBe(7);
        expect(tooltip.getBoundingClientRect().right).toBeLessThanOrEqual(
            window.innerWidth - 7
        );
        row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(tooltip.hidden).toBeTrue();
        row.focus({ preventScroll: true });
        expect(document.activeElement).withContext('ranking row focus').toBe(row);
        expect(tooltip.hidden).toBeFalse();
        creatures.querySelector('.stats-ranking').dispatchEvent(new Event('scroll'));
        expect(tooltip.hidden).toBeTrue();
        expect(histogram.querySelectorAll('linearGradient').length).toBe(5);
        const gradients = histogram.querySelectorAll('linearGradient');
        histogram.data.rows.forEach((rarity, i) => {
            const stops = [...gradients[i].querySelectorAll('stop')];
            expect(stops.map(stop => stop.getAttribute('stop-color')))
                .toEqual(rarity.gradient.map(stop => stop.color));
            expect(stops.map(stop => stop.getAttribute('offset')))
                .toEqual(['0%', '45%', '55%', '100%']);
        });
        histogram.querySelector('.stats-hit-region')
            .dispatchEvent(new PointerEvent('pointerenter'));
        const swatches = histogram.querySelectorAll(
            '.stats-chart-tooltip .stats-category-swatch'
        );
        expect(swatches.length).toBe(5);
        expect(swatches[1].style.background).toContain('linear-gradient');
        expect(swatches[0].style.boxShadow).toContain('255, 255, 255');
    });

    it('emits card selections from marks and the filtered fallback table', async () => {
        curve.setAttribute('selectable', '');
        await eventually(() => curve.querySelector('circle[data-chart-selection]'));
        const selections = [];
        const listener = event => selections.push(event.detail);
        curve.addEventListener('chart-selection', listener);
        const mark = curve.querySelector('circle[data-category-index="2"]');
        mark.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(selections[0].selection).toEqual({ row: 'w', column: 2 });
        expect(selections[0].cards).toEqual([activeProject.cards[0]]);
        expect(selections[0].project).toBe(activeProject);
        curve.querySelector('[data-series="0"]').click();
        await eventually(() => curve.querySelectorAll('.stats-curve-table tbody tr')
            .length === 6);
        const cell = curve.querySelectorAll('.stats-curve-table tbody tr')[0]
            .querySelectorAll('button')[2];
        cell.click();
        expect(selections[1].selection).toEqual({ row: 'u', column: 2 });
        expect(selections[1].cards).toEqual([activeProject.cards[1]]);
        curve.removeEventListener('chart-selection', listener);
    });

    it('reuses queries when resizing, hiding series and changing shape', async () => {
        const original = curve.data;
        const dimension = activeGame.statistics.dimensions.get('mana-value');
        const accessor = spyOn(dimension, 'values')
            .and.callThrough();
        curve.onResize({ contentRect: { width: curve.renderWidth + 1 } });
        curve.onOptionChanged({ option: 'series', value: 'w' });
        curve.onOptionChanged({ option: 'type', value: 'matrix' });
        await eventually(() => curve.viewport.querySelector('table'));
        expect(curve.data).toBe(original);
        expect(accessor).not.toHaveBeenCalled();
        curve.onOptionChanged({ option: 'measure', value: 'average-words' });
        await eventually(() => curve.data !== original);
        expect(accessor).toHaveBeenCalled();
    });

    it('selects matrix totals, stacked segments and proportion groups', async () => {
        const selections = [];
        const listener = event => selections.push(event.detail);
        stats.addEventListener('chart-selection', listener);
        const matrix = stats.querySelector('[report="color-rarity"]');
        matrix.setAttribute('selectable', '');
        await eventually(() => matrix.querySelector('tfoot td:last-child button'));
        matrix.querySelector('tfoot td:last-child button').click();
        expect(selections[0].cards.length).toBe(4);
        expect(selections[0].selection).toEqual({});
        const creatures = stats.querySelector('[report="creature-types"]');
        creatures.setAttribute('selectable', '');
        activeProject.cards[0].front.subType = 'Elf';
        changed(activeProject, 'cards');
        await eventually(() => creatures.data.rows[0]?.id === 'Elf');
        creatures.querySelector('.stats-ranking-segment').dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        );
        expect(selections[1].selection).toEqual({ row: 'Elf', column: 'w' });
        expect(selections[1].cards).toEqual([activeProject.cards[0]]);
        const proportion = stats.querySelector('[report="legendary-permanents"]');
        proportion.setAttribute('selectable', '');
        await eventually(() => proportion.querySelector('[data-chart-selection]'));
        proportion.querySelector('[data-proportion-percentage]').dispatchEvent(
            new KeyboardEvent('keydown', { key: ' ', bubbles: true })
        );
        expect(selections[2].selection).toEqual({ column: 'legendary' });
        expect(selections[2].cards).toEqual([]);
        stats.removeEventListener('chart-selection', listener);
    });

});
