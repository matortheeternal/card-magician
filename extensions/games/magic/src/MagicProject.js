import setInfoFields from './ui/settings/setInfoFields.js';
import MagicCard from './MagicCard.js';
import { autoNumberCards } from './domain/autoNumber.js';
import defaultPackStructure from './domain/defaultPackStructure.js';

const SET_FILE_VERSION = 1;
const LEGACY_EDITOR_SETTINGS = ['suggestOracleTags', 'highlightUnrecognizedRules'];

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

    async editSetSymbol() {
        const executable = activeGame.config.get('setIconEditorPath', '');
        if (!executable) return super.editSetSymbol();
        if (!this.symbolPath) {
            await dialog.alert('You must save the project first.');
            return;
        }
        try {
            await activeGame.platform.openSvgEditor(executable, this.symbolPath);
        } catch (error) {
            await dialog.alert(
                `Could not open Set Icon Editor: ${error.message}. `
                + 'Check its path in Settings → Magic → Set Icon Editor.'
            );
        }
    }

    async loadCard(filePath) {
        const card = await MagicCard.load(filePath);
        card.updateKeywords(this);
        return card;
    }

    updateCardKeywords() {
        for (const card of this.cards) card.updateKeywords(this);
        changed(this, 'cards');
    }

    async afterLoad() {
        this.updateNumbering();
        for (const key of LEGACY_EDITOR_SETTINGS) {
            if (typeof this[key] !== 'boolean') continue;
            await activeGame.config.set(key, this[key], { onlyIfUnset: true });
            delete this[key];
        }
    }

    afterCardsChanged() {
        this.updateNumbering();
    }

    updateNumbering() {
        autoNumberCards(this);
    }
}
