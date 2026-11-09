const percentage = new Intl.NumberFormat(undefined, {
    style: 'percent', maximumFractionDigits: 1
});

export function formatPercentage(count, total) {
    if (!total) return '—';
    return percentage.format(count / total);
}
