import convertSetSymbol from './convertSetSymbol.js';

const squarePart = [
    'part:',
    '\ttype: shape',
    '\tname: Square',
    '\tcombine: overlap',
    '\tpoint:',
    '\t\tposition: (0.2000000000,0.2000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
    '\tpoint:',
    '\t\tposition: (0.2000000000,0.8000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
    '\tpoint:',
    '\t\tposition: (0.8000000000,0.8000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
    '\tpoint:',
    '\t\tposition: (0.8000000000,0.2000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
].join('\n');

const squareSymbol = `mse_version: 0.3.5\n${squarePart}\n`;

describe('convertSetSymbol', () => {
    it('should convert a shape part into set-icon svg', () => {
        const svg = convertSetSymbol(squareSymbol);
        expect(svg).toContain('<svg');
        expect(svg).toContain('class="set-icon"');
        expect(svg).toContain(
            '<path id="layer-1" '
            + 'd="M 20 20 L 20 80 L 80 80 L 80 20 L 20 20 Z" />'
        );
        expect(svg).toContain('<mask id="group-1">');
        expect(svg).toContain('<use href="#layer-1" fill="white" />');
    });

    it('should mask subtracted parts in black', () => {
        const subtracted = squarePart.replace('combine: overlap', 'combine: subtract');
        const svg = convertSetSymbol(
            `mse_version: 0.3.5\n${squarePart}\n${subtracted}\n`
        );
        expect(svg).toContain('<use href="#layer-2" fill="black" />');
        expect(svg).toContain('<use href="#layer-1" fill="white" />');
    });

    it('should start a new group on overlapping parts', () => {
        const svg = convertSetSymbol(
            `mse_version: 0.3.5\n${squarePart}\n${squarePart}\n`
        );
        expect(svg).toContain('<mask id="group-1">');
        expect(svg).toContain('<mask id="group-2">');
    });

    it('should parse bom-prefixed text with space-separated keys', () => {
        const spaced = '﻿mse version: 0.3.5\n'
            + squarePart.replaceAll('line_after', 'line after') + '\n';
        const svg = convertSetSymbol(spaced);
        expect(svg).toContain(
            '<path id="layer-1" '
            + 'd="M 20 20 L 20 80 L 80 80 L 80 20 L 20 20 Z" />'
        );
    });

    it('should throw when the symbol has no parts', () => {
        expect(() => convertSetSymbol('mse_version: 0.3.5\n'))
            .toThrowError('Set symbol has no parts');
    });
});
