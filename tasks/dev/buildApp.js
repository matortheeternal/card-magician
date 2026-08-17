import esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'path';

const shoelaceIcons = [
    'x-lg', 'arrow-repeat', 'image', 'scissors', 'plus-lg', 'dash-lg', 'square',
    'lock', 'unlock', 'arrow-up', 'arrow-down', 'arrow-counterclockwise',
    'arrows-fullscreen', 'align-center', 'align-middle', 'folder2-open',
    'arrow-left', 'circle', 'list'
];

async function getFiles(dir) {
    const dirPath = path.join('src', dir);
    const files = await fs.readdir(dirPath, { recursive: true });
    return files
        .filter(file => file.endsWith('.js') && !file.endsWith('.tests.js'))
        .map(file => `./${path.join(dir, file)}`);
}

async function buildJs({ minify }) {
    const main = [
        '@shoelace-style/shoelace/dist/shoelace.js',
        './shared/log.js',
        './shared/prototypeExtensions.js',
        './shared/localize.js',
        ...await getFiles('domain'),
        ...await getFiles('ui'),
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
        format: 'iife',
        sourcemap: 'inline',
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
    await esbuild.build({
        entryPoints: ['src/main.css'],
        bundle: true,
        outdir: 'resources/css',
        minify
    });
}

export async function buildApp({ minify = false } = {}) {
    console.log('[build] building app');
    await buildJs({ minify });
    await buildCss({ minify });
    await copyShoelaceIcons();
}
