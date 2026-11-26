import FieldComponent from './FieldComponent.js';
import { CodeJar } from 'codejar';
import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import { registerField } from '../../systems/fieldComponentRegistry.js';

hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('js', javascript);

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
    jar = null;

    static matches(field) {
        return field.type === 'code';
    }

    get rulesAssistance() {
        if (this.field.id !== 'rulesText' || this.field.syntax !== 'mtg') return null;
        return window.activeGame?.oracleAssistance;
    }

    get editor() {
        return this.querySelector('.codejar-editor');
    }

    get syntax() {
        const syntaxKey = this.field.syntax || 'plaintext';
        return editor => {
            if (!hljs.listLanguages().includes(syntaxKey)) return;
            const code = editor.textContent;
            editor.innerHTML = hljs.highlight(code, { language: syntaxKey }).value;
            if (syntaxKey === 'yaml') fixYAML(editor);
            if (window.activeGame?.config?.get('highlightUnrecognizedRules'))
                this.rulesAssistance?.highlightRules(editor, this.model);
        };
    }

    get addClosing() {
        return this.field.syntax !== 'mtg'
            && this.field.syntax !== 'plaintext'
            && this.field.syntax?.length;
    }

    bind() {
        this.jar.onUpdate(code => this.onChange(code));
        const assistance = this.rulesAssistance;
        const config = window.activeGame?.config;
        if (!assistance || !config) return;
        const refresh = () => this.refreshHighlighting();
        this.watch('rules-diagnostics', config, 'highlightUnrecognizedRules', refresh);
        const { definitionFields } = assistance;
        if (window.activeProject && definitionFields?.length) {
            this.watch('rules-definitions', window.activeProject, definitionFields,
                       refresh);
        }
        this.watch('rules-metadata', this.model, assistance.faceFields, refresh);
        this.watchEligibility(assistance, refresh);
    }

    watchEligibility(assistance, refresh) {
        const faces = assistance.getRulesCardFaces?.(this.model) ?? [];
        for (const [index, face] of faces.entries()) {
            if (face === this.model) continue;
            this.watch(`rules-eligibility-${index}`, face, assistance.eligibilityFields,
                       refresh);
        }
    }

    refreshHighlighting() {
        const editor = this.editor;
        const position = editor.matches(':focus') ? this.jar.save() : null;
        this.syntax(editor);
        if (position) this.jar.restore(position);
    }

    inputValue(value) {
        this.jar.updateCode(value);
        this.onChange(value);
    }

    loadValue() {
        if (this.jar.toString() === this.value) return;
        this.jar.updateCode(this.value);
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
        const editor = document.createElement('div');
        editor.classList.add('codejar-editor');
        editor.classList.add(`language-${this.field.syntax || 'plaintext'}`);
        this.appendChild(editor);
        this.jar = CodeJar(editor, this.syntax, {
            addClosing: this.addClosing,
            tab: '    ',
            spellcheck: false
        });
        this.loadValue();
    }

    async getChangedValue(code) {
        return code;
    }
}

registerField(CodeField);
