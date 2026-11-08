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
 * Open Settings through the application's File menu.
 *
 * @returns {Promise<HTMLElement>}
 */
async function openSettings() {
    const menu = document.querySelector('title-bar-menu[data-menu-id="file"]');
    if (!menu) throw new Error('The application File menu is not available');
    const dropdown = menu.querySelector('sl-dropdown');
    if (!dropdown.open) await click(menu.querySelector('[slot="trigger"]'));
    await eventually(() => dropdown.open);
    const label = localize('title-bar')`Settings`;
    await click([...menu.querySelectorAll('sl-menu-item')]
        .find(item => item.value === label.toCamelCase()));
    const modal = await eventually(() => document.querySelector('cm-settings-modal'));
    await eventually(() => !dropdown.open);
    await Promise.all([...modal.querySelectorAll('sl-button')]
        .map(button => button.updateComplete));
    return modal;
}

/**
 * Close Settings using its visible Close button, if it is open.
 *
 * @return Promise<void>
 */
async function closeSettings() {
    const modal = document.querySelector('cm-settings-modal');
    if (!modal || getComputedStyle(modal.parentElement).display === 'none') return;
    const closeButton = modal.querySelector('.modal-actions [data-click-action="close"]');
    await click(closeButton);
    await eventually(() => getComputedStyle(modal.parentElement).display === 'none');
}

window.cmTest = Object.freeze({ eventually, click, openSettings, closeSettings });
