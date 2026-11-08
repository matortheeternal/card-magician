import esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'path';
import { getSourceFiles } from './buildHelpers.js';
import { getApplicationEntry } from './buildApp.js';
import { findGameTests } from './findGameTests.js';

const jasmineFiles = [
    'jasmine.js',
    'jasmine-html.js',
    'jasmine.css',
];

async function getTests(suffix, includeShared) {
    const gameTests = await findGameTests('extensions/games', suffix);
    return [
        ...(includeShared ? [
            './shared/reporting.js',
            './shared/log.js',
            './shared/prototypeExtensions.js',
            './shared/localize.js',
        ] : []),
        './shared/testing/testApi.js',
        ...await getSourceFiles(file => file.endsWith(suffix)),
        ...gameTests.map(file => `../${file}`),
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
        keepNames: true,
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
    // Bundle app and smoke specs together so imports share module instances.
    const smokeEntry = `${await getApplicationEntry()}\n${smokeBundle}`;
    await buildJs('smoke.js', smokeEntry, { minify });
    await copyJasmineFiles();
}
