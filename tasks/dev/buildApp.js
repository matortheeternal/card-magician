import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import cssModulesPlugin from 'esbuild-plugin-css-modules';
import globImportPlugin from 'esbuild-plugin-import-glob';

const shoelaceIcons = [
    'x-lg', 'arrow-repeat', 'image', 'scissors', 'plus-lg', 'dash-lg', 'square',
    'lock', 'unlock', 'arrow-up', 'arrow-down', 'arrow-counterclockwise',
    'arrows-fullscreen', 'align-center', 'align-middle', 'folder2-open',
    'arrow-left', 'circle', 'list'
].map(
    name => `./node_modules/@shoelace-style/shoelace/dist/assets/icons/${name}.svg`
);

async function buildJs({ minify }) {
    await esbuild.build({
        entryPoints: ['src/main.js'],
        bundle: true,
        outdir: 'resources/js',
        format: 'iife',
        sourcemap: 'inline',
        sourcesContent: true,
        minify,
        target: ['es2020'],
        loader: {
            '.html': 'text',
            '.css': 'text'
        },
        plugins: [
            globImportPlugin.default(),
            copy({
                resolveFrom: 'cwd',
                assets: {
                    from: shoelaceIcons,
                    to: ['./resources/shoelace/assets/icons']
                }
            })
        ]
    });
}

async function buildCss({ minify }) {
    await esbuild.build({
        entryPoints: ['src/main.css'],
        bundle: true,
        outdir: 'resources/css',
        minify,
        loader: {
            '.css': 'css'
        },
        plugins: [
            cssModulesPlugin()
        ]
    });
}

export async function buildApp({ minify = false } = {}) {
    console.log('[build] building app');
    await buildJs({ minify });
    await buildCss({ minify });
}
