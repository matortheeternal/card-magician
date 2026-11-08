import { getChartType, validateChartType } from './chartTypes.js';

/** Game-scoped definitions. Accessors receive prepare(card)'s result. */
export default class StatisticsRegistry {
    /** @type {Map<string, import('./statisticsTypes.js').StatisticsDimension>} */
    dimensions = new Map();
    /** @type {Map<string, import('./statisticsTypes.js').StatisticsField>} */
    fields = new Map();
    /** @type {Map<string, import('./statisticsTypes.js').StatisticsMeasure>} */
    measures = new Map();
    /** @type {Map<string, {label?: string, test: (record: any) => boolean}>} */
    filters = new Map();
    /** @type {Map<string, import('./statisticsTypes.js').ChartDefinition>} */
    reports = new Map();
    /** @type {Map<string, import('./statisticsTypes.js').ChartRenderer>} */
    chartTypes = new Map();
    /** @type {(card: any) => any} */
    prepare = card => card;
    /** @type {(record: any) => boolean} Eligibility rule applied to every query. */
    include = () => true;

    constructor() {
        this.registerMeasure('card-count', {
            label: 'Cards', integer: true,
            reduce: records => records.length,
            format: value => String(value),
            describe: value => `${value} ${value === 1 ? 'card' : 'cards'}`
        });
    }

    add(collection, id, definition) {
        if (!id || collection.has(id))
            throw new Error(`Duplicate or empty statistics identifier: ${id}`);
        collection.set(id, { ...definition, id });
    }

    /** @param {string} id @param {import('./statisticsTypes.js').StatisticsDimension} definition */
    registerDimension(id, definition) {
        if (typeof definition.values !== 'function')
            throw new Error(`Dimension requires a values accessor: ${id}`);
        this.add(this.dimensions, id, definition);
    }

    /** @param {string} id @param {import('./statisticsTypes.js').StatisticsField} definition */
    registerField(id, definition) {
        if (typeof definition.value !== 'function')
            throw new Error(`Field requires a value accessor: ${id}`);
        this.add(this.fields, id, definition);
    }

    /** @param {string} id @param {import('./statisticsTypes.js').StatisticsMeasure} definition */
    registerMeasure(id, definition) {
        if (typeof definition.reduce !== 'function')
            throw new Error(`Measure requires a reducer: ${id}`);
        this.add(this.measures, id, definition);
    }

    /** @param {string} id @param {{label?: string, test: (record: any) => boolean}} definition */
    registerFilter(id, definition) {
        if (typeof definition.test !== 'function')
            throw new Error(`Filter requires a predicate: ${id}`);
        this.add(this.filters, id, definition);
    }

    /** @param {string} id @param {import('./statisticsTypes.js').ChartDefinition} definition */
    registerReport(id, definition) {
        this.add(this.reports, id, definition);
    }

    /** @param {string} id @param {import('./statisticsTypes.js').ChartRenderer} renderer */
    registerChartType(id, renderer) {
        validateChartType(id, renderer);
        if (getChartType(id))
            throw new Error(`Cannot replace built-in chart type: ${id}`);
        this.add(this.chartTypes, id, renderer);
    }

    getChartType(id) {
        return this.chartTypes.get(id) || getChartType(id);
    }
}
