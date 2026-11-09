import { isLand } from './cardTraits/cardTypes.js';
import { ActivationCost } from 'mana-scribe';

const MANA_SYMBOL_PATTERN = /{(.+?)}/g;

const colorNames = {
    w: 'white',
    u: 'blue',
    b: 'black',
    r: 'red',
    g: 'green',
};

function addColor(colors, colorCharacter, sourceKey = 'normal') {
    const char = colorCharacter.toLowerCase();
    if (!Object.hasOwn(colors, char)) {
        colors[char] = {
            char,
            name: colorNames[char],
            sources: {}
        };
    }

    colors[char].sources[sourceKey] = true;
}

export default class ColorIdentity {
    constructor() {
        this.colorSources = {};
        this.override = null;
        this.colors = [];
    }

    getColorsFromSources() {
        const colors = {};
        Object.values(this.colorSources).forEach(src => {
            if (src.commanderOnly) return;
            src.symbols.forEach(sym => {
                if (!sym.colors.length) return;
                const sourceKey = sym.hybrid ? 'hybrid' : 'normal';
                sym.colors.forEach(c => addColor(colors, c, sourceKey));
            });
        });
        return colors;
    }

    getColorsFromOverride() {
        const colors = {};
        this.override.split('').forEach(char => {
            if (!colorNames[char]) return;
            addColor(colors, char, 'override');
        });
        return colors;
    }

    getColors() {
        const colors = this.override
            ? this.getColorsFromOverride()
            : this.getColorsFromSources();
        return 'wubrg'.split('').reduce((acc, c) => {
            if (colors[c]) acc.push(colors[c]);
            return acc;
        }, []);
    }

    addColorSource(key, symbols, commanderOnly = false) {
        this.colorSources[key] = {
            commanderOnly,
            symbols
        };
        this.colors = this.getColors();
    }

    setOverride(str) {
        this.override = str && str.length ? str : null;
        this.colors = this.getColors();
    }

    isColorless() {
        if (this.override && this.override.includes('c')) return true;
        return this.colors.length === 0;
    }

    isMulticolor() {
        if (this.override && this.override.includes('m')) return true;
        return (this.colors.length > 2) || (
            (this.colors.length === 2)
            && !this.isHybrid()
        );
    }

    isHybrid() {
        if (this.override && this.override.includes('h')) return true;
        return (this.colors.length === 2)
            && this.colors.every(c => c.sources.hybrid && !c.sources.normal);
    }

    isLand() {
        return this.override && this.override.includes('l');
    }

    isArtifact() {
        return this.override && this.override.includes('a');
    }
}

function getTextSymbols(rulesText) {
    const symbols = [];
    for (const match of rulesText.matchAll(MANA_SYMBOL_PATTERN)) {
        const cost = ActivationCost.parse(match[1]);
        symbols.push(...cost.symbols);
    }
    return symbols;
}

export function getCardFaceColors(cardFace) {
    const colorIdentity = new ColorIdentity();
    if (cardFace.manaCost)
        colorIdentity.addColorSource('card', cardFace.manaCost.symbols);
    if (cardFace.colorOverride)
        colorIdentity.setOverride(cardFace.colorOverride.join(''));
    if (cardFace.rulesText && isLand(cardFace))
        colorIdentity.addColorSource('text', getTextSymbols(cardFace.rulesText));
    return colorIdentity.getColors();
}
