const L = localize('install-package-modal');

export function renderExtensionSummary(extensions, selectedCount) {
    const newCount = extensions.filter(extension => extension.isNew).length;
    const updateCount = extensions.filter(extension => {
        return !extension.isNew && extension.canInstall;
    }).length;
    const outdatedCount = extensions.filter(extension => extension.isOutdated).length;
    const installedCount = extensions.length - newCount - updateCount - outdatedCount;
    return (
        `<strong>${L`Selected to install: ${selectedCount}`}</strong>
        <small>${L`New: ${newCount}`} · ${L`Updated: ${updateCount}`} ·
            ${L`Outdated: ${outdatedCount}`} · ${L`Installed: ${installedCount}`}</small>`
    );
}
