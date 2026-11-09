import { COLORS, RARITIES, CARD_TYPES, cardRecord } from './cardRecord.js';
import './MagicStatistics.js';
import { registerCardDimensions } from './registerCardDimensions.js';
import {
    average, max, median, wordCountBucket, wordCountCategories
} from './textAnalysis.js';
import reports from './reports.json';
import { localizeStatisticsText, localizeReport } from './localization.js';
import rarityPresets, {
    RARITY_GRADIENT_OFFSETS
} from '../domain/setSymbol/rarityPresets.js';

const L = localize('game-magic-statistics');
const MAX_MANA_VALUE = 8;
const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const WORD_MEASURES = [
    ['average-words', 'Average words', average],
    ['median-words', 'Median words', median],
    ['word-count', 'Words', max]
];

function manaCategories(records) {
    const values = new Set([0]);
    let max = 0;
    for (const record of records) {
        if (record.manaValue === null) continue;
        const value = Math.min(MAX_MANA_VALUE, record.manaValue);
        values.add(value);
        max = Math.max(max, value);
    }
    for (let i = 0; i <= max; i++) values.add(i);
    return [...values].sort((a, b) => a - b).map(value => ({
        id: value, label: value === MAX_MANA_VALUE ? `${MAX_MANA_VALUE}+` : String(value)
    }));
}

function getRarityCategories() {
    return rarityPresets.map(preset => ({
        id: preset.id,
        label: localizeStatisticsText(preset.name),
        color: preset.g2,
        outline: preset.outline,
        gradient: RARITY_GRADIENT_OFFSETS.map((offset, i) => ({
            offset, color: preset[`g${i + 1}`]
        }))
    }));
}

function createRecordPreparer(game) {
    const cardIds = new WeakMap();
    let nextId = 0;
    return (card, project) => {
        if (!cardIds.has(card)) cardIds.set(card, nextId++);
        return {
            card, analysisId: cardIds.get(card),
            ...cardRecord(card, game, project)
        };
    };
}

function formatWords(value) {
    if (value === null) return '—';
    return formatter.format(value);
}

function describeWords(value) {
    if (value === null) return '—';
    return L`${formatWords(value)} words`;
}

function creatureTypeLabel(type) {
    if (type === 'No creature type') return L`No creature type`;
    return type;
}

function subtypeCategories(records, property, label = value => value) {
    const types = [...new Set(records.flatMap(record => record[property]))];
    types.sort((a, b) => a.localeCompare(b));
    return types.map(id => ({ id, label: label(id) }));
}

function registerDimensions(registry, game) {
    registry.registerDimension('color', {
        label: L`Color`, values: record => [record.color],
        categories: COLORS.map(color => ({
            ...color,
            label: localizeStatisticsText(color.label),
            icon: game.symbols.resolveColorSymbolIcon(color.id)
        }))
    });
    registry.registerDimension('rarity', {
        label: L`Rarity`,
        categories: getRarityCategories(),
        values: record => [record.rarity]
    });
    registry.registerDimension('card-type', {
        label: L`Card type`,
        categories: CARD_TYPES.map(id => ({ id, label: localizeStatisticsText(id) })),
        values: record => record.types
    });
    registry.registerDimension('mana-value', {
        label: L`Mana value`,
        categories: manaCategories,
        values: record => record.manaValue === null
            ? [] : [Math.min(MAX_MANA_VALUE, record.manaValue)]
    });
    registry.registerDimension('creature-type', {
        label: L`Creature type`,
        categories: records => subtypeCategories(
            records, 'creatureTypes', creatureTypeLabel
        ),
        values: record => record.creatureTypes,
        compare: (a, b) => a.localeCompare(b)
    });
    registry.registerDimension('non-creature-subtype', {
        label: L`Non-creature subtype`,
        categories: records => subtypeCategories(records, 'nonCreatureSubtypes'),
        values: record => record.nonCreatureSubtypes
    });
    registry.registerDimension('all-permanents', {
        label: L`Permanents`,
        categories: [{ id: 'all', label: L`All permanents` }],
        values: () => ['all']
    });
    registry.registerDimension('legendary-status', {
        label: L`Legendary status`,
        categories: [
            { id: 'legendary', label: L`Legendary` },
            { id: 'other', label: L`Other permanents` }
        ],
        values: record => [record.isLegendary ? 'legendary' : 'other']
    });
    registry.registerDimension('word-count', {
        label: L`Rules text words`,
        categories: wordCountCategories,
        values: record => [wordCountBucket(record.wordCount)]
    });
    registry.registerDimension('card', {
        label: L`Card`,
        values: record => [record.analysisId],
        categories: records => records.map(record => ({
            id: record.analysisId, label: record.name
        }))
    });
    registry.registerDimension('all-cards', {
        label: L`Cards`,
        categories: [{ id: 'all', label: L`Words` }],
        values: () => ['all']
    });
}

function registerFields(registry) {
    registry.registerField('mana-value', {
        label: L`Mana value`,
        value: record => record.manaValue
    });
    registry.registerField('word-count', {
        label: L`Rules text words`,
        value: record => record.wordCount
    });
}

function registerMeasures(registry) {
    registry.registerMeasure('missing-art-credit', {
        ...registry.measures.get('card-count'),
        label: L`Cards without art credit`,
        reduce: records => records.filter(record => !record.hasArtCredit).length
    });
    for (const [id, label, reduce] of WORD_MEASURES) {
        registry.registerMeasure(id, {
            label: localizeStatisticsText(label), field: 'word-count', reduce,
            format: formatWords,
            describe: describeWords
        });
    }
}

function registerFilters(registry) {
    registry.registerFilter('permanents', {
        label: L`Permanent cards`, test: record => record.isPermanent
    });
    registry.registerFilter('nonland', {
        label: L`Nonland cards`,
        test: record => !record.isLand
    });
    registry.registerFilter('creatures', {
        label: L`Creature cards`,
        test: record => record.creatureTypes.length > 0
    });
    registry.registerFilter('common-creatures', {
        label: L`Common creatures`,
        test: record => record.rarity === 'common' && record.creatureTypes.length > 0
    });
}

function registerReports(registry) {
    for (const [id, definition] of Object.entries(reports))
        registry.registerReport(id, localizeReport(definition));
}

export function registerStatistics(game) {
    const registry = game.statistics;
    registry.prepare = createRecordPreparer(game);
    registry.cardForRecord = record => record.card;
    registry.projectProperties.push('illustrator');
    registry.include = record => RARITIES.includes(record.rarity);
    registerDimensions(registry, game);
    registerCardDimensions(registry);
    registerFields(registry);
    registerMeasures(registry);
    registerFilters(registry);
    registerReports(registry);
}
