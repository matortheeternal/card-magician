import ColoredProvider from '../../Frame/src/providers/ColoredProvider.js';

export default class LeftPageProvider extends ColoredProvider {
    zIndex = 2;

    get ext() { return '.png' }
    get folder() { return 'page/name_and_type' }
    get maskFolder() {}
}
