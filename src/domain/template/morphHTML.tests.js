import { morphHTML } from './morphHTML.js';

describe('morphHTML strategy dispatch', () => {
    it('updates text and attributes while preserving matching element identity', () => {
        const root = document.createElement('div');
        root.innerHTML = '<button class="old" disabled>Before</button>';
        const button = root.firstChild;
        const text = button.firstChild;
        const clicked = jasmine.createSpy('click');
        button.addEventListener('click', clicked);
        const mutated = jasmine.createSpy('mutated');
        button.addEventListener('dom-morphed', mutated);

        morphHTML(root, '<button class="new">After</button>');

        expect(root.firstChild).toBe(button);
        expect(button.firstChild).toBe(text);
        expect(text.textContent).toBe('After');
        expect(button.className).toBe('new');
        expect(button.hasAttribute('disabled')).toBeFalse();
        expect(mutated).toHaveBeenCalledTimes(1);
        button.click();
        expect(clicked).toHaveBeenCalledTimes(1);
    });

    it('replaces incompatible nodes before applying text or element updates', () => {
        const root = document.createElement('div');
        root.innerHTML = '<span>Old</span>Tail';
        const original = root.firstChild;
        morphHTML(root, '<strong>New</strong><em>More</em>');
        expect(root.innerHTML).toBe('<strong>New</strong><em>More</em>');
        expect(root.firstChild).not.toBe(original);
    });

    it('appends missing nodes and removes trailing nodes from the original list', () => {
        const root = document.createElement('div');
        morphHTML(root, '<i>1</i><i>2</i><i>3</i>');
        const first = root.firstChild;
        morphHTML(root, '<i>Kept</i>');
        expect(root.childNodes.length).toBe(1);
        expect(root.firstChild).toBe(first);
        expect(root.textContent).toBe('Kept');
        morphHTML(root, '');
        expect(root.childNodes.length).toBe(0);
    });

    it('does not emit mutation events for unchanged nodes', () => {
        const root = document.createElement('div');
        root.innerHTML = '<span>Same</span><!-- comment -->';
        const mutated = jasmine.createSpy('mutated');
        root.firstChild.addEventListener('dom-morphed', mutated);
        morphHTML(root, root.innerHTML);
        expect(mutated).not.toHaveBeenCalled();
    });
});
