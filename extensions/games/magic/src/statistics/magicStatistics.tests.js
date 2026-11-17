import { queryStatistics } from '../../../../../src/domain/statistics/queryStatistics.js';
import { useGame } from '../../../../../src/shared/testing/gameFixture.js';

describe('Magic statistics', () => {
    useGame('magic');

    function makeCard(manaCost, superType, rarity = 'common', other = {}) {
        return new activeGame.Card({ front: {
            manaCost: activeGame.ManaScribe.ManaCost.parse(manaCost),
            superType, rarity, ...other
        } });
    }

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
});
