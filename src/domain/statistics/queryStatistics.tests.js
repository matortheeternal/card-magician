import StatisticsRegistry from './StatisticsRegistry.js';
import { queryStatistics } from './queryStatistics.js';

const UNKNOWN_DIMENSION_PATTERN = /Unknown statistics dimension/;
const DUPLICATE_DEFINITION_PATTERN = /Duplicate/;
const NONFINITE_VALUE_PATTERN = /non-finite/;
const POSITIVE_INTEGER_PATTERN = /positive integer/;

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
            label: 'Type', categories: ['unit', 'artifact'],
            values: record => record.types
        });
        records = [
            { factions: ['a', 'a', 'b'], types: ['unit', 'artifact'], power: 2 },
            { factions: ['a'], types: ['unit'], power: 6 },
            { factions: ['b'], types: ['artifact'], power: null }
        ];
    });

    it('deduplicates memberships and computes distinct totals across overlaps', () => {
        const result = queryStatistics(records, registry, definition);
        expect(result.cells).toEqual([[2, 1], [1, 2]]);
        expect(result.rowTotals).toEqual([2, 2]);
        expect(result.columnTotals).toEqual([2, 2]);
        expect(result.total).toBe(3);
    });

    it('reduces numeric fields from original records rather than cell aggregates', () => {
        registry.registerField('power', {
            label: 'Power', value: record => record.power
        });
        registry.registerMeasure('average-power', {
            label: 'Average power', field: 'power',
            reduce: values => values.length
                ? values.reduce((sum, value) => sum + value, 0) / values.length : null
        });
        const result = queryStatistics(records, registry, {
            ...definition, measure: 'average-power'
        });
        expect(result.cells).toEqual([[4, 2], [2, 2]]);
        expect(result.total).toBe(4);
        expect(result.rowTotals).toEqual([4, 2]);
        expect(queryStatistics([], registry, {
            ...definition, measure: 'average-power'
        }).total).toBeNull();
    });

    it('applies filters and reports records without valid category memberships', () => {
        registry.registerFilter('strong', {
            test: record => record.power >= 4
        });
        const filtered = queryStatistics(records, registry, {
            ...definition, filters: ['strong']
        });
        expect(filtered.total).toBe(1);
        const result = queryStatistics([
            ...records, { factions: [], types: ['unit'] }
        ], registry, definition);
        expect(result.excludedCount).toBe(1);
        expect(result.total).toBe(3);
    });

    it('applies game eligibility to every query before report filters', () => {
        registry.include = record => record.power !== null;
        const result = queryStatistics(records, registry, definition);
        expect(result.total).toBe(2);
        expect(result.scopeCount).toBe(2);
        expect(result.cells).toEqual([[2, 1], [1, 1]]);
    });

    it(
        'supports discovered categories, explicit missing categories and series shapes',
        () => {
            registry.registerDimension('cost', {
                label: 'Cost', values: record => [record.power], compare: (a, b) => a - b
            });
            const result = queryStatistics(records, registry, {
                series: 'faction', x: 'cost', measure: 'card-count'
            });
            expect(result.columns.map(category => category.id)).toEqual([2, 6]);
            expect(result.cells[0]).toEqual([1, 1]);
            registry.registerDimension('missing', {
                label: 'Missing', values: () => [],
                categories: ['unknown'], missing: 'unknown'
            });
            expect(queryStatistics(records, registry, {
                ...definition, rows: 'missing'
            }).total).toBe(3);
        });

    it('rejects invalid definitions and keeps game registries isolated', () => {
        expect(() => queryStatistics(records, registry, {
            ...definition, columns: 'unknown'
        })).toThrowError(UNKNOWN_DIMENSION_PATTERN);
        expect(() => registry.registerDimension('faction', {
            label: 'Duplicate', values: () => []
        })).toThrowError(DUPLICATE_DEFINITION_PATTERN);
        expect(new StatisticsRegistry().dimensions.has('faction')).toBeFalse();
        registry.registerMeasure('invalid', { label: 'Invalid', reduce: () => NaN });
        expect(() => queryStatistics(records, registry, {
            ...definition, measure: 'invalid'
        })).toThrowError(NONFINITE_VALUE_PATTERN);
    });

    it('sorts and limits rows without changing distinct totals', () => {
        const result = queryStatistics(records, registry, {
            ...definition, sortRows: 'descending', limitRows: 1
        });
        expect(result.rows.map(row => row.id)).toEqual(['a']);
        expect(result.rowTotals).toEqual([2]);
        expect(result.cells).toEqual([[2, 1]]);
        expect(result.cells[0]).toEqual([2, 1]);
        expect(result.total).toBe(3);
        expect(result.cardCount).toBe(3);
        expect(() => queryStatistics(records, registry, {
            ...definition, limitRows: 0
        })).toThrowError(POSITIVE_INTEGER_PATTERN);
    });

    it('retains exact cell and total memberships after sorting and limiting', () => {
        const result = queryStatistics(records, registry, {
            ...definition, sortRows: 'descending', limitRows: 1
        });
        expect(result.getRecords({ row: 'a', column: 'artifact' })).toEqual([records[0]]);
        expect(result.getRecords({ row: 'a' })).toEqual(records.slice(0, 2));
        expect(result.getRecords({ column: 'artifact' }))
            .toEqual([records[0], records[2]]);
        expect(result.getRecords()).toEqual(records);
        result.getRecords().pop();
        expect(result.getRecords().length).toBe(3);
        expect(() => result.getRecords({ row: 'unknown' })).toThrowError(/category/);
    });

    it('keeps group membership when numeric inputs are missing', () => {
        registry.registerField('power', {
            label: 'Power', value: record => record.power
        });
        registry.registerMeasure('max-power', {
            label: 'Maximum', field: 'power',
            reduce: values => values.length ? Math.max(...values) : null
        });
        const result = queryStatistics(records, registry, {
            ...definition, measure: 'max-power'
        });
        expect(result.cells[1][1]).toBe(2);
        expect(result.getRecords({ row: 'b', column: 'artifact' }))
            .toEqual([records[0], records[2]]);
    });

    it('uses category IDs rather than labels and accepts numeric zero', () => {
        registry.registerDimension('numeric', {
            label: 'Numeric', values: record => [record.power],
            categories: [{ id: 0, label: 'Same' }, { id: 1, label: 'Same' }]
        });
        const input = [{ power: 0 }, { power: 1 }];
        const result = queryStatistics(input, registry, {
            rows: 'numeric', columns: 'numeric'
        });
        expect(result.getRecords({ row: 0, column: 0 })).toEqual([input[0]]);
        expect(result.getRecords({ row: 0, column: 1 })).toEqual([]);
    });

    it('excludes undeclared memberships and preserves missing categories', () => {
        registry.registerDimension('declared', {
            label: 'Declared', categories: ['kept'], missing: 'kept',
            values: record => record.categories
        });
        const input = [
            { categories: ['kept', 'kept', 'unlisted'] },
            { categories: ['unlisted'] },
            { categories: [] },
            { categories: [null, undefined] }
        ];
        const result = queryStatistics(input, registry, {
            rows: 'declared', columns: 'declared'
        });
        expect(result.cells).toEqual([[3]]);
        expect(result.scopeCount).toBe(4);
        expect(result.excludedCount).toBe(1);
        expect(result.getRecords({ row: 'kept', column: 'kept' }))
            .toEqual([input[0], input[2], input[3]]);
    });

    it('rejects malformed dimension values and duplicate declared categories', () => {
        const dimension = registry.dimensions.get('faction');
        dimension.values = () => 'a';
        expect(() => queryStatistics(records, registry, definition))
            .toThrowError(/must return an array/);
        dimension.values = record => record.factions;
        dimension.categories = ['a', 'a'];
        expect(() => queryStatistics(records, registry, definition))
            .toThrowError(/Duplicate category/);
    });

    it('reorders displayed aggregates while retaining all source memberships', () => {
        const extra = { factions: ['b'], types: ['unit'], power: 3 };
        const result = queryStatistics([...records, extra], registry, {
            ...definition, sortRows: 'descending', limitRows: 1
        });
        expect(result.rows.map(row => row.id)).toEqual(['b']);
        expect(result.cells).toEqual([[2, 2]]);
        expect(result.rowTotals).toEqual([3]);
        expect(result.columnTotals).toEqual([3, 2]);
        expect(result.total).toBe(4);
        expect(result.getRecords({ row: 'b', column: 'unit' }))
            .toEqual([records[0], extra]);
        expect(result.getRecords({ row: 'a' })).toEqual([records[0], records[1]]);
    });


    it('recomputes distinct totals and memberships when columns are excluded', () => {
        const result = queryStatistics(records, registry, {
            ...definition, excludedColumns: ['unit']
        });
        expect(result.columns.map(column => column.id)).toEqual(['artifact']);
        expect(result.cells).toEqual([[1], [2]]);
        expect(result.rowTotals).toEqual([1, 2]);
        expect(result.columnTotals).toEqual([2]);
        expect(result.total).toBe(2);
        expect(result.getRecords({ row: 'a' })).toEqual([records[0]]);
        expect(result.getRecords()).toEqual([records[0], records[2]]);
        const empty = queryStatistics(records, registry, {
            ...definition, excludedColumns: ['unit', 'artifact']
        });
        expect(empty.total).toBe(0);
        expect(empty.getRecords()).toEqual([]);
    });

    it('rejects duplicate category definitions even if excluded', () => {
        registry.dimensions.get('type').categories = ['unit', 'unit', 'artifact'];
        expect(() => queryStatistics(records, registry, {
            ...definition, excludedColumns: ['unit']
        })).toThrowError(/Duplicate category/);
    });

});
