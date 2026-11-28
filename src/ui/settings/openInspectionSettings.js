export default function openInspectionSettings(id) {
    const section = window.activeGame?.cardInspector?.settingsId;
    const workspace = document.querySelector('cm-settings-workspace');
    if (!section || !workspace) return;
    workspace.open(section);
    workspace.contentContainer.firstElementChild?.selectInspection?.(id);
}
