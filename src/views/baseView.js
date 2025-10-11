import { menuBarItems, menuEvents } from './menuBarItems';

export function loadViewData() {
    Object.assign(view, {
        ...menuEvents,
        toggleMaximize: async () => {
            view.isMaximized
                ? await Neutralino.window.unmaximize()
                : await Neutralino.window.maximize();
            view.isMaximized = await Neutralino.window.isMaximized();
        },
        menuBarItems,
        isMaximized: false
    });
}
