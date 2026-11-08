const chartTypes = new Map();

export function validateChartType(id, renderer) {
    if (!id || !['matrix', 'series'].includes(renderer.shape)
        || typeof renderer.create !== 'function')
        throw new Error(`Invalid chart type: ${id}`);
}

export function registerChartType(id, renderer) {
    validateChartType(id, renderer);
    if (chartTypes.has(id)) throw new Error(`Chart type already registered: ${id}`);
    chartTypes.set(id, renderer);
    return () => chartTypes.delete(id);
}

export function getChartType(id) {
    return chartTypes.get(id);
}
