import hljs from 'highlight.js/lib/core';
import mtg from './hljsMtg.js';

function highlightKeywords(text, customNames) {
    const highlighter = hljs.newInstance();
    highlighter.registerLanguage('mtg', () => mtg(customNames));
    const editor = document.createElement('div');
    editor.innerHTML = highlighter.highlight(text, { language: 'mtg' }).value;
    return [...editor.querySelectorAll('.hljs-keyword')].map(span => span.textContent);
}

describe('Magic keyword syntax highlighting', () => {
    it('highlights multiword, punctuated, and parameterized stock keywords', () => {
        const text = 'first strike, HEXPROOF FROM red, Start your engines!\n'
            + 'I — Chaoscycling {2}. Investigate.';
        expect(highlightKeywords(text)).toEqual([
            'first strike', 'HEXPROOF FROM', 'Start your engines!',
            'Chaoscycling', 'Investigate'
        ]);
    });

    it('matches literal custom names outside reminder text', () => {
        const text = 'Astral shift+, astral shift, écho, Echoic. (Astral shift+)';
        expect(highlightKeywords(text, ['Astral shift+', 'Echo'])).toEqual([
            'Astral shift+'
        ]);
        expect(highlightKeywords(text)).toEqual([]);
    });
});
