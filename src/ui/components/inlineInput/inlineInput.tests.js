import InlineInput from './inlineInput.js';
import css from './inlineInput.css';

describe('InlineInput layout', () => {
    let container, element, style;
    const paint = () => new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
    });
    const expectFullWidth = () => {
        const mirrorWidth = element.mirrorElement.offsetWidth;
        expect(mirrorWidth).toBeGreaterThan(0);
        expect(element.inputElement.getBoundingClientRect().width)
            .toBeGreaterThanOrEqual(mirrorWidth);
        expect(parseFloat(element.inputElement.style.width)).toBe(mirrorWidth);
    };

    beforeEach(() => {
        style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        container = document.createElement('div');
        container.style.font = '16px monospace';
        element = new InlineInput();
        element.value = '2048';
        container.appendChild(element);
    });

    afterEach(() => {
        container.remove();
        style.remove();
    });

    it('resizes after an initially hidden ancestor becomes visible', async () => {
        container.style.display = 'none';
        document.body.appendChild(container);
        await paint();
        expect(element.mirrorElement.offsetWidth).toBe(0);
        container.style.display = '';
        await paint();
        expect(element.value).toBe('2048');
        expectFullWidth();
    });

    it('resizes values updated while an existing input is hidden', async () => {
        document.body.appendChild(container);
        await paint();
        container.style.display = 'none';
        element.value = '123456';
        await paint();
        container.style.display = '';
        await paint();
        expectFullWidth();
    });

    it('grows and shrinks as the user edits the input', async () => {
        document.body.appendChild(container);
        await paint();
        for (const value of ['123456', '12', '']) {
            element.inputElement.value = value;
            element.inputElement.dispatchEvent(new Event('input'));
            await paint();
            expect(element.value).toBe(value);
            if (value) {
                expectFullWidth();
                continue;
            }
            expect(element.inputElement.getBoundingClientRect().width)
                .toBeGreaterThan(0);
        }
    });

    it('resizes when font metrics change without changing the value', async () => {
        document.body.appendChild(container);
        await paint();
        const width = element.inputElement.getBoundingClientRect().width;
        container.style.fontSize = '32px';
        await paint();
        expectFullWidth();
        expect(element.inputElement.getBoundingClientRect().width)
            .toBeGreaterThan(width);
    });

    it('resumes sizing after disconnecting and reconnecting', async () => {
        document.body.appendChild(container);
        await paint();
        container.remove();
        element.value = '123456';
        container.style.display = 'none';
        document.body.appendChild(container);
        await paint();
        container.style.display = '';
        await paint();
        expectFullWidth();
    });
});
