import ColorResolver from '../../Frame/src/resolvers/ColorResolver.js';
import ColoredProvider from '../../Frame/src/providers/ColoredProvider.js';

export default class ParentColorResolver extends ColorResolver {
    static matches(card, provider) {
        return provider instanceof ColoredProvider
            && provider.useParentColor;
    }
}
