import type StatisticsRegistry from './domain/statistics/StatisticsRegistry.js';

export type CategoryId = string | number;

export type Category = {
    id: CategoryId;
    label: string;
    icon?: string;
    color?: string;
    outline?: string;
    gradient?: Array<{ offset: number; color: string }>;
};

export type StatisticsDimension = {
    label: string;
    values: (record: any) => Array<CategoryId | null | undefined>;
    categories?: Array<Category | CategoryId>
        | ((records: any[]) => Array<Category | CategoryId>);
    missing?: CategoryId;
    compare?: (a: CategoryId, b: CategoryId) => number;
};

export type StatisticsField = {
    label: string;
    value: (record: any) => number | null;
};

export type StatisticsMeasure = {
    label: string;
    reduce: (values: any[]) => number | null;
    field?: string;
    integer?: boolean;
    format?: (value: number | null) => string;
    describe?: (value: number | null) => string;
};

export type StatisticsQuery = {
    rows: string;
    columns: string;
    measure?: string;
    filters?: string[];
    excludedColumns?: CategoryId[];
    sortRows?: 'ascending' | 'descending';
    limitRows?: number;
};

export type ChartSelection = { row?: CategoryId; column?: CategoryId };

export type StatisticsResult = {
    rows: Category[];
    columns: Category[];
    cells: Array<Array<number | null>>;
    rowTotals: Array<number | null>;
    columnTotals: Array<number | null>;
    total: number | null;
    rowLabel: string;
    columnLabel: string;
    measureLabel: string;
    integer: boolean;
    cardCount: number;
    scopeCount: number;
    excludedCount: number;
    formatValue: (value: number | null) => string;
    describeValue: (value: number | null) => string;
    getRecords: (selection?: ChartSelection) => any[];
};

export type ChartRenderOptions = {
    width: number;
    definition: ChartDefinition;
    context: StatisticsContext;
    activate?: (selection: ChartSelection) => void;
};

export type ChartDefinition = Partial<StatisticsQuery> & {
    type: string;
    title?: string;
    description?: string;
    series?: string;
    numerator?: CategoryId;
    breakdown?: boolean;
    views?: Array<{ id: string; label: string; definition: Partial<ChartDefinition> }>;
    measures?: string[];
    stacked?: boolean;
    types?: string[];
    toggleSeries?: boolean;
    seriesAxis?: 'rows' | 'columns';
    displayLimit?: number;
    dataTable?: boolean;
    totals?: boolean;
    filterToggle?: { filter: string; label: string };
};

export type ChartRenderer = {
    label?: string;
    shape: 'matrix' | 'series';
    create: (container: HTMLElement) => ChartRendererInstance;
    validateDefinition?: (definition: ChartDefinition, registry: StatisticsRegistry) => void;
    validateData?: (data: StatisticsResult, definition: ChartDefinition) => void;
};

export type ChartRendererInstance = {
    render: (data: StatisticsResult, options: ChartRenderOptions) => void;
    resize?: (data: StatisticsResult, options: ChartRenderOptions) => void;
    dispose?: () => void;
};

export type StatisticsContext = {
    registry: StatisticsRegistry;
    records: any[];
    project?: any;
};
