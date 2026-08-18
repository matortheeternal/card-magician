import esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'path';
import { getSourceFiles } from './buildHelpers.js';

const jasmineFiles = [
    'jasmine.js',
    'jasmine-html.js',
    'jasmine.css',
];

async function getTests(suffix, includeShared) {
    return [
        ...(includeShared ? [
            './shared/log.js',
            './shared/prototypeExtensions.js',
            './shared/localize.js',
        ] : []),
        ...await getSourceFiles(file => file.endsWith(suffix)),
        `./${suffix.slice(1)}`
    ].map(filePath => `import '${filePath}';`).join('\n');
}

async function buildJs(filename, bundle, { minify }) {
    await esbuild.build({
        stdin: {
            contents: bundle,
            resolveDir: path.join(process.cwd(), 'src'),
            sourcefile: `bundle-${filename}`
        },
        bundle: true,
        outfile: `resources/tests/${filename}`,
        format: 'iife',
        sourcemap: 'inline',
        sourcesContent: true,
        minify,
        target: ['es2020'],
        loader: {
            '.html': 'text',
            '.css': 'text',
        },
    });
}

async function copyJasmineFiles() {
    const sourceDir = 'node_modules/jasmine-core/lib/jasmine-core';
    const targetDir = 'resources/tests/jasmine';

    await fs.mkdir(targetDir, { recursive: true });

    await Promise.all(jasmineFiles.map(file => {
        return fs.copyFile(
            path.join(sourceDir, file),
            path.join(targetDir, file),
        );
    }));
}

export async function buildTests({ minify = false } = {}) {
    console.log('[build] building tests');
    const testBundle = await getTests('.tests.js', true);
    const smokeBundle = await getTests('.smoke.js', false);
    await buildJs('tests.js', testBundle, { minify });
    await buildJs('smoke.js', smokeBundle, { minify });
    await copyJasmineFiles();
}
