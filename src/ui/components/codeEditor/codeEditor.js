import { CodeJar } from 'codejar';
import { emit } from '../../../shared/htmlUtils.js';
import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('javascript', javascript);

function fixYAML(editor) {
    const stringSpans = editor.querySelectorAll('.hljs-string');
    stringSpans.forEach(stringSpan => {
        const next = stringSpan.nextSibling;
        if (!next) return;
        if (next.nodeType !== Node.TEXT_NODE && next.textContent === ':') {
            stringSpan.className = 'hljs-attr';
            stringSpan.textContent = stringSpan.textContent + ':';
            next.remove();
        }
    });
}

class CodeEditor extends HTMLElement {
    #jar = null;
    #value = '';

    connectedCallback() {
        this.render();
        this.bind();
    }

    set value(newValue) {
        this.#value = newValue;
        if (this.#jar) this.#jar.updateCode(newValue);
    }

    get value() {
        return this.#value;
    }

    get syntax() {
        const syntaxKey = this.getAttribute('syntax') || 'text';
        return function(editor) {
            if (!hljs.listLanguages().includes(syntaxKey)) return;
            const code = editor.textContent;
            editor.innerHTML = hljs.highlight(code, { language: syntaxKey }).value;
            if (syntaxKey === 'yaml') fixYAML(editor);
        }
    }

    bind() {
        this.#jar.onUpdate(code => {
            this.#value = code;
            emit(this, 'code-change', { value: this.#value });
        });
    }

    render() {
        const editor = document.createElement('pre');
        editor.classList.add('codejar-editor');
        this.appendChild(editor);
        this.#jar = CodeJar(editor, this.syntax, {
            tab: '    ',
            spellcheck: false
        });
    }
}

customElements.define('cm-code-editor', CodeEditor);
