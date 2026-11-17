const L = localize('start-screen');

function startTab(id, label, tagName = 'cm-under-construction') {
    return { id, label, tagName };
}

export function getStartTabs() {
    return [
        startTab('projects', L`Projects`, 'cm-project-select'),
        startTab('remote-design', L`Remote Design`),
        startTab('customize', L`Customize`),
        startTab('extensions', L`Extensions`),
        startTab('learn', L`Learn`)
    ];
}
