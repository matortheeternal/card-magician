import StatisticsRegistry from './StatisticsRegistry.js';
import { resolveChartDefinition } from './chartDefinition.js';
import { queryStatistics } from './queryStatistics.js';

describe('Chart definition resolution', () => {
    let registry;
    const create = () => ({ render() {} });

    beforeEach(() => {
        registry = new StatisticsRegistry();
        registry.registerDimension('group', {
            label: 'Group', values: record => [record.group]
        });
        registry.registerChartType('test:matrix', { shape: 'matrix', create });
        registry.registerChartType('test:series', { shape: 'series', create });
    });

    it('shares a canonical query across renderer shapes', () => {
        const definition = {
            type: 'test:series', series: 'group', x: 'group',
            types: ['test:series', 'test:matrix']
        };
        const resolved = resolveChartDefinition(registry, definition);
        const matrix = resolveChartDefinition(registry, {
            ...resolved.definition, type: 'test:matrix'
        });
        expect(matrix.query).toEqual(resolved.query);
        expect(resolved.definition.series).toBeUndefined();
        expect(definition.series).toBe('group');
        const result = queryStatistics([{ group: 'A' }], registry, resolved.query);
        expect(result.cells).toEqual([[1]]);
        expect(result.series).toBeUndefined();
        expect(result.labels).toBeUndefined();
    });

    it('validates query references, controls and renderer-specific configuration', () => {
        const definition = {
            type: 'test:matrix', rows: 'group', columns: 'group'
        };
        expect(() => resolveChartDefinition(registry, {
            ...definition, measures: ['missing']
        })).toThrowError(/measure/);
        expect(() => resolveChartDefinition(registry, {
            ...definition, filterToggle: { filter: 'missing' }
        })).toThrowError(/filter/);
        expect(() => resolveChartDefinition(registry, {
            ...definition, types: ['missing']
        })).toThrowError(/chart type/);
        registry.registerChartType('test:restricted', {
            shape: 'matrix', create,
            validateDefinition: config => {
                if (config.measure === 'card-count')
                    throw new Error('Unsupported measure');
            }
        });
        expect(() => resolveChartDefinition(registry, {
            ...definition, type: 'test:restricted'
        })).toThrowError('Unsupported measure');
    });

    it('resolves view and attribute aliases before query validation', () => {
        registry.registerDimension('other', {
            label: 'Other', values: record => [record.other]
        });
        const authored = {
            type: 'test:series', rows: 'group', columns: 'group',
            views: [
                { id: 'default', label: 'Default', definition: {} },
                { id: 'other', label: 'Other', definition: { x: 'other' } }
            ]
        };
        const alternate = resolveChartDefinition(registry, authored, { view: 'other' });
        expect(alternate.query.columns).toBe('other');
        const explicit = resolveChartDefinition(registry, authored, {
            view: 'other', attributes: { x: 'group' }
        });
        expect(explicit.query.columns).toBe('group');
        expect(explicit.viewId).toBe('other');
        expect(authored.columns).toBe('group');
        expect(() => resolveChartDefinition(registry, authored, { view: 'missing' }))
            .toThrowError(/view/);
    });

    it('rejects malformed saved identifier lists', () => {
        expect(() => resolveChartDefinition(registry, {
            type: 'test:matrix', rows: 'group', columns: 'group', filters: 'group'
        })).toThrowError(/array/);
    });

});
