import { patchImports } from '../services/patchImports.js';

export function buildImportTests() {
    describe('patchImports', () => {

        it('rewrites a default import', () => {
            const input = `import Spout from './Spout.js';`;
            const out = patchImports(input);

            expect(out.trim()).toBe(
                `const { default: Spout } = await __MODULE_IMPORT__('./Spout.js', import.meta.url);`
            );
        });

        it('rewrites a named import', () => {
            const input = `import { A, B } from "./utils.js";`;
            const out = patchImports(input);

            expect(out.trim()).toBe(
                `const { A, B } = await __MODULE_IMPORT__('./utils.js', import.meta.url);`
            );
        });

        it('rewrites a side-effect import', () => {
            const input = `import './polyfill.js';`;
            const out = patchImports(input);

            expect(out.trim()).toBe(
                `await __MODULE_IMPORT__('./polyfill.js', import.meta.url);`
            );
        });

        it('does NOT rewrite module.import()', () => {
            const input = `const mod = module.import('./Something.js');`;
            const out = patchImports(input);

            expect(out.trim()).toBe(input);
        });

        it('does not rewrite commented imports', () => {
            const input = `// import Fake from './nope.js';`;
            const out = patchImports(input);

            expect(out.trim()).toBe(input);
        });

        it('handles multiple imports in one file', () => {
            const input = `
                import A from './A.js';
                import { B } from "./B.js";
                import './side.js';
            `;

            const out = patchImports(input);

            expect(out).toContain(
                `const { default: A } = await __MODULE_IMPORT__('./A.js', import.meta.url);`
            );
            expect(out).toContain(
                `const { B } = await __MODULE_IMPORT__('./B.js', import.meta.url);`
            );
            expect(out).toContain(
                `await __MODULE_IMPORT__('./side.js', import.meta.url);`
            );
        });

        it('handles leading whitespace', () => {
            const input = `    import A from './A.js';`;
            const out = patchImports(input);

            expect(out.trim()).toBe(
                `const { default: A } = await __MODULE_IMPORT__('./A.js', import.meta.url);`
            );
        });

        it('ignores import inside a string literal', () => {
            const input = `const s = "import X from './hack.js'";`;
            const out = patchImports(input);

            expect(out.trim()).toBe(input);
        });

        it('ignores import inside a template literal', () => {
            const input = "const t = `text with import A from './H.js' inside`;";
            const out = patchImports(input);

            expect(out.trim()).toBe(input);
        });

        it('handles import without semicolon', () => {
            const input = `import A from './A.js'`;
            const out = patchImports(input);

            expect(out.trim()).toBe(
                `const { default: A } = await __MODULE_IMPORT__('./A.js', import.meta.url);`
            );
        });

        it('handles named import without semicolon', () => {
            const input = `import { A, B } from "./x.js"`;
            const out = patchImports(input);

            expect(out.trim()).toBe(
                `const { A, B } = await __MODULE_IMPORT__('./x.js', import.meta.url);`
            );
        });
    });
}
