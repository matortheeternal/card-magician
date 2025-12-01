import ColoredProvider from '../../Frame/src/providers/ColoredProvider.js';

export default class RightPageProvider extends ColoredProvider {
    zIndex = 2;

    get ext() { return '.png' }
    get folder() { return 'page/blank' }
    get maskFolder() {}
    get useParentColor() { return true }
}
