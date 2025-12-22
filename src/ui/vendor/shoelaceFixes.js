function closeSubmenu(menuItem) {
    const submenuPopup = menuItem.renderRoot?.querySelector('sl-popup');
    if (submenuPopup && submenuPopup.active)
        submenuPopup.active = false;

    menuItem.blur();
    menuItem.requestUpdate();
}

document.addEventListener('sl-reposition', event => {
    const menuItem = event.target;
    if (menuItem?.tagName !== 'SL-MENU-ITEM') return;

    const parentMenu = menuItem.closest('sl-menu');
    if (!parentMenu) return;

    parentMenu.querySelectorAll('sl-menu-item').forEach(item => {
        if (item === menuItem) return;
        closeSubmenu(item);
    });
});
