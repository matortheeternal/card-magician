import './AutoFitLine.js';

describe('AutoFit maximum font size', () => {
    let container, line;

    beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = '<style>'
            + 'auto-fit-line { font-size: 20px; }'
            + '.large auto-fit-line { font-size: 24.5px; }'
            + '</style><auto-fit-line>Name</auto-fit-line>';
        line = container.querySelector('auto-fit-line');
        document.body.appendChild(container);
    });

    afterEach(() => container.remove());

    it('reads CSS applied after the element connected', () => {
        container.classList.add('large');
        expect(line.maxFont).toBe(24.5);
    });

    it('ignores the font size it set while fitting', () => {
        line.style.fontSize = '10px';
        expect(line.maxFont).toBe(20);
    });

    it('prefers the max attribute over CSS', () => {
        line.setAttribute('max', '16');
        expect(line.maxFont).toBe(16);
        line.removeAttribute('max');
        expect(line.maxFont).toBe(20);
    });
});
