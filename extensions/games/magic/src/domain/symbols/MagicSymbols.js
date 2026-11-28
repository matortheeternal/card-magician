import { ActivationCost, ManaCost } from 'mana-scribe';
import ColorIdentity from '../ColorIdentity.js';
import { getCardFaces } from '../oracleCardEligibility.js';
import { getKey, symbolToHTML } from './symbolToHTML.js';

function colorProfile(face) {
    const manaCost = ManaCost.parse(face.manaCost?.toString() ?? '');
    const identity = ColorIdentity.fromCardFace({ ...face, manaCost });
    return { identity, manaCost };
}

const HYBRID_PREFIX = {
    twoColorHybridMana: '',
    genericHybridMana: '2',
    colorlessHybridMana: 'c'
};

function hybridIconKey(profiles, colors) {
    if (!colors.length) return null;
    const sources = profiles.flatMap(({ identity }) => identity.colors);
    if (!sources.every(({ sources }) => sources.hybrid && !sources.normal)) return null;
    const symbols = profiles.flatMap(({ manaCost }) => manaCost.symbols);
    const key = colors.join('');
    const match = symbols.find(symbol =>
        Object.hasOwn(HYBRID_PREFIX, symbol.type) && getKey(symbol) === key);
    return match ? HYBRID_PREFIX[match.type] + key : null;
}

export default class MagicSymbols {
    constructor(game) {
        this.game = game;
    }

    initializeCardFace(face) {
        const methods = ['parseSymbols', 'symbolsToHTML', 'resolveColorSymbolIcon'];
        for (const name of methods) {
            Object.defineProperty(face, name, {
                value: this[name].bind(this),
                writable: true,
                configurable: true
            });
        }
    }

    parseSymbols(str, ordered = true) {
        const cost = ActivationCost.parse(str);
        return ordered ? cost.orderedSymbols : cost.symbols;
    }

    symbolsToHTML(symbols, useTall = false) {
        const size = useTall ? 'tall' : 'flat';
        return symbols.map(sym => symbolToHTML(this.game, sym, size)).join('');
    }

    cardColorIcons(card) {
        const faces = getCardFaces(card).flatMap(face =>
            [face, face.top, face.bottom, face.adventure].filter(Boolean));
        const profiles = faces.map(colorProfile);
        const colors = new Set(profiles.flatMap(({ identity }) =>
            identity.colors.map(color => color.char)));
        const ordered = [...'wubrg'].filter(color => colors.has(color));
        const hybrid = hybridIconKey(profiles, ordered);
        if (hybrid) {
            const asset = `symbols/flat/hybrid2/${hybrid}.png`;
            return ['/' + this.game.resolveAsset(asset)];
        }
        return (ordered.length ? ordered : ['c'])
            .map(color => this.resolveColorSymbolIcon(color));
    }

    resolveColorSymbolIcon(colorId) {
        if (colorId === 'm') return '/' + this.game.resolveAsset('multicolor.svg');
        return '/' + this.game.resolveAsset(`symbols/flat/single/${colorId}.png`);
    }
}
