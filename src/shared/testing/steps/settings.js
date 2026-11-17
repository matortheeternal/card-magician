import { eventually } from '../testUtils.js';

async function expandTreeItems(item) {
    const ancestors = [];
    for (let parent = item.parentElement; parent.tagName === 'SL-TREE-ITEM';
        parent = parent.parentElement)
        ancestors.unshift(parent);
    for (const ancestor of ancestors) {
        await ancestor.updateComplete;
        if (ancestor.expanded) continue;
        const expand = ancestor.shadowRoot.querySelector('[part="expand-button"]');
        await window.cmTest.click(expand);
        await eventually(() => ancestor.expanded);
    }
}

export async function selectSettingsTab(modal, id) {
    const item = modal.querySelector(`[data-tab-id="${id}"]`);
    await expandTreeItems(item);
    await item.updateComplete;
    await window.cmTest.click(item.shadowRoot.querySelector('[part="label"]'));
    return eventually(() => modal.querySelector(id));
}
