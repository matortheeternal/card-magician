import convertSetSymbol from './convertSetSymbol.js';

import { squarePart, squareSymbol } from
    '../../../../shared/testing/squareSymbol.fixture.js';

describe('convertSetSymbol', () => {
    it('should convert a shape part into set-icon svg', () => {
        const svg = convertSetSymbol(squareSymbol);
        expect(svg).toContain('<svg');
        expect(svg).not.toContain('linearGradient');
        expect(svg).not.toContain('class="set-icon"');
        expect(svg).toContain('fill="black"');
        expect(svg).toContain(
            '<path fill="white" '
            + 'd="M 20 20 L 20 80 L 80 80 L 80 20 L 20 20 Z" />'
        );
        expect(svg).toContain('<mask id="group-1">');
        expect(svg).not.toContain('<use');
    });

    it('should mask subtracted parts in black', () => {
        const subtracted = squarePart.replace('combine: overlap', 'combine: subtract');
        const svg = convertSetSymbol(
            `mse_version: 0.3.5\n${squarePart}\n${subtracted}\n`
        );
        const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
        const colors = [...doc.querySelectorAll('mask path')].map(path => {
            return path.getAttribute('fill');
        });
        expect(colors).toContain('white');
        expect(colors).toContain('black');
        expect(svg).not.toContain('<use');
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
            '<path fill="white" '
            + 'd="M 20 20 L 20 80 L 80 80 L 80 20 L 20 20 Z" />'
        );
    });

    it('exports resolvable mask and outline references without rarity styling', () => {
        const markup = convertSetSymbol(squareSymbol);
        const svg = new DOMParser().parseFromString(markup, 'image/svg+xml');
        const shape = svg.querySelector('rect');
        const group = shape.parentElement;
        expect(shape.getAttribute('mask'))
            .toBe(`url(#${svg.querySelector('mask').id})`);
        expect(group.getAttribute('filter'))
            .toBe(`url(#${svg.querySelector('filter').id})`);
        expect(svg.querySelector('mask path').getAttribute('fill')).toBe('white');
        expect(svg.querySelector('feFlood').getAttribute('flood-color')).toBe('white');
        expect(shape.getAttribute('fill')).toBe('black');
        expect(svg.querySelector('linearGradient')).toBeNull();
    });

    it('should throw when the symbol has no parts', () => {
        expect(() => convertSetSymbol('mse_version: 0.3.5\n'))
            .toThrowError('Set symbol has no parts');
    });
});
