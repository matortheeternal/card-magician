import { colorCombinationLabel } from './colorCombinationLabels.js';
import { COLORS, CARD_TYPES } from './cardRecord.js';
import { localizeStatisticsText } from './localization.js';

const L = localize('game-magic-statistics');
const SINGLE_COLOR_ORDER = new Map(
    ['c', 'w', 'u', 'b', 'r', 'g'].map((id, index) => [id, index])
);
const OVERVIEW_TYPE_GROUPS = new Map([['Battle', 'Other'], ['Kindred', 'Other']]);
const OVERVIEW_TYPES = CARD_TYPES.filter(id => (
    !['Battle', 'Kindred', 'Land'].includes(id)
));

function colorCombinationCategory(id) {
    if (id === 'unclassified') return { id, label: L`Unclassified` };
    const color = COLORS.find(color => color.id === id);
    if (color) return { ...color, label: localizeStatisticsText(color.label) };
    return { id, label: colorCombinationLabel(id) };
}

function exactColor(record) {
    return record.colorCombination ?? 'unclassified';
}

function compareColorCombinations(a, b) {
    const aOrder = SINGLE_COLOR_ORDER.get(a) ?? SINGLE_COLOR_ORDER.size;
    const bOrder = SINGLE_COLOR_ORDER.get(b) ?? SINGLE_COLOR_ORDER.size;
    return aOrder - bOrder || a.length - b.length || a.localeCompare(b);
}

function colorCombinations(records) {
    const ids = [...new Set(records.map(exactColor))];
    ids.sort(compareColorCombinations);
    return ids.map(colorCombinationCategory);
}

function registerNumericDimension(registry, id, label) {
    registry.registerDimension(id, {
        label, values: record => [record[id]], compare: (a, b) => a - b
    });
    registry.registerField(id, { label, value: record => record[id] });
}

function registerColorDimensions(registry) {
    registry.registerDimension('exact-color', {
        label: L`Exact color combination`,
        values: record => [exactColor(record)], categories: colorCombinations
    });
    registry.registerDimension('color-count', {
        label: L`Color count`, values: record => [record.colorCount ?? 'unclassified'],
        categories: [
            { id: 0, label: L`Colorless` },
            { id: 1, label: L`Monocolor` },
            { id: 2, label: L`Two-color` },
            { id: 3, label: L`Three-color` },
            { id: 4, label: L`Four-color` },
            { id: 5, label: L`Five-color` },
            { id: 'unclassified', label: L`Unclassified` }
        ]
    });
}

function creatureShapeValues(record) {
    if (!record.creatureTypes.length) return [];
    return [record.creatureShape ?? 'unclassified'];
}

function registerCreatureDimensions(registry) {
    registry.registerDimension('creature-shape', {
        label: L`Creature shape`, values: creatureShapeValues,
        categories: [
            { id: 'square', label: L`Square` },
            { id: 'aggressive', label: L`Aggressive` },
            { id: 'defensive', label: L`Defensive` },
            { id: 'unclassified', label: L`Unclassified` }
        ]
    });
    registerNumericDimension(registry, 'power', L`Power`);
    registerNumericDimension(registry, 'toughness', L`Toughness`);
}

function registerTypeOverview(registry) {
    registry.registerDimension('card-type-overview', {
        label: L`Card type`,
        values: record => record.types.map(type => (
            OVERVIEW_TYPE_GROUPS.get(type) || type
        )),
        categories: OVERVIEW_TYPES.map(id => ({ id, label: localizeStatisticsText(id) }))
    });
}

function registerArtCredit(registry) {
    registry.registerDimension('art-credit', {
        label: L`Art credit`,
        values: record => [record.hasArtCredit ? 'credited' : 'missing'],
        categories: [
            { id: 'credited', label: L`Credited` },
            { id: 'missing', label: L`Missing art credit` }
        ]
    });
}

export function registerCardDimensions(registry) {
    registerColorDimensions(registry);
    registerCreatureDimensions(registry);
    registerArtCredit(registry);
    registerTypeOverview(registry);
}
