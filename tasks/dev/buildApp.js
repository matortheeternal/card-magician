import esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'path';
import { getSourceFiles } from './buildHelpers.js';

const shoelaceIcons = [
    'x-lg', 'arrow-repeat', 'image', 'scissors', 'plus-lg', 'dash-lg', 'square',
    'lock', 'unlock', 'arrow-up', 'arrow-down', 'arrow-counterclockwise',
    'arrows-fullscreen', 'align-center', 'align-middle', 'folder2-open',
    'arrow-left', 'circle', 'list'
];

function isApplicationCode(file) {
    return file.endsWith('.js')
        && !file.endsWith('.tests.js')
        && !file.endsWith('.smoke.js');
}

async function buildJs({ minify, sourcemap }) {
    const main = [
        './shared/reporting.js',
        './shared/prototypeExtensions.js',
        './shared/reporting/saveErrorsToDisk.js',
        './shared/log.js',
        './shared/localize.js',
        '@shoelace-style/shoelace/dist/shoelace.js',
        ...await getSourceFiles(file => {
            return file.startsWith('domain/')
                && isApplicationCode(file);
        }),
        ...await getSourceFiles(file => {
            return file.startsWith('ui/')
                && isApplicationCode(file);
        }),
        './startup.js',
    ].map(filePath => `import '${filePath}';`).join('\n');

    await esbuild.build({
        stdin: {
            contents: main,
            resolveDir: path.join(process.cwd(), 'src'),
            sourcefile: 'main.js'
        },
        bundle: true,
        outfile: 'resources/js/main.js',
        keepNames: true,
        format: 'iife',
        sourcemap,
        sourcesContent: true,
        minify,
        target: ['es2020'],
        loader: {
            '.html': 'text',
            '.css': 'text'
        }
    });
}

async function copyShoelaceIcons() {
    const sourceDir = 'node_modules/@shoelace-style/shoelace/dist/assets/icons';
    const targetDir = 'resources/shoelace/assets/icons';
    await fs.mkdir(targetDir, { recursive: true });
    await Promise.all(shoelaceIcons.map(icon => {
        return fs.copyFile(
            path.join(sourceDir, `${icon}.svg`),
            path.join(targetDir, `${icon}.svg`)
        );
    }));
}

async function buildCss({ minify }) {
    const main = [
        '@shoelace-style/shoelace/dist/themes/dark.css',
        'highlight.js/styles/monokai-sublime.min.css',
        ...(await getSourceFiles(file => {
            return file.endsWith('.css') && file !== 'main.css';
        })).sort(),
        './main.css'
    ].map(filePath => `@import ${JSON.stringify(filePath)};`).join('\n');

    await esbuild.build({
        stdin: {
            contents: main,
            resolveDir: path.join(process.cwd(), 'src'),
            sourcefile: 'styles.css',
            loader: 'css'
        },
        bundle: true,
        outfile: 'resources/css/main.css',
        minify
    });
}

export async function buildApp({
    minify = false, sourcemap = minify ? false : 'inline'
} = {}) {
    console.log('[build] building app');
    await buildJs({ minify, sourcemap });
    await buildCss({ minify });
    await copyShoelaceIcons();
}
