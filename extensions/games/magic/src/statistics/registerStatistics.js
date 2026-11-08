import { COLORS, RARITIES, CARD_TYPES, cardRecord } from './cardRecord.js';
import './MagicStatistics.js';
import { addDesignerFields, registerDesignerReports } from './designerReports.js';

function manaCategories(records) {
    const values = new Set([0]);
    let max = 0;
    for (const record of records) {
        if (record.manaValue === null) continue;
        const value = Math.min(8, record.manaValue);
        values.add(value);
        max = Math.max(max, value);
    }
    for (let i = 0; i <= max; i++) values.add(i);
    return [...values].sort((a, b) => a - b).map(value => ({
        id: value, label: value === 8 ? '8+' : String(value)
    }));
}

export function registerStatistics(game) {
    const registry = game.statistics;
    const cardIds = new WeakMap();
    let nextId = 0;
    registry.prepare = card => {
        if (!cardIds.has(card)) cardIds.set(card, nextId++);
        return {
            card, analysisId: cardIds.get(card),
            ...cardRecord(card, game), ...addDesignerFields(card)
        };
    };
    registry.include = record => !record.isAuxiliary && RARITIES.includes(record.rarity);
    registry.registerDimension('color', {
        label: 'Color', values: record => [record.color],
        categories: COLORS.map(color => ({
            ...color,
            icon: color.id === 'm' ? '/' + game.resolveAsset('multicolor.svg')
                : '/' + game.resolvePath(
                    `../../cardparts/magic/M15/Symbols/assets/flat/single/${color.id}.png`
                )
        }))
    });
    registry.registerDimension('rarity', {
        label: 'Rarity', categories: RARITIES.map(id => ({
            id, label: id.charAt(0).toUpperCase() + id.slice(1)
        })), values: record => [record.rarity]
    });
    registry.registerDimension('card-type', {
        label: 'Card type', categories: CARD_TYPES,
        values: record => record.types
    });
    registry.registerDimension('mana-value', {
        label: 'Mana value', categories: manaCategories,
        values: record => record.manaValue === null
            ? [] : [Math.min(8, record.manaValue)]
    });
    registry.registerField('mana-value', {
        label: 'Mana value', value: record => record.manaValue
    });
    registry.registerFilter('nonland', {
        label: 'Nonland cards', test: record => !record.isLand
    });
    registry.registerReport('color-rarity', {
        type: 'matrix', title: 'Color × rarity',
        rows: 'color', columns: 'rarity', measure: 'card-count'
    });
    registry.registerReport('color-type', {
        type: 'matrix', title: 'Color × card type',
        rows: 'color', columns: 'card-type', measure: 'card-count'
    });
    registry.registerReport('mana-curve', {
        type: 'line', types: ['line', 'bar'], title: 'Mana curve by color',
        x: 'mana-value', series: 'color', measure: 'card-count',
        toggleSeries: true,
        filterToggle: { filter: 'nonland', label: 'Include lands' }
    });
    registerDesignerReports(registry);
}
