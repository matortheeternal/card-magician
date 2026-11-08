import CssValueParser from './CssValueParser.js';

function split(css) {
    return new CssValueParser(css, char => char === ',').parse();
}

describe('CssValueParser', () => {
    it('keeps quoted commas and nested function arguments in their layer', () => {
        expect(split('url("a,b.svg"), rgb(1, 2, 3), fn(inner(1, 2), 3)'))
            .toEqual(['url("a,b.svg")', 'rgb(1, 2, 3)', 'fn(inner(1, 2), 3)']);
    });

    it('honors escaped quote and backslash characters', () => {
        const css = String.raw`url("a\",b\\c.svg"), red`;
        expect(split(css)).toEqual([String.raw`url("a\",b\\c.svg")`, 'red']);
    });

    it('splits whitespace only outside quotes and parentheses', () => {
        const parser = new CssValueParser(
            '  calc(100% - 20px) "two words"  auto ', char => /\s/.test(char)
        );
        expect(parser.parse()).toEqual(['calc(100% - 20px)', '"two words"', 'auto']);
    });

    it('drops empty layers while retaining unmatched quoted input', () => {
        expect(split(', , red,,')).toEqual(['red']);
        expect(split('"unfinished,a')).toEqual(['"unfinished,a']);
        expect(split('')).toEqual([]);
    });
});
