import StatisticsRegistry from './StatisticsRegistry.js';
import { queryStatistics } from './queryStatistics.js';

describe('Statistics queries', () => {
    let registry;
    let records;
    const definition = { rows: 'faction', columns: 'type', measure: 'card-count' };

    beforeEach(() => {
        registry = new StatisticsRegistry();
        registry.registerDimension('faction', {
            label: 'Faction', categories: ['a', 'b'], values: record => record.factions
        });
        registry.registerDimension('type', {
            label: 'Type', categories: ['unit', 'artifact'], values: record => record.types
        });
        records = [
            { factions: ['a', 'a', 'b'], types: ['unit', 'artifact'], power: 2 },
            { factions: ['a'], types: ['unit'], power: 6 },
            { factions: ['b'], types: ['artifact'], power: null }
        ];
    });

    it('deduplicates memberships and computes distinct totals across overlaps', () => {
        const result = queryStatistics(records, registry, definition, 'matrix');
        expect(result.cells).toEqual([[2, 1], [1, 2]]);
        expect(result.rowTotals).toEqual([2, 2]);
        expect(result.columnTotals).toEqual([2, 2]);
        expect(result.total).toBe(3);
    });

    it('reduces numeric fields from original records rather than cell aggregates', () => {
        registry.registerField('power', { label: 'Power', value: record => record.power });
        registry.registerMeasure('average-power', {
            label: 'Average power', field: 'power',
            reduce: values => values.length
                ? values.reduce((sum, value) => sum + value, 0) / values.length : null
        });
        const result = queryStatistics(records, registry, {
            ...definition, measure: 'average-power'
        }, 'matrix');
        expect(result.cells).toEqual([[4, 2], [2, 2]]);
        expect(result.total).toBe(4);
        expect(result.rowTotals).toEqual([4, 2]);
        expect(queryStatistics([], registry, {
            ...definition, measure: 'average-power'
        }, 'matrix').total).toBeNull();
    });

    it('applies filters and reports records without valid category memberships', () => {
        registry.registerFilter('strong', {
            test: record => record.power >= 4
        });
        const filtered = queryStatistics(records, registry, {
            ...definition, filters: ['strong']
        }, 'matrix');
        expect(filtered.total).toBe(1);
        const result = queryStatistics([
            ...records, { factions: [], types: ['unit'] }
        ], registry, definition, 'matrix');
        expect(result.excludedCount).toBe(1);
        expect(result.total).toBe(3);
    });

    it('applies game eligibility to every query before report filters', () => {
        registry.include = record => record.power !== null;
        const result = queryStatistics(records, registry, definition, 'matrix');
        expect(result.total).toBe(2);
        expect(result.scopeCount).toBe(2);
        expect(result.cells).toEqual([[2, 1], [1, 1]]);
    });

    it('supports discovered categories, explicit missing categories and series shapes', () => {
        registry.registerDimension('cost', {
            label: 'Cost', values: record => [record.power], compare: (a, b) => a - b
        });
        const result = queryStatistics(records, registry, {
            series: 'faction', x: 'cost', measure: 'card-count'
        }, 'series');
        expect(result.columns.map(category => category.id)).toEqual([2, 6]);
        expect(result.series[0].values).toEqual([1, 1]);
        registry.registerDimension('missing', {
            label: 'Missing', values: () => [], categories: ['unknown'], missing: 'unknown'
        });
        expect(queryStatistics(records, registry, {
            ...definition, rows: 'missing'
        }, 'matrix').total).toBe(3);
    });

    it('rejects invalid definitions and keeps game registries isolated', () => {
        expect(() => queryStatistics(records, registry, {
            ...definition, columns: 'unknown'
        }, 'matrix')).toThrowError(/Unknown statistics dimension/);
        expect(() => registry.registerDimension('faction', {
            label: 'Duplicate', values: () => []
        })).toThrowError(/Duplicate/);
        expect(new StatisticsRegistry().dimensions.has('faction')).toBeFalse();
        registry.registerMeasure('invalid', { label: 'Invalid', reduce: () => NaN });
        expect(() => queryStatistics(records, registry, {
            ...definition, measure: 'invalid'
        }, 'matrix')).toThrowError(/non-finite/);
    });

    it('sorts and limits rows without changing distinct totals', () => {
        const result = queryStatistics(records, registry, {
            ...definition, sortRows: 'descending', limitRows: 1
        }, 'matrix');
        expect(result.rows.map(row => row.id)).toEqual(['a']);
        expect(result.rowTotals).toEqual([2]);
        expect(result.cells).toEqual([[2, 1]]);
        expect(result.series[0].values).toEqual([2, 1]);
        expect(result.total).toBe(3);
        expect(result.cardCount).toBe(3);
        expect(() => queryStatistics(records, registry, {
            ...definition, limitRows: 0
        }, 'matrix')).toThrowError(/positive integer/);
    });
});
