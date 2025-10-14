import { registerComponent } from '../../componentRegistry.js';
import { titleBarMenus } from './titleBarMenus.js';
import html from './titleBar.html';

registerComponent('title-bar', html, function(scope) {
    let openMenu = null;

    scope.menuHidden = ({ target: menu }) => {
        menu.classList.remove('menu-active');
        if (openMenu === menu) openMenu = null;
    };

    scope.menuShown = ({ target: menu }) => {
        if (openMenu && openMenu !== menu) openMenu.hide();
        openMenu = menu;
        menu.classList.add('menu-active');
    };

    scope.onMenuEnter = ({ target: button }) => {
        const menu = button.parentNode;
        if (!openMenu || openMenu === menu) return;
        openMenu.hide();
        menu.show();
    };

    scope.toggleMaximize = async () => {
        scope.isMaximized
            ? await Neutralino.window.unmaximize()
            : await Neutralino.window.maximize();
        scope.isMaximized = await Neutralino.window.isMaximized();
    };

    scope.isMaximized = false;
    scope.menus = titleBarMenus;
});
