import * as ManaScribe from 'mana-scribe';
import ColorIdentity from '../domain/ColorIdentity.js';
import Registry from '../../../../../src/domain/statistics/StatisticsRegistry.js';
import { queryStatistics } from '../../../../../src/domain/statistics/queryStatistics.js';
import { cardRecord } from './cardRecord.js';
import { registerCardDimensions } from './registerCardDimensions.js';

const game = { ManaScribe, ColorIdentity };

describe('Magic card dimensions', () => {
    let registry;
    let records;

    beforeEach(() => {
        registry = new Registry();
        registerCardDimensions(registry);
        const prepare = (manaCost, power, toughness, superType = 'Creature') => (
            cardRecord({ front: { manaCost, power, toughness, superType } }, game)
        );
        records = [
            prepare('W', '2', '2'), prepare('WU', '3', '1'),
            prepare('2', '1', '4'), prepare('G', '*', '2'),
            prepare('R', '2', '2', 'Instant')
        ];
    });

    it('includes unclassified creature shapes and preserves source membership', () => {
        const data = queryStatistics(records, registry, {
            rows: 'creature-shape', columns: 'art-credit'
        });
        expect(data.rows.map(row => row.id))
            .toEqual(['square', 'aggressive', 'defensive', 'unclassified']);
        expect(data.rowTotals).toEqual([1, 1, 1, 1]);
        expect(data.total).toBe(4);
        expect(data.excludedCount).toBe(1);
        expect(data.getRecords({ row: 'aggressive' })).toEqual([records[1]]);
        expect(data.getRecords()).not.toContain(records[4]);
    });

    it('keeps all six color-count categories and groups unclassified colors', () => {
        records.push(cardRecord({ front: { colorOverride: ['m'] } }, game));
        const data = queryStatistics(records, registry, {
            rows: 'color-count', columns: 'art-credit'
        });
        expect(data.rows.map(row => row.id)).toEqual([0, 1, 2, 3, 4, 5, 'unclassified']);
        expect(data.rowTotals).toEqual([1, 3, 1, 0, 0, 0, 1]);
        expect(data.total).toBe(6);
        expect(data.excludedCount).toBe(0);
        expect(data.getRecords({ row: 2 })).toEqual([records[1]]);
        const exact = queryStatistics(records, registry, {
            rows: 'exact-color', columns: 'art-credit'
        });
        expect(exact.rows.find(row => row.id === 'wu').label).toBe('Azorius (WU)');
        expect(exact.getRecords({ row: 'wu' })).toEqual([records[1]]);
        expect(exact.excludedCount).toBe(0);
    });

    it('retains numeric P/T coordinates and makes fields available to measures', () => {
        const data = queryStatistics(records, registry, {
            rows: 'power', columns: 'toughness'
        });
        expect(data.rows.map(row => row.id)).toEqual([1, 2, 3]);
        expect(data.columns.map(column => column.id)).toEqual([1, 2, 4]);
        expect(data.getRecords({ row: 2, column: 2 })).toEqual([records[0]]);
        registry.registerMeasure('average-power', {
            label: 'Average power', field: 'power',
            reduce: values => values.length
                ? values.reduce((sum, value) => sum + value, 0) / values.length : null
        });
        const average = queryStatistics(records, registry, {
            rows: 'art-credit', columns: 'art-credit', measure: 'average-power'
        });
        expect(average.total).toBe(2);
    });

    it('names guilds, shards and wedges while preserving color-set IDs', () => {
        const input = ['RW', 'BRG', 'URW', 'WBG'].map(manaCost => (
            cardRecord({ front: { manaCost } }, game)
        ));
        const data = queryStatistics(input, registry, {
            rows: 'exact-color', columns: 'art-credit'
        });
        const labels = new Map(data.rows.map(row => [row.id, row.label]));
        expect(labels.get('wr')).toBe('Boros (RW)');
        expect(labels.get('brg')).toBe('Jund (BRG)');
        expect(labels.get('wur')).toBe('Jeskai (URW)');
        expect(labels.get('wbg')).toBe('Abzan (WBG)');
        expect(data.getRecords({ row: 'wr' })).toEqual([input[0]]);
    });

    it('orders exact colors before multicolor identities consistently', () => {
        const input = ['BRG', 'G', 'B', 'RW', '2', 'R', 'U', 'W'].map(manaCost => (
            cardRecord({ front: { manaCost } }, game)
        ));
        input.push(cardRecord({ front: { colorOverride: ['m'] } }, game));
        const data = queryStatistics(input, registry, {
            rows: 'exact-color', columns: 'art-credit'
        });
        expect(data.rows.map(row => row.id)).toEqual([
            'c', 'w', 'u', 'b', 'r', 'g', 'wr', 'brg', 'unclassified'
        ]);
    });

});
