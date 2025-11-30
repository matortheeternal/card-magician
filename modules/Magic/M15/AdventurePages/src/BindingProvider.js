import ColoredProvider from '../../Frame/src/providers/ColoredProvider.js';

export default class BindingProvider extends ColoredProvider {
    zIndex = 1;
    get ext() { return '.jpg' }
    get folder() { return 'binding' }
    get maskFolder() {}
}
