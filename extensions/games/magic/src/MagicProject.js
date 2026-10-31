import setInfoFields from './ui/settings/setInfoFields.js';
import MagicCard from './MagicCard.js';
import { autoNumberCards } from './domain/autoNumber.js';
import defaultPackStructure from './domain/defaultPackStructure.js';

const SET_FILE_VERSION = 1;

export default class MagicProject extends CardMagicianProject {
    constructor(data = {}) {
        const info = activeGame.initializeFields(setInfoFields);
        super({
            game: 'magic',
            version: SET_FILE_VERSION,
            defaultBackImage: activeGame.resolveAsset('back.png'),
            pack: defaultPackStructure(),
            ...info,
            ...data
        });
    }

    async loadCard(filePath) {
        return await MagicCard.load(filePath);
    }

    async afterLoad() {
        this.updateNumbering();
    }

    updateNumbering() {
        autoNumberCards(this);
    }
}
