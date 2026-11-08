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

export type ChartDefinition = {
    type: string;
    title?: string;
    description?: string;
    rows?: string;
    columns?: string;
    x?: string;
    series?: string;
    measure?: string;
    measures?: string[];
    sortRows?: 'ascending' | 'descending';
    limitRows?: number;
    stacked?: boolean;
    filters?: string[];
    types?: string[];
    toggleSeries?: boolean;
    totals?: boolean;
    filterToggle?: { filter: string; label: string };
};

export type ChartRenderer = {
    label?: string;
    shape: 'matrix' | 'series';
    create: (container: HTMLElement) => ChartRendererInstance;
};

export type ChartRendererInstance = {
    render: (data: any, options: any) => void;
    resize?: (data: any, options: any) => void;
    dispose?: () => void;
};

export type StatisticsContext = {
    registry: StatisticsRegistry;
    records: any[];
    project?: any;
};
