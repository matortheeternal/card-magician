import {
    average, max, median, countRulesWords, creatureTypes,
    wordCountBucket, wordCountCategories
} from './textAnalysis.js';

export function addDesignerFields(card) {
    const face = card.front || {};
    return {
        wordCount: countRulesWords(face.rulesText),
        creatureTypes: creatureTypes(face),
        name: face.name || 'Unnamed card'
    };
}

const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
function format(value, suffix = '') {
    if (value === null) return '—';
    return formatter.format(value) + suffix;
}

const wordMeasures = [
    ['average-words', 'Average words', average],
    ['median-words', 'Median words', median],
    ['word-count', 'Words', max]
];

function registerWordCountMeasures(registry) {
    for (const [id, label, reduce] of wordMeasures) {
        registry.registerMeasure(id, {
            label,
            field: 'word-count',
            reduce,
            format,
            describe: value => format(value, ' words')
        });
    }
}

export function registerDesignerReports(registry) {
    registerWordCountMeasures(registry);
    registry.registerDimension('creature-type', {
        label: 'Creature type',
        values: record => record.creatureTypes,
        compare: (a, b) => a.localeCompare(b)
    });
    registry.registerDimension('word-count', {
        label: 'Rules text words',
        categories: wordCountCategories,
        values: record => [wordCountBucket(record.wordCount)]
    });
    registry.registerDimension('card', {
        label: 'Card',
        values: record => [record.analysisId],
        categories: records => records.map(record => ({
            id: record.analysisId, label: record.name
        }))
    });
    registry.registerDimension('all-cards', {
        label: 'Cards',
        categories: [{ id: 'all', label: 'Words' }],
        values: () => ['all']
    });
    registry.registerField('word-count', {
        label: 'Rules text words',
        value: record => record.wordCount
    });
    registry.registerFilter('creatures', {
        label: 'Creature cards',
        test: record => record.creatureTypes.length > 0
    });
    registry.registerFilter('common-creatures', {
        label: 'Common creatures',
        test: record => {
            return record.rarity === 'common'
                && record.creatureTypes.length > 0;
        }
    });
    registry.registerReport('creature-types', {
        type: 'horizontal-bar',
        types: ['horizontal-bar', 'matrix'],
        title: 'Creature subtypes',
        rows: 'creature-type',
        columns: 'color',
        measure: 'card-count',
        filters: ['creatures'],
        sortRows: 'descending',
        stacked: true
    });
    registry.registerReport('common-creature-curve', {
        type: 'bar',
        types: ['bar', 'line'],
        title: 'Common creature curve',
        x: 'mana-value',
        series: 'color',
        measure: 'card-count',
        toggleSeries: true,
        filters: ['common-creatures']
    });
    registry.registerReport('rules-text-length', {
        type: 'bar',
        title: 'Rules text length',
        x: 'word-count',
        series: 'rarity',
        measure: 'card-count',
        toggleSeries: true,
        description: 'Includes reminder text; excludes mana symbols and formatting.'
    });
    registry.registerReport('rules-text-by-color', {
        type: 'matrix',
        title: 'Rules text length by color and rarity',
        rows: 'color',
        columns: 'rarity',
        measure: 'average-words',
        measures: ['average-words', 'median-words']
    });
    registry.registerReport('wordiest-cards', {
        type: 'matrix',
        title: 'Wordiest cards',
        rows: 'card',
        columns: 'all-cards',
        measure: 'word-count',
        totals: false,
        sortRows: 'descending',
        limitRows: 10
    });
}
