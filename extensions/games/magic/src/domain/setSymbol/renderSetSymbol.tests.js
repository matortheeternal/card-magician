import { renderSetSymbol } from './renderSetSymbol.js';
import { wideSymbol } from './setSymbol.fixture.js';

function parse(markup) {
    return new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;
}

describe('renderSetSymbol', () => {
    it('renders SVG input without a namespace declaration', () => {
        const svg = parse(renderSetSymbol(
            '<svg viewBox="0 0 20 10"><path fill="black" d="M0 0h20v10H0z"/></svg>'
        ));
        expect(svg.querySelector('path').getAttribute('fill')).toContain('url(#');
        expect(svg.getAttribute('width')).toBe('20');
    });

    it('renders symbols containing elements without SVG style support', () => {
        const source = `<svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 10"><g xmlns="" fill="black" stroke="white">
            <path d="M0 0h20v10H0z"/></g></svg>`;
        const svg = parse(renderSetSymbol(source, 'rare'));
        const group = svg.querySelector('g');
        expect(group.style).toBeUndefined();
        expect(group.getAttribute('fill')).toContain('url(#');
        expect(group.getAttribute('stroke')).toBe('#000000');
        expect(svg.getAttribute('width')).toBe('20');
    });

    it('styles editor geometry without requiring classes or embedded stops', () => {
        const svg = parse(renderSetSymbol(wideSymbol, 'rare'));
        expect(svg.classList.contains('rarity-rare')).toBeTrue();
        expect(svg.querySelector('metadata')).toBeNull();
        expect(svg.querySelector('g').getAttribute('stroke')).toBe('#000000');
        expect(svg.querySelector('g').getAttribute('stroke-width')).toBe('8');
        expect(svg.querySelector('stop').getAttribute('stop-color')).toBe('#876c13');
        expect(svg.querySelectorAll('path')[1].getAttribute('fill')).toBe('none');
        expect(svg.querySelectorAll('path')[1].getAttribute('stroke')).toBe('none');
        expect(svg.getAttribute('width')).toBe('200');
        expect(svg.getAttribute('height')).toBe('100');
    });

    it('keeps implicit default fills painted and masks unchanged', () => {
        const masked = `<svg xmlns="http://www.w3.org/2000/svg"><defs>
            <mask id="m"><path fill="white" d="M0 0h10v10z"/></mask></defs>
            <path mask="url(#m)" d="M0 0h10v10z"/></svg>`;
        const svg = parse(renderSetSymbol(masked));
        expect(svg.getAttribute('fill')).toContain('url(#');
        expect(svg.querySelector('mask path').getAttribute('fill')).toBe('white');
        const maskId = svg.querySelector('mask').id;
        expect(svg.querySelector('svg > path').getAttribute('mask'))
            .toBe(`url(#${maskId})`);
    });

    it('renders the inverted common variant with a light fill and dark outline', () => {
        const svg = parse(renderSetSymbol(wideSymbol, 'invertedCommon'));
        expect(svg.classList.contains('rarity-invertedCommon')).toBeTrue();
        expect(svg.querySelector('g').getAttribute('stroke')).toBe('#000000');
        expect(svg.querySelector('stop').getAttribute('stop-color')).toBe('#ffffff');
    });

    it('isolates gradient IDs across rendered copies', () => {
        const common = parse(renderSetSymbol(wideSymbol));
        const rare = parse(renderSetSymbol(wideSymbol, 'rare'));
        const gradientId = rare.querySelector('linearGradient').id;
        expect(common.querySelector('linearGradient').id).not.toBe(gradientId);
        expect(rare.querySelector('g').getAttribute('fill'))
            .toBe(`url(#${gradientId})`);
    });

    it('handles inline paint and removes unsafe attributes', () => {
        const unsafe = `<svg xmlns="http://www.w3.org/2000/svg">
            <path style="fill:red;stroke:blue" onclick="alert(1)"/></svg>`;
        const svg = parse(renderSetSymbol(unsafe, 'uncommon'));
        expect(svg.querySelector('path').getAttribute('fill')).toContain('url(#');
        expect(svg.querySelector('path').style.fill).toBe('');
        expect(svg.querySelector('[onclick]')).toBeNull();
        expect(renderSetSymbol('')).toBe('');
    });

    it('colors masked symbols and filter outlines', () => {
        const source = `<svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"><defs>
            <mask id="shape"><path fill="white" d="M20 20h60v60H20z"/></mask>
            <filter id="outline"><feFlood flood-color="white"/></filter></defs>
            <rect width="100" height="100" fill="black"
                mask="url(#shape)" filter="url(#outline)"/></svg>`;
        const svg = parse(renderSetSymbol(source, 'rare'));
        const gradient = svg.querySelector('linearGradient');
        expect(svg.querySelectorAll('linearGradient').length).toBe(1);
        expect(svg.querySelector('rect').getAttribute('fill'))
            .toBe(`url(#${gradient.id})`);
        expect(gradient.querySelector('stop').getAttribute('stop-color'))
            .toBe('#876c13');
        expect(svg.querySelector('feFlood').getAttribute('flood-color'))
            .toBe('#000000');
        expect(svg.querySelector('mask path').getAttribute('fill')).toBe('white');
    });
});
