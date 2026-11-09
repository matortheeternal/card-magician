import { getChartType, validateChartType } from './chartTypes.js';

const L = localize('statistics');

function registerDefinition(collection, id, definition) {
    if (!id || collection.has(id))
        throw new Error(L`Duplicate or empty statistics identifier: ${id}`);
    collection.set(id, { ...definition, id });
}

function describeCardCount(value) {
    if (value === 1) return L`${value} card`;
    return L`${value} cards`;
}

/**
 * Stores one game's statistics data definitions and custom chart renderers.
 *
 * Every game receives its own registry through CardMagicianGame.statistics.
 * Accessors and filters consume the result of prepare(card). Definitions are
 * registered before the Statistics workspace mounts. Identifiers remain stable
 * across locales; display labels must already be localized when registered.
 *
 * Built-in chart types are shared. Custom chart types are scoped to this registry
 * and cannot replace built-ins. See the statistics README for configuration and
 * renderer examples.
 */
export default class StatisticsRegistry {
    /**
     * Dimensions indexed by their stable identifiers.
     * @type {Map<string, StatisticsDimension>}
     */
    dimensions = new Map();
    /**
     * Numeric fields available to measures, indexed by identifier.
     * @type {Map<string, StatisticsField>}
     */
    fields = new Map();
    /**
     * Aggregate measures, including the built-in card-count measure.
     * @type {Map<string, StatisticsMeasure>}
     */
    measures = new Map();
    /**
     * Named predicates applied by report definitions.
     * @type {Map<string, {label?: string, test: (record: any) => boolean}>}
     */
    filters = new Map();
    /**
     * Default report configurations indexed by identifier.
     * @type {Map<string, ChartDefinition>}
     */
    reports = new Map();
    /**
     * Game-specific chart renderers indexed by identifier.
     * @type {Map<string, ChartRenderer>}
     */
    chartTypes = new Map();
    /**
     * Creates an analysis record from a project card once per project update.
     * Defaults to returning the card unchanged.
     * @type {(card: card) => any}
     */
    prepare = card => card;
    cardForRecord = record => record;
    /**
     * Determines eligibility before every report's filters are evaluated.
     * Defaults to including every prepared record.
     * @type {(record: any) => boolean}
     */
    include = () => true;

    /**
     * Creates an empty registry and installs the distinct card-count measure.
     *
     * @returns {StatisticsRegistry}
     *   A registry ready for game-specific registrations.
     */
    constructor() {
        this.registerMeasure('card-count', {
            label: L`Cards`, integer: true,
            reduce: records => records.length,
            format: value => String(value),
            describe: describeCardCount
        });
    }

    /**
     * Registers a categorical grouping and its category presentation metadata.
     *
     * @param {string} id
     *   Unique dimension identifier within this registry.
     * @param {StatisticsDimension} definition
     *   Definition whose values accessor returns category identifiers per record.
     * @returns {void}
     * @throws {Error} If the identifier is empty/duplicated or values is not callable.
     */
    registerDimension(id, definition) {
        if (typeof definition.values !== 'function')
            throw new Error(L`Dimension requires a values accessor: ${id}`);
        registerDefinition(this.dimensions, id, definition);
    }

    /**
     * Registers a numeric field that a measure can aggregate.
     *
     * @param {string} id
     *   Unique field identifier within this registry.
     * @param {StatisticsField} definition
     *   Field label and numeric value accessor for prepared records.
     * @returns {void}
     * @throws {Error} If the identifier is empty/duplicated or value is not callable.
     */
    registerField(id, definition) {
        if (typeof definition.value !== 'function')
            throw new Error(L`Field requires a value accessor: ${id}`);
        registerDefinition(this.fields, id, definition);
    }

    /**
     * Registers an aggregate over prepared records or a named numeric field.
     *
     * @param {string} id
     *   Unique measure identifier within this registry.
     * @param {StatisticsMeasure} definition
     *   Reducer and presentation options. Reducers handle empty groups and return
     *   a finite number or null. Field measures receive only finite numeric values.
     * @returns {void}
     * @throws {Error} If the identifier is empty/duplicated or reduce is not callable.
     */
    registerMeasure(id, definition) {
        if (typeof definition.reduce !== 'function')
            throw new Error(L`Measure requires a reducer: ${id}`);
        registerDefinition(this.measures, id, definition);
    }

    /**
     * Registers a report-selectable predicate over prepared records.
     *
     * @param {string} id
     *   Unique filter identifier within this registry.
     * @param {{label?: string, test: (record: any) => boolean}} definition
     *   Optional localized label and predicate; true retains the record.
     * @returns {void}
     * @throws {Error} If the identifier is empty/duplicated or test is not callable.
     */
    registerFilter(id, definition) {
        if (typeof definition.test !== 'function')
            throw new Error(L`Filter requires a predicate: ${id}`);
        registerDefinition(this.filters, id, definition);
    }

    /**
     * Registers a named default report for cm-chart's report attribute.
     *
     * @param {string} id
     *   Unique report identifier within this registry.
     * @param {ChartDefinition} definition
     *   Chart configuration with localized display text. Referenced identifiers
     *   are validated when a chart resolves and renders the report.
     * @returns {void}
     * @throws {Error} If the identifier is empty or already registered.
     */
    registerReport(id, definition) {
        registerDefinition(this.reports, id, definition);
    }

    /**
     * Registers a renderer available only to this game instance.
     *
     * @param {string} id
     *   Unique chart type identifier, preferably prefixed with the game ID.
     * @param {ChartRenderer} renderer
     *   Matrix- or series-shaped renderer factory with its display label.
     * @returns {void}
     * @throws {Error} If the identifier is invalid/duplicated, matches a built-in,
     *   or the renderer does not declare a supported shape and create function.
     */
    registerChartType(id, renderer) {
        validateChartType(id, renderer);
        if (getChartType(id))
            throw new Error(L`Cannot replace built-in chart type: ${id}`);
        registerDefinition(this.chartTypes, id, renderer);
    }

    /**
     * Resolves a game-specific renderer or a shared built-in renderer.
     *
     * @param {string} id
     *   Chart type identifier to resolve.
     * @returns {ChartRenderer|undefined}
     *   The registered renderer, or undefined when the type is unknown.
     */
    getChartType(id) {
        return this.chartTypes.get(id) || getChartType(id);
    }
}
