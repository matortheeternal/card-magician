import FieldComponent from './FieldComponent.js';
import { CodeJar } from 'codejar';
import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import { registerField } from '../../systems/fieldComponentRegistry.js';

hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('xml', xml);
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

export default class CodeField extends FieldComponent {
    static tagName = 'cm-code';
    #jar = null;

    static matches(field) {
        return field.type === 'code';
    }

    get syntax() {
        const syntaxKey = this.field.syntax || 'plaintext';
        return function(editor) {
            if (!hljs.listLanguages().includes(syntaxKey)) return;
            const code = editor.textContent;
            editor.innerHTML = hljs.highlight(code, { language: syntaxKey }).value;
            if (syntaxKey === 'yaml') fixYAML(editor);
        }
    }

    bind() {
        this.#jar.onUpdate(this.onChange);
    }

    loadValue() {
        this.#jar.updateCode(this.value);
    }

    renderLabel() {
        if (!this.field.label) return;
        const labelElement = document.createElement('div');
        labelElement.className = 'field-label';
        labelElement.textContent = this.field.label;
        this.appendChild(labelElement);
    }

    render() {
        if (!this.model || !this.field) return;
        this.innerHTML = '';
        this.renderLabel();
        const editor = document.createElement('pre');
        editor.classList.add('codejar-editor');
        this.appendChild(editor);
        this.#jar = CodeJar(editor, this.syntax, {
            tab: '    ',
            spellcheck: false
        });
    }

    async getChangedValue(code) {
        return code;
    }
}

registerField(CodeField);
