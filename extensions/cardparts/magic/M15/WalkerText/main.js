import TextModule from '../Text/main.js';
import { AbilityConverter } from './src/AbilityConverter.js';

const ABILITY_SELECTOR = 'div.walker-ability, div.walker-static-ability';

function sameRects(rects, previousRects) {
    return JSON.stringify(rects) === JSON.stringify(previousRects);
}

export default class WalkerText extends TextModule {
    async init(card) {
        await super.init(card);
        this.onTextResize = this.onTextResize.debounce(100);
    }

    get structureConverters() {
        return [AbilityConverter];
    }

    getAbilityRects(textElement) {
        const abilities = textElement.querySelectorAll(ABILITY_SELECTOR);
        return Array.from(abilities).map(ability => {
            const rect = this.getCardClientRect(ability);
            return { top: Math.round(rect.top), height: Math.round(rect.height) };
        });
    }

    onTextResize(event) {
        const abilityRects = this.getAbilityRects(event.detail);
        if (sameRects(abilityRects, this.card.abilityRects)) return;
        this.card.abilityCount = abilityRects.length;
        this.card.abilityRects = abilityRects;
        changed(this.card, 'abilityRects');
    }

    bind(card, watch) {
        super.bind(card, watch);
        card.dom.root.addEventListener('text-resized', event => {
            this.onTextResize(event);
        });
    }

    async styles() {
        return [];
    }
}
