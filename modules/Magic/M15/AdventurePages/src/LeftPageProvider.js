import ColoredProvider from '../../Frame/src/providers/ColoredProvider.js';

export default class LeftPageProvider extends ColoredProvider {
    zIndex = 2;

    get ext() { return '.png' }
    get folder() {
        const parentCard = this.card.parent();
        const pageFolder = parentCard.frame.spotlight
            ? 'spotlight'
            : this.card.pageStyle;
        return `page/${pageFolder}`;
    }
    get maskFolder() {}
}
