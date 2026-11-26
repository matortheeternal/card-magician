import { eventually } from './testUtils.js';

/**
 * Include the mouse events Shoelace uses to distinguish clicks from drags.
 *
 * @param {HTMLElement | null} element
 * @return Promise<void>
 */
async function click(element) {
    if (!element) throw new Error('Cannot click a missing control');
    await element.updateComplete;
    element.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true, composed: true, button: 0
    }));
    element.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true, composed: true, button: 0
    }));
    element.click();
}

/**
 * Open the Settings workspace tab.
 *
 * @returns {Promise<HTMLElement>}
 */
async function openSettings() {
    await click(document.querySelector('#workspace-tabs sl-tab[panel="settings"]'));
    const panel = document.querySelector('sl-tab-panel[name="settings"]');
    await eventually(() => panel.active);
    return panel.querySelector('cm-settings-workspace');
}

/**
 * Switch back to Cards if Settings is open.
 *
 * @return Promise<void>
 */
async function closeSettings() {
    const panel = document.querySelector('sl-tab-panel[name="settings"]');
    if (!panel?.active) return;
    await click(document.querySelector('#workspace-tabs sl-tab[panel="cards"]'));
    await eventually(() => !panel.active);
}

window.cmTest = Object.freeze({ eventually, click, openSettings, closeSettings });
