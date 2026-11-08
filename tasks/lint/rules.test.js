import { RuleTester, ESLint } from 'eslint';
import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import regex from './regex-at-module-scope.js';
import jsdoc from './jsdoc-syntax.js';
import complexity from './complexity.js';

const ELSE_DIAGNOSTIC = /AGENTS 2.2.*return/;
const SWITCH_DIAGNOSTIC = /AGENTS 2.3.*registry/;

RuleTester.describe = describe;
RuleTester.it = it;
const tester = new RuleTester();

tester.run('complexity', complexity, {
    valid: [
        { code: 'function f(x) { return x?.a?.b?.()?.c; }', options: [1] },
        { code: 'function f() { function g(x) { if (x) return; } }', options: [2] },
        { code: 'const x = a && b && c;', options: [1] },
        { code: 'class C { x = a?.b?.c; }', options: [1] },
        { code: 'function f(x) { switch (x) { default: return; } }', options: [1] }
    ],
    invalid: [
        { code: 'function f(x) { if (x) return 1; return 2; }', options: [1],
            errors: [{ messageId: 'complex', data: { name: 'f', count: 2, max: 1 } }] },
        { code: 'const f = (x = 1) => x && 2 || 3;', options: [3],
            errors: [{ messageId: 'complex' }] },
        { code: 'function f(x) { x ??= 1; return x ? 2 : 3; }', options: [2],
            errors: [{ messageId: 'complex' }] },
        { code: 'function f(xs) { for (const x of xs) { while (x) break; } }',
            options: [2], errors: [{ messageId: 'complex' }] },
        { code: 'function f() { try { run(); } catch { recover(); } }',
            options: [1], errors: [{ messageId: 'complex' }] },
        { code: 'function f(x) { switch (x) { case 1: return; default: return; } }',
            options: [1], errors: [{ messageId: 'complex' }] },
        { code: 'class C { x = a && b && c; }', options: [2],
            errors: [{ messageId: 'complex' }] },
        { code: 'class C { static { if (ready) run(); } }', options: [1],
            errors: [{ messageId: 'complex' }] }
    ]
});

tester.run('regex-at-module-scope', regex, {
    valid: [
        'const WORD = /word/gu; function parse(x) { return WORD.test(x); }',
        'export const WORD = /word/;',
        'const WORD = new RegExp("word", "i");',
        'const WORD = RegExp(`word`);',
        'function parse(pattern) { return new RegExp(pattern); }',
        `const patterns = words.map(word => new RegExp(\`a\${word}\`));`,
        'function f(RegExp) { return () => () => new RegExp("x"); }',
        'const RegExp = factory; function f() { return RegExp("x"); }',
        'function f() { return library.RegExp("x"); }',
        'function f(x) { return x.replace(/&/g, "&amp;"); }',
        'function f(x) { return new RegExp("abc").test(x); }',
        'function f(x) { return /^\\s/.test(x); }'
    ],
    invalid: [
        { code: 'function f(x) { return /word/.test(x); }',
            errors: [{ messageId: 'placement', line: 1, column: 24 }] },
        { code: 'function f() { const WORD = /word/; }',
            errors: [{ messageId: 'placement' }] },
        { code: 'const patterns = { word: /word/ };',
            errors: [{ messageId: 'placement' }] },
        { code: 'class Parser { pattern = /word/; }',
            errors: [{ messageId: 'placement' }] },
        { code: 'function f() { return new RegExp("word", "i"); }',
            errors: [{ messageId: 'placement' }] },
        { code: 'function f() { return RegExp(`word`); }',
            errors: [{ messageId: 'placement' }] }
    ]
});

tester.run('jsdoc-syntax', jsdoc, {
    valid: [
        'function undocumented() {}',
        '// import("module") is ordinary commentary.\nconst x = 1;',
        '/* Description only. */ function f() {}',
        '/**\n * @type {CardMagicianGame}\n */\nlet game;',
        '/** @type {CardMagicianGame} */ let game;',
        '/** @type {number} */ export const count = 1;',
        'class C { /** @type {number} */ count = 1; }',
        'const c = { /** @type {number} */ count: 1 };',
        'class C { constructor() { /** @type {number} */ this.count = 1; } }',
        '/**\n * @param {string} x Input.\n * @returns {void}\n */\nfunction f(x) {}',
        'const example = "/** @type {string} */";'
    ],
    invalid: [
        { code: '/** Description. */ function f() {}',
            errors: [{ messageId: 'multiline', line: 1, column: 1 }] },
        { code: '/** @type {string} */ function f() {}',
            errors: [{ messageId: 'multiline' }] },
        { code: '/** @type {string} */ class C {}',
            errors: [{ messageId: 'multiline' }] },
        { code: '/** @type {string} Description. */ let x;',
            errors: [{ messageId: 'multiline' }] },
        { code: '/**\n * @type {import("module").Thing}\n */\nlet x;',
            errors: [{ messageId: 'imports' }] },
        { code: '/**\n * @import {Thing} from "module"\n */\nlet x;',
            errors: [{ messageId: 'imports' }] },
        { code: '/** @type {import("module").Thing} */ let x;',
            errors: [{ messageId: 'imports' }] }
    ]
});

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.js' });

test('control-flow diagnostics include policies and alternatives', async () => {
    const [result] = await eslint.lintText(
        'function f(x) { if (x) { return 1; } else { return 2; } }\n'
            + 'switch (x) { default: break; }',
        { filePath: 'src/example.js' }
    );
    const messages = result.messages.filter(m => m.ruleId === 'no-restricted-syntax');
    assert.equal(messages.length, 2);
    assert.match(messages[0].message, ELSE_DIAGNOSTIC);
    assert.match(messages[1].message, SWITCH_DIAGNOSTIC);
});

test('nested ternaries are blocking; ordinary guards are accepted', async () => {
    const [result] = await eslint.lintText(
        'function f(x) { if (!x) return 0; return x ? 1 : x > 2 ? 2 : 3; }',
        { filePath: 'src/example.js' }
    );
    const ternaries = result.messages.filter(m => m.ruleId === 'no-nested-ternary');
    assert.equal(ternaries.length, 1);
    const branches = result.messages.filter(m => m.ruleId === 'no-restricted-syntax');
    assert.equal(branches.length, 0);
});

test('core, Magic, native and tooling files receive the agent rules', async () => {
    for (const file of ['src/example.js', 'extensions/games/magic/src/example.js',
                        'electron/example.cjs', 'tasks/example.js']) {
        const config = await eslint.calculateConfigForFile(file);
        assert.equal(config.rules['agent/jsdoc-syntax'][0], 2, file);
        assert.equal(config.rules['no-undef'][0], 2, file);
    }
    const magic = await eslint.calculateConfigForFile(
        'extensions/games/magic/src/example.js'
    );
    assert.equal(magic.languageOptions.globals.CardMagicianSettings, 'readonly');
});

test('regex placement is disabled only for the test and smoke suffixes', async () => {
    for (const suffix of ['.test.js', '.tests.js', '.smoke.js']) {
        const config = await eslint.calculateConfigForFile(`src/example${suffix}`);
        assert.equal(config.rules['agent/regex-at-module-scope'][0], 0);
    }
    const source = await eslint.calculateConfigForFile('src/example.js');
    assert.equal(source.rules['agent/regex-at-module-scope'][0], 2);
    assert.equal(source.rules['complexity'][0], 0);
    assert.equal(source.rules['agent/complexity'][1], 8);
});
