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

export function localizeReport(definition) {
    const report = structuredClone(definition);
    report.title = localizeStatisticsText(report.title);
    report.description = localizeStatisticsText(report.description);
    report.filterToggle = localizeFilterToggle(report.filterToggle);
    return report;
}
