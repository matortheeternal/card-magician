import setInfoFields from './ui/setInfoModal/setInfoFields.js';
import MagicCard from './MagicCard.js';
import { autoNumberCards } from './domain/autoNumber.js';

const SET_FILE_VERSION = 1;

export default class MagicProject extends CardMagicianProject {
    constructor(data = {}) {
        const info = activeGame.initializeFields(setInfoFields);
        super({
            game: 'magic',
            version: SET_FILE_VERSION,
            defaultBackImage: activeGame.resolveAsset('back.png'),
            ...info,
            ...data
        });
    }

    async loadCard(filePath) {
        return MagicCard.load(filePath);
    }

    async afterLoad() {
        this.updateNumbering();
    }

    updateNumbering() {
        autoNumberCards(this);
    }
}
