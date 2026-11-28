import MagicSymbols from './MagicSymbols.js';

describe('Magic game symbols', () => {
    const symbols = new MagicSymbols({
        resolveAsset: path => `games/magic/assets/${path}`
    });

    it('installs bound symbol methods without adding them to saved data', () => {
        const face = {};
        symbols.initializeCardFace(face);
        const parsed = face.parseSymbols('{W}{2}', false);
        expect(parsed.map(symbol => symbol.raw)).toEqual(['W', '2']);
        expect(face.symbolsToHTML(parsed, true))
            .toContain('games/magic/assets/symbols/tall/single/w.png');
        expect(face.resolveColorSymbolIcon('w'))
            .toBe('/games/magic/assets/symbols/flat/single/w.png');
        expect({ ...face }).toEqual({});
        symbols.initializeCardFace(face);
        expect(face.parseSymbols('{T}')[0].type).toBe('tap');
    });

    it('preserves authored order when requested and otherwise orders costs', () => {
        const text = '{G}{2}{W}';
        expect(symbols.parseSymbols(text, false).map(symbol => symbol.raw))
            .toEqual(['G', '2', 'W']);
        expect(symbols.parseSymbols(text).map(symbol => symbol.raw))
            .toEqual(['2', 'G', 'W']);
    });

    it('renders cost and ability symbols from game assets in both sizes', () => {
        const parsed = symbols.parseSymbols('{2}{W/U}{T}{Q}');
        for (const [useTall, size] of [[false, 'flat'], [true, 'tall']]) {
            const html = symbols.symbolsToHTML(parsed, useTall);
            for (const path of ['num/2', 'hybrid2/wu', 'tap/t', 'tap/q'])
                expect(html).toContain(`games/magic/assets/symbols/${size}/${path}.png`);
            expect(html).toContain('class="sym oversized"');
        }
    });

    it('preserves the circle fallback for single-character symbols', () => {
        const html = symbols.symbolsToHTML([
            { type: 'custom', raw: 'a', colors: [] }
        ]);
        expect(html).toContain('games/magic/assets/symbols/flat/circle.png');
        expect(html).toContain('>A</abbr>');
    });

    it('uses individual icons for multicolor cards and one for hybrid mana', () => {
        const paths = cost => symbols.cardColorIcons({ front: { manaCost: cost } });
        const root = '/games/magic/assets/symbols/flat';
        const whiteBlue = [`${root}/single/w.png`, `${root}/single/u.png`];
        expect(paths('{U}{W}')).toEqual(whiteBlue);
        expect(paths('{W/U}{W/U}')).toEqual([`${root}/hybrid2/wu.png`]);
        expect(paths('{W/U}{W}')).toEqual(whiteBlue);
        expect(paths('{2/W}')).toEqual([`${root}/hybrid2/2w.png`]);
        expect(paths('{C/W}')).toEqual([`${root}/hybrid2/cw.png`]);
        expect(paths('{3}')).toEqual([`${root}/single/c.png`]);
    });

    it('resolves statistics icons without a cardpart dependency', () => {
        for (const color of ['w', 'u', 'b', 'r', 'g', 'c']) {
            expect(symbols.resolveColorSymbolIcon(color)).toBe(
                `/games/magic/assets/symbols/flat/single/${color}.png`
            );
        }
        expect(symbols.resolveColorSymbolIcon('m'))
            .toBe('/games/magic/assets/multicolor.svg');
    });
});
