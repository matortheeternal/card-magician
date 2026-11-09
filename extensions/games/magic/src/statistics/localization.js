const L = localize('game-magic-statistics');

export function localizeStatisticsText(text) {
    if (!text) return text;
    const strings = Object.assign([text], { raw: [text] });
    return L(strings);
}

function localizeFilterToggle(toggle) {
    if (!toggle) return toggle;
    return { ...toggle, label: localizeStatisticsText(toggle.label) };
}

function localizeView(view) {
    return {
        ...view, label: localizeStatisticsText(view.label),
        definition: localizeReport(view.definition || {})
    };
}

export function localizeReport(definition) {
    const report = structuredClone(definition);
    for (const key of ['title', 'description'])
        if (key in report) report[key] = localizeStatisticsText(report[key]);
    if (report.filterToggle)
        report.filterToggle = localizeFilterToggle(report.filterToggle);
    if (report.views) report.views = report.views.map(localizeView);
    return report;
}
