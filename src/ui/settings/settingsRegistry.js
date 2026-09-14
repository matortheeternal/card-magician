const settings = [];

export function registerSettings(SettingsClass) {
    customElements.define(SettingsClass.id, SettingsClass);
    settings.push(SettingsClass);
}

function sortByWeight(settings) {
    return settings.sort((a, b) => {
        return b.groupWeight - a.groupWeight;
    });
}

export function getSettingsTabs() {
    const settingsByParentId = new Map();
    for (const SettingsClass of settings) {
        const key = SettingsClass.parentId;
        if (!settingsByParentId.has(key))
            settingsByParentId.set(key, []);
        settingsByParentId.get(key).push(SettingsClass);
    }

    const getChildren = (id, allowRoot = false) => {
        if (id === null && !allowRoot) return [];
        return sortByWeight(settingsByParentId.get(id) ?? [])
            .flatMap(s => [s, ...getChildren(s.id)]);
    };

    return getChildren(null, true);
}
