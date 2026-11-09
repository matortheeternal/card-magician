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
        for (const chart of stats.querySelectorAll('cm-chart')) {
            chart.definition = undefined;
            chart.removeAttribute('selectable');
        }
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
        expect(stats.querySelector('[data-chart-selection]')).not.toBeNull();
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

    it('switches rules text length between bars and a matrix', async () => {
        const chart = stats.querySelector('[report="rules-text-length"]');
        await eventually(() => chart.viewport.querySelector('svg'));
        expect(chart.dataDetails.hidden).toBeTrue();
        chart.querySelector('[data-chart-type="matrix"]').click();
        await eventually(() => chart.viewport.querySelector('table'));
        expect(chart.dataDetails.hidden).toBeTrue();
        chart.querySelector('[data-chart-type="bar"]').click();
        await eventually(() => chart.viewport.querySelector('svg'));
        expect(chart.dataDetails.hidden).toBeTrue();
    });

    it('switches D3 between lines and grouped bars and hides colors', async () => {
        curve.querySelector('[data-series="1"]').click();
        await eventually(() => curve.querySelectorAll('.stats-chart path').length === 6);
        expect(curve.querySelector('[data-series="1"]').getAttribute('aria-pressed'))
            .toBe('false');
        stats.querySelector('[data-chart-type="bar"]').click();
        await eventually(() => curve.querySelectorAll('.stats-chart g rect').length > 0);
        expect(curve.querySelectorAll('.stats-chart path').length).toBe(0);
        expect(curve.dataDetails.hidden).toBeTrue();
        expect(curve.dataTable.children.length).toBe(0);
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

    it('keeps tooltips visible when movement bubbles from chart marks', async () => {
        for (const [type, tag] of [['bar', 'rect'], ['line', 'circle']]) {
            curve.querySelector(`[data-chart-type="${type}"]`).click();
            const selector = `g ${tag}[data-category-index="2"]`;
            await eventually(() => curve.viewport.querySelector(selector));
            const mark = curve.viewport.querySelector(selector);
            const tooltip = curve.viewport.querySelector('.stats-chart-tooltip');
            expect(mark.hasAttribute('data-chart-selection')).toBeTrue();
            mark.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
            expect(tooltip.hidden).withContext(type).toBeFalse();
            expect(tooltip.textContent).toContain('Mana value 2');
            mark.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
            expect(tooltip.hidden).withContext(`${type} repeated movement`).toBeFalse();
            const svg = curve.viewport.querySelector('svg');
            expect(svg.querySelector('title')).toBeNull();
            expect(svg.getAttribute('aria-label')).toBe('Mana curve by color');
            svg.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
            expect(tooltip.hidden).toBeTrue();
            mark.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
            expect(tooltip.hidden).withContext(`${type} re-entry`).toBeFalse();
            svg.dispatchEvent(new PointerEvent('pointerleave'));
            expect(tooltip.hidden).toBeTrue();
        }
    });

    it('keeps the line tooltip visible when crossing a plotted line', async () => {
        curve.scrollIntoView({ block: 'center' });
        await new Promise(resolve => { requestAnimationFrame(resolve); });
        const path = curve.viewport.querySelector('path');
        const point = path.getPointAtLength(path.getTotalLength() * 0.37)
            .matrixTransform(path.getScreenCTM());
        const tooltip = curve.viewport.querySelector('.stats-chart-tooltip');
        for (const offset of [-4, 0, 4]) {
            const target = document.elementFromPoint(point.x, point.y + offset);
            expect(curve.viewport.contains(target)).toBeTrue();
            target.dispatchEvent(new PointerEvent('pointermove', {
                bubbles: true, clientX: point.x, clientY: point.y + offset
            }));
            expect(tooltip.hidden).withContext(`vertical offset ${offset}`).toBeFalse();
        }
    });

    it('follows the cursor with bounded tooltips on bars and lines', async () => {
        for (const [type, tag] of [['bar', 'rect'], ['line', 'circle']]) {
            curve.querySelector(`[data-chart-type="${type}"]`).click();
            await eventually(() => curve.viewport.querySelector(`g ${tag}`));
            const region = curve.viewport.querySelectorAll('.stats-hit-region')[2];
            const tooltip = curve.viewport.querySelector('.stats-chart-tooltip');
            region.dispatchEvent(new PointerEvent('pointermove', {
                bubbles: true, clientX: 100, clientY: 100
            }));
            expect(getComputedStyle(tooltip).position).toBe('fixed');
            expect(parseFloat(tooltip.style.left)).toBeCloseTo(112);
            expect(parseFloat(tooltip.style.top)).toBeCloseTo(112);
            region.dispatchEvent(new PointerEvent('pointermove', {
                bubbles: true, clientX: 140, clientY: 150
            }));
            expect(tooltip.hidden).toBeFalse();
            expect(parseFloat(tooltip.style.left)).toBeCloseTo(152);
            expect(parseFloat(tooltip.style.top)).toBeCloseTo(162);
            region.dispatchEvent(new PointerEvent('pointermove', {
                bubbles: true, clientX: window.innerWidth - 1,
                clientY: window.innerHeight - 1
            }));
            expect(tooltip.getBoundingClientRect().right)
                .toBeLessThanOrEqual(window.innerWidth - 7);
            expect(tooltip.getBoundingClientRect().bottom)
                .toBeLessThanOrEqual(window.innerHeight - 7);
            region.focus({ preventScroll: true });
            expect(tooltip.hidden).withContext('keyboard focus').toBeFalse();
            expect(tooltip.textContent).toContain('Mana value 2');
            curve.viewport.dispatchEvent(new Event('scroll'));
            expect(tooltip.hidden).toBeTrue();
        }
    });

    it('groups minor card types, omits lands and offers exact colors', async () => {
        activeProject.cards = [
            makeCard('U', 'Instant'),
            makeCard('RW', 'Battle'),
            makeCard('G', 'Kindred Sorcery'),
            makeCard('', 'Conspiracy'),
            makeCard('', 'Land')
        ];
        changed(activeProject, 'cards');
        const chart = stats.querySelector('[report="color-type"]');
        const battle = activeProject.cards[1];
        await eventually(() => chart.data?.getRecords()
            .some(record => record.card === battle));
        expect(chart.data.total).toBe(4);
        expect(chart.data.columns.map(column => column.id)).toEqual([
            'Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Other'
        ]);
        expect(chart.data.getRecords({ column: 'Other' }).length).toBe(3);
        expect(chart.data.getRecords().some(record => record.isLand)).toBeFalse();
        chart.querySelector('[data-chart-view="exact"]').click();
        await eventually(() => chart.data.rows.some(row => row.id === 'wr'));
        expect(chart.data.rows.find(row => row.id === 'wr').label).toBe('Boros (RW)');
        expect(chart.data.getRecords({ row: 'wr', column: 'Other' })[0].card)
            .toBe(activeProject.cards[1]);
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
                    Lines: 'Lignes', Bars: 'Barres', Matrix: 'Matrice', Cards: 'Cartes',
                    Percentage: 'Pourcentage',
                    '%{0} card': '%{0} carte', '%{0} cards': '%{0} cartes'
                },
                'game-magic-statistics': {
                    'Color × rarity': 'Couleur × rareté', White: 'Blanc', Blue: 'Bleu',
                    Common: 'Commune', Color: 'Couleur', 'Mana value': 'Valeur de mana',
                    'Mana curve by color': 'Courbe de mana',
                    'Average words': 'Moyenne', 'Median words': 'Médiane',
                    'Color count': 'Nombre de couleurs', 'Two-color': 'Bicolore'
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
                const colors = document.createElement('cm-chart');
                colors.setAttribute('report', 'color-count');
                colors.context = context;
                wrapper.append(matrix, mana, colors);
                document.body.appendChild(wrapper);
                await eventually(() => mana.querySelector('.stats-hit-region'));
                await eventually(() => colors.viewport.querySelector('table'));
                expect(colors.controls.title.textContent).toBe('Nombre de couleurs');
                expect(colors.data.rows[2].label).toBe('Bicolore');
                expect(colors.viewport.querySelector('thead').textContent)
                    .toContain('Pourcentage');
                expect(matrix.controls.title.textContent).toBe('Couleur × rareté');
                expect(matrix.data.rows[0].id).toBe('w');
                expect(matrix.data.rows[0].label).toBe('Blanc');
                expect(matrix.data.columns[0].id).toBe('common');
                expect(matrix.data.columns[0].label).toBe('Commune');
                expect(mana.controls.filterControl.hidden).toBeTrue();
                expect(mana.controls.typeButtons[0].textContent).toBe('Lignes');
                expect(mana.dataDetails.hidden).toBeTrue();
                expect(mana.querySelector('[data-chart-type="matrix"]').textContent)
                    .toBe('Matrice');
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

    it('scrolls charts and selected cards in separate full-height panes', async () => {
        activeProject.cards = Array.from({ length: 80 }, (_, index) => (
            makeCard('W', 'Creature', 'common', { name: `Card ${index}` })
        ));
        changed(activeProject, 'cards');
        const chart = stats.querySelector('[report="color-rarity"]');
        await eventually(() => chart.data.cardCount === 80);
        chart.viewport.querySelector('tfoot td:last-child').click();
        const panel = stats.cardsPanel;
        const main = stats.scrollRegion;
        const panelTop = panel.getBoundingClientRect().top;
        try {
            expect(main.scrollHeight).toBeGreaterThan(main.clientHeight);
            expect(panel.list.scrollHeight).toBeGreaterThan(panel.list.clientHeight);
            expect(panel.clientHeight).toBe(main.clientHeight);
            expect(getComputedStyle(panel).position).toBe('static');
            main.scrollTop = 120;
            expect(main.scrollTop).toBe(120);
            expect(panel.scrollTop).toBe(0);
            expect(panel.getBoundingClientRect().top).toBe(panelTop);
            const headerTop = panel.header.getBoundingClientRect().top;
            panel.list.scrollTop = 80;
            expect(panel.list.scrollTop).toBe(80);
            expect(panel.scrollTop).toBe(0);
            expect(panel.header.getBoundingClientRect().top).toBe(headerTop);
            expect(getComputedStyle(panel.header).position).toBe('static');
            expect(getComputedStyle(panel.header).borderBottomWidth).toBe('1px');
            expect(panel.list.offsetWidth).toBe(panel.header.offsetWidth);
            expect(main.scrollTop).toBe(120);
            expect(stats.scrollHeight).toBe(stats.clientHeight);
        } finally {
            main.scrollTop = 0;
            panel.list.scrollTop = 0;
        }
    });

    it('centers the empty selection message and hides the selection header', () => {
        const panel = stats.cardsPanel;
        expect(panel.header.hidden).toBeTrue();
        expect(panel.emptyMessage.checkVisibility()).toBeTrue();
        expect(panel.emptyMessage.textContent).toBe(
            'Select a chart row, column, or cell to view its corresponding cards.'
        );
        const range = document.createRange();
        range.selectNodeContents(panel.emptyMessage);
        const text = range.getBoundingClientRect();
        const pane = panel.getBoundingClientRect();
        expect(Math.abs(text.top + text.height / 2 - pane.top - pane.height / 2))
            .toBeLessThan(2);
        expect(Math.abs(text.left + text.width / 2 - pane.left - pane.width / 2))
            .toBeLessThan(2);
    });

    it('shows selected names and totals safely in the side panel', async () => {
        const names = ['<b>Chosen card</b>', 'Twin', 'Twin', 'Land', 'Artifact'];
        activeProject.cards.forEach((card, i) => { card.front.name = names[i]; });
        changed(activeProject, 'cards');
        const panel = stats.cardsPanel;
        expect(panel.emptyMessage.textContent)
            .toContain('Select a chart row, column, or cell');
        const matrix = stats.querySelector('[report="color-rarity"]');
        await eventually(() => matrix.viewport.querySelector('tbody td'));
        matrix.viewport.querySelector('tbody td').click();
        expect(panel.source.textContent).toBe('Color × rarity');
        expect(getComputedStyle(panel.emptyMessage).display).toBe('none');
        expect(panel.group.textContent).toBe('Cell: White × Common');
        expect(panel.summary.textContent).toBe('1 card');
        expect(panel.list.textContent).toBe('<b>Chosen card</b>');
        expect(panel.list.querySelector('b')).toBeNull();
        matrix.viewport.querySelector('tfoot td:last-child').click();
        expect(panel.group.textContent).toBe('All cards');
        expect(panel.summary.textContent).toBe('4 cards');
        expect([...panel.list.children].map(item => item.textContent))
            .toEqual(['<b>Chosen card</b>', 'Twin', 'Twin', 'Artifact']);
        expect(panel.clearButton.name).toBe('x-lg');
        expect(panel.clearButton.label).toBe('Clear Selection');
        expect(panel.clearButton.closest('sl-tooltip').content).toBe('Clear Selection');
        panel.clearButton.click();
        expect(panel.list.children.length).toBe(0);
        expect(panel.clearButton.hidden).toBeTrue();
        expect(panel.emptyMessage.textContent)
            .toContain('Select a chart row, column, or cell');
    });

    it('shows keyboard selections and clears stale project data', async () => {
        const panel = stats.cardsPanel;
        await eventually(() => curve.querySelector('circle[data-category-index="2"]'));
        curve.querySelector('circle[data-category-index="2"]').dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        );
        expect(panel.source.textContent).toBe('Mana curve by color');
        expect(panel.group.textContent).toBe('Cell: White × 2');
        expect(panel.list.children.length).toBe(1);
        const proportion = stats.querySelector('[report="legendary-permanents"]');
        proportion.querySelector('[data-proportion-percentage]').dispatchEvent(
            new KeyboardEvent('keydown', { key: ' ', bubbles: true })
        );
        expect(panel.summary.textContent).toBe('0 cards');
        expect(panel.list.children.length).toBe(0);
        expect(panel.clearButton.hidden).toBeFalse();
        activeProject.cards = [];
        changed(activeProject, 'cards');
        expect(panel.emptyMessage.textContent)
            .toContain('Select a chart row, column, or cell');
        expect(panel.source.textContent).toBe('');
        expect(panel.clearButton.hidden).toBeTrue();
    });

    it('selects entire matrix cells and row and column labels without buttons', () => {
        const chart = stats.querySelector('[report="color-rarity"]');
        const activate = spyOn(chart, 'activateSelection').and.callThrough();
        const row = chart.viewport.querySelector('tbody tr');
        const cell = row.querySelector('td');
        expect(chart.viewport.querySelector('button')).toBeNull();
        expect(cell.getAttribute('tabindex')).toBe('0');
        expect(cell.getAttribute('role')).toBeNull();
        cell.click();
        expect(activate.calls.mostRecent().args[0])
            .toEqual({ row: 'w', column: 'common' });
        expect(stats.cardsPanel.summary.textContent).toBe('1 card');
        row.querySelector('th img').click();
        expect(activate.calls.mostRecent().args[0]).toEqual({ row: 'w' });
        expect(stats.cardsPanel.group.textContent).toBe('Row: White');
        const column = chart.viewport.querySelectorAll('thead th')[1];
        column.dispatchEvent(new KeyboardEvent('keydown', {
            key: ' ', bubbles: true
        }));
        expect(activate.calls.mostRecent().args[0]).toEqual({ column: 'common' });
        expect(stats.cardsPanel.group.textContent).toBe('Column: Common');
        expect(stats.cardsPanel.summary.textContent).toBe('2 cards');
        chart.viewport.querySelector('thead th').click();
        expect(activate.calls.mostRecent().args[0]).toEqual({});
        expect(stats.cardsPanel.summary.textContent).toBe('4 cards');
        expect(activate.calls.count()).toBe(4);
    });

    it('selects a distribution row from its label, percentage or keyboard', () => {
        const chart = stats.querySelector('[report="color-count"]');
        const activate = spyOn(chart, 'activateSelection').and.callThrough();
        const row = chart.viewport.querySelectorAll('tbody tr')[1];
        expect(chart.viewport.querySelector('button')).toBeNull();
        row.querySelector('th').click();
        row.querySelector('td:last-child').click();
        row.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter', bubbles: true
        }));
        expect(activate.calls.count()).toBe(3);
        expect(activate.calls.allArgs().map(args => args[0]))
            .toEqual([{ row: 1 }, { row: 1 }, { row: 1 }]);
        expect(stats.cardsPanel.summary.textContent).toBe('2 cards');
    });

    it('selects whole line and bar segments while retaining specific marks', async () => {
        const activate = spyOn(curve, 'activateSelection').and.callThrough();
        for (const [type, tag] of [['line', 'circle'], ['bar', 'rect']]) {
            curve.querySelector(`[data-chart-type="${type}"]`).click();
            await eventually(() => curve.viewport.querySelector(`g ${tag}`));
            const region = curve.viewport.querySelectorAll('.stats-hit-region')[2];
            region.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(activate.calls.mostRecent().args[0]).toEqual({ column: 2 });
            expect(stats.cardsPanel.summary.textContent).toBe('2 cards');
            region.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', bubbles: true
            }));
            expect(activate.calls.mostRecent().args[0]).toEqual({ column: 2 });
            const selector = `g ${tag}[data-category-index="2"]`;
            const mark = curve.viewport.querySelector(selector);
            mark.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(activate.calls.mostRecent().args[0]).toEqual({ row: 'w', column: 2 });
            expect(stats.cardsPanel.summary.textContent).toBe('1 card');
        }
        expect(activate.calls.count()).toBe(6);
    });

    it('selects horizontal rows and individual color segments separately', async () => {
        activeProject.cards[0].front.subType = 'Elf';
        activeProject.cards[2].front.subType = 'Elf';
        changed(activeProject, 'cards');
        const chart = stats.querySelector('[report="creature-types"]');
        await eventually(() => chart.data.rows[0]?.id === 'Elf');
        const activate = spyOn(chart, 'activateSelection').and.callThrough();
        const row = chart.viewport.querySelector('.stats-ranking-row');
        row.querySelector('span').click();
        row.querySelector('strong').click();
        row.querySelector('.stats-ranking-track').click();
        row.dispatchEvent(new KeyboardEvent('keydown', {
            key: ' ', bubbles: true
        }));
        expect(activate.calls.count()).toBe(4);
        expect(activate.calls.allArgs().map(args => args[0]))
            .toEqual(Array(4).fill({ row: 'Elf' }));
        expect(stats.cardsPanel.summary.textContent).toBe('2 cards');
        const segment = row.querySelector('.stats-ranking-segment');
        segment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(activate.calls.count()).toBe(5);
        expect(activate.calls.mostRecent().args[0])
            .toEqual({ row: 'Elf', column: 'w' });
        expect(stats.cardsPanel.summary.textContent).toBe('1 card');
        segment.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter', bubbles: true
        }));
        expect(activate.calls.count()).toBe(6);
        expect(activate.calls.mostRecent().args[0])
            .toEqual({ row: 'Elf', column: 'w' });
    });

    it('emits card selections from marks and the filtered matrix mode', async () => {
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
        curve.querySelector('[data-chart-type="matrix"]').click();
        await eventually(() => curve.viewport.querySelectorAll('tbody tr').length === 6);
        const cell = curve.viewport.querySelectorAll('tbody tr')[0]
            .querySelectorAll('td')[2];
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
        await eventually(() => matrix.querySelector('tfoot td:last-child'));
        matrix.querySelector('tfoot td:last-child').click();
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
        proportion.querySelector('[data-chart-view="color"]').click();
        await eventually(() => proportion.viewport.querySelector('tbody tr'));
        const breakdownRow = proportion.viewport.querySelector('tbody tr');
        expect(breakdownRow.querySelector('button')).toBeNull();
        breakdownRow.querySelector('td').click();
        expect(selections[3].selection).toEqual({ row: 'w' });
        expect(selections[3].cards).toEqual([activeProject.cards[0]]);
        stats.removeEventListener('chart-selection', listener);
    });


    it('shows shape and color-count percentages with unclassified rows', async () => {
        activeProject.cards = [
            makeCard('W', 'Creature', 'common', { power: '2', toughness: '2' }),
            makeCard('U', 'Creature', 'common', { power: '3', toughness: '1' }),
            makeCard('G', 'Creature', 'common', { power: '1', toughness: '4' }),
            makeCard('R', 'Creature', 'common', { power: '*', toughness: '2' }),
            makeCard('WU', 'Instant')
        ];
        changed(activeProject, 'cards');
        const shapes = stats.querySelector('[report="creature-shape"]');
        const colors = stats.querySelector('[report="color-count"]');
        await eventually(() => shapes.data?.cardCount === 4
            && colors.data?.cardCount === 5);
        expect(shapes.data.rowTotals).toEqual([1, 1, 1, 1]);
        expect(shapes.viewport.querySelector('caption')).toBeNull();
        expect(shapes.viewport.querySelector('p')).toBeNull();
        expect(shapes.controls.description.textContent).toBe('');
        expect(colors.controls.description.textContent).toBe('');
        expect(shapes.viewport.querySelector('tbody tr td:last-child').textContent)
            .toContain('25');
        expect(colors.data.rowTotals).toEqual([4, 1]);
        expect(colors.data.rows.map(row => row.id)).toEqual([1, 2]);
        const monoRow = colors.viewport.querySelector('tbody tr');
        expect(monoRow.lastElementChild.textContent).toContain('80');
        shapes.querySelector('[data-chart-view="bodies"]').click();
        await eventually(() => shapes.data.rowLabel === 'Power');
        expect(shapes.data.columnLabel).toBe('Toughness');
        expect(shapes.data.getRecords({ row: 3, column: 1 })[0].card)
            .toBe(activeProject.cards[1]);
        const matrix = stats.querySelector('[report="color-rarity"]');
        matrix.querySelector('[data-chart-view="exact"]').click();
        await eventually(() => matrix.data.rows.some(row => row.id === 'wu'));
        expect(matrix.data.getRecords({ row: 'wu' })[0].card)
            .toBe(activeProject.cards[4]);
    });

    it('updates missing-credit counts when project defaults change', async () => {
        activeProject.illustrator = '';
        activeProject.cards = [
            makeCard('W', 'Creature', 'common', { illustrator: 'Front artist' }),
            makeCard('U', 'Instant'),
            makeCard('G', 'Creature', 'token')
        ];
        activeProject.cards[1].back = { illustrator: 'Back artist' };
        changed(activeProject, 'cards');
        const chart = stats.querySelector('[report="missing-art-credit"]');
        await eventually(() => chart.data?.cardCount === 2);
        expect(chart.data.getRecords({ column: 'missing' })[0].card)
            .toBe(activeProject.cards[1]);
        expect(chart.viewport.querySelector('[data-proportion-count]').textContent)
            .toBe('1 of 2');
        const registry = activeGame.statistics;
        const measure = () => queryStatistics(stats.context.records, registry, {
            rows: 'color', columns: 'rarity', measure: 'missing-art-credit'
        }).total;
        expect(measure()).toBe(1);
        activeProject.illustrator = 'Project artist';
        changed(activeProject, 'illustrator');
        await eventually(() => chart.viewport.querySelector('[data-proportion-count]')
            .textContent === '0 of 2');
        expect(measure()).toBe(0);
        activeProject.illustrator = '';
        changed(activeProject, 'illustrator');
        await eventually(() => chart.viewport.querySelector('[data-proportion-count]')
            .textContent === '1 of 2');
    });


    it('limits subtype charts and expands without internal scrolling', async () => {
        activeProject.cards = [];
        for (let index = 0; index < 20; index++) {
            activeProject.cards.push(
                makeCard('G', 'Creature', 'common', { subType: `Kind${index}` }),
                makeCard('U', 'Artifact', 'common', { subType: `Relic${index}` })
            );
        }
        changed(activeProject, 'cards');
        for (const report of ['creature-types', 'non-creature-subtypes']) {
            const chart = stats.querySelector(`[report="${report}"]`);
            await eventually(() => chart.viewport.querySelectorAll('.stats-ranking-row')
                .length === 15);
            expect(chart.controls.rowLimitButton.hidden).toBeFalse();
            expect(chart.controls.rowLimitButton.textContent).toContain('20');
            const ranking = chart.viewport.querySelector('.stats-ranking');
            expect(getComputedStyle(ranking).maxHeight).toBe('none');
            expect(getComputedStyle(ranking).overflowY).toBe('visible');
            chart.controls.rowLimitButton.click();
            await eventually(() => chart.viewport.querySelectorAll('.stats-ranking-row')
                .length === 20);
            chart.controls.rowLimitButton.click();
            await eventually(() => chart.viewport.querySelectorAll('.stats-ranking-row')
                .length === 15);
            chart.querySelector('[data-chart-type="matrix"]').click();
            await eventually(() => chart.viewport.querySelectorAll('tbody tr')
                .length === 15);
            chart.controls.rowLimitButton.click();
            await eventually(() => chart.viewport.querySelectorAll('tbody tr')
                .length === 20);
        }
    });

    it('filters horizontal bars with consistent totals and rankings', async () => {
        activeProject.cards = [
            ...Array.from({ length: 4 }, () => (
                makeCard('G', 'Creature', 'common', { subType: 'Elf' })
            )),
            ...Array.from({ length: 3 }, () => (
                makeCard('U', 'Creature', 'common', { subType: 'Wizard' })
            )),
            makeCard('G', 'Creature', 'common', { subType: 'Scout' })
        ];
        changed(activeProject, 'cards');
        const chart = stats.querySelector('[report="creature-types"]');
        await eventually(() => chart.data?.total === 8);
        chart.controls.seriesButtons[4].click();
        await eventually(() => chart.data.total === 3);
        expect(chart.viewport.querySelectorAll('.stats-ranking-row').length).toBe(1);
        expect(chart.viewport.querySelector('.stats-ranking-row').textContent)
            .toContain('Wizard');
        const selected = chart.data.getRecords({ row: 'Wizard' });
        expect(selected.every(record => record.color === 'u')).toBeTrue();
        expect(chart.controls.seriesButtons.length).toBe(7);
        expect(chart.controls.seriesButtons[4].getAttribute('aria-pressed'))
            .toBe('false');
        chart.querySelector('[data-chart-type="matrix"]').click();
        await eventually(() => chart.viewport.querySelector('tbody tr'));
        expect(chart.viewport.querySelectorAll('tbody tr').length).toBe(1);
        chart.controls.seriesButtons[4].click();
        await eventually(() => chart.data.total === 8);
        expect(chart.data.rows[0].id).toBe('Elf');
        for (const button of chart.controls.seriesButtons) button.click();
        await eventually(() => chart.viewport.querySelector('.stats-chart-empty'));
        expect(chart.viewport.textContent).toContain('Select a series');
        chart.controls.seriesButtons[1].click();
        await eventually(() => chart.data.total === 3);
        expect(chart.viewport.querySelector('tbody th').textContent).toBe('Wizard');
    });

    it('uses matrix buttons instead of disclosures on both mana curves', async () => {
        for (const report of ['common-creature-curve', 'mana-curve']) {
            const chart = stats.querySelector(`[report="${report}"]`);
            expect(chart.controls.typeButtons.map(button => button.dataset.chartType))
                .toContain('matrix');
            expect(chart.dataDetails.hidden).toBeTrue();
            expect(chart.dataTable.children.length).toBe(0);
            chart.controls.seriesButtons[0].click();
            chart.querySelector('[data-chart-type="matrix"]').click();
            await eventually(() => chart.viewport.querySelector('table'));
            expect(chart.viewport.querySelectorAll('tbody tr').length).toBe(6);
            expect(chart.controls.seriesButtons[0].getAttribute('aria-pressed'))
                .toBe('false');
            chart.querySelector('[data-chart-type="line"]').click();
            await eventually(() => chart.viewport.querySelector('svg'));
            expect(chart.dataDetails.hidden).toBeTrue();
            expect(chart.dataTable.children.length).toBe(0);
        }
    });

});
