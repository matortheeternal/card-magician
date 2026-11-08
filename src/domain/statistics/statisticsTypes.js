/**
 * @typedef {string|number} CategoryId
 * @typedef {{id: CategoryId, label: string, icon?: string, color?: string}} Category
 * @typedef {object} StatisticsDimension
 * @property {string} label
 * @property {(record: any) => Array<CategoryId|null|undefined>} values
 * @property {Array<Category|CategoryId>|((records: any[]) => Array<Category|CategoryId>)} [categories]
 * @property {CategoryId} [missing]
 * @property {(a: CategoryId, b: CategoryId) => number} [compare]
 *
 * @typedef {{label: string, value: (record: any) => number|null}} StatisticsField
 * @typedef {object} StatisticsMeasure
 * @property {string} label
 * @property {(values: any[]) => number|null} reduce
 * @property {string} [field] Numeric field; omitted to reduce prepared records.
 * @property {boolean} [integer]
 * @property {(value: number|null) => string} [format]
 * @property {(value: number|null) => string} [describe]
 *
 * @typedef {object} ChartDefinition
 * @property {string} type
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [rows]
 * @property {string} [columns]
 * @property {string} [x]
 * @property {string} [series]
 * @property {string} [measure]
 * @property {string[]} [measures] Measures offered in the chart's selector.
 * @property {'ascending'|'descending'} [sortRows] Sort by the row's aggregate value.
 * @property {number} [limitRows] Display the first N sorted rows; totals retain all rows.
 * @property {string[]} [filters]
 * @property {string[]} [types] Compatible chart types offered as a switch.
 * @property {boolean} [toggleSeries]
 * @property {boolean} [totals]
 * @property {{filter: string, label: string}} [filterToggle]
 *   Applies this filter until the checkbox is checked.
 *
 * @typedef {object} ChartRenderer
 * @property {string} [label]
 * @property {'matrix'|'series'} shape
 * @property {(container: HTMLElement) => ChartRendererInstance} create
 * @typedef {object} ChartRendererInstance
 * @property {(data: any, options: any) => void} render
 * @property {(data: any, options: any) => void} [resize]
 * @property {() => void} [dispose]
 *
 * @typedef {object} StatisticsContext
 * @property {import('./StatisticsRegistry.js').default} registry
 * @property {any[]} records Prepared once per project update.
 * @property {any} [project]
 */
export {};
