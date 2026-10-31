import TextModule from '../Text/main.js';
import { AbilityConverter } from './src/AbilityConverter.js';

export default class WalkerText extends TextModule {
    async init(card) {
        await super.init(card);
        this.onTextResize = this.onTextResize.debounce(100);
    }

    get structureConverters() {
        return [AbilityConverter];
    }

    onTextResize(event) {
        const selector = 'div.walker-ability, div.walker-static-ability';
        const abilities = event.detail.querySelectorAll(selector);
        this.card.abilityCount = abilities.length;
        this.card.abilityRects = Array.from(abilities).map(ability => {
            const rect = this.getCardClientRect(ability);
            return { top: Math.round(rect.top), height: Math.round(rect.height) };
        });
        changed(this.card, 'abilityRects');
    }

    bind(card, watch) {
        super.bind(card, watch);
        card.dom.root.addEventListener('text-resized', event => {
            this.onTextResize(event);
        });
    }

    async styles() {
        return [
            await this.loadFile('style.css'),
        ];
    }
}
