import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import cssModulesPlugin from 'esbuild-plugin-css-modules';
import globImportPlugin from 'esbuild-plugin-import-glob';

const args = process.argv.slice(2);
const shouldMinify = args.includes('--minify');

const shoelaceIcons = [
    'x-lg', 'arrow-repeat', 'image', 'scissors', 'plus-lg', 'dash-lg', 'square', 'lock',
    'unlock', 'arrow-counterclockwise', 'arrows-fullscreen', 'align-center',
    'align-middle', 'folder2-open',
].map(name => `./node_modules/@shoelace-style/shoelace/dist/assets/icons/${name}.svg`);

await esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outdir: 'resources/js',
    format: 'iife',
    sourcemap: true,
    minify: shouldMinify,
    target: ['es2020'],
    loader: {
        '.html': 'text',
        '.css': 'text',
    },
    plugins: [
        globImportPlugin.default(),
        copy({
            resolveFrom: 'cwd',
            assets: {
                from: shoelaceIcons,
                to: ['./resources/shoelace/assets/icons'],
            },
        }),
    ],
});

await esbuild.build({
    entryPoints: ['src/main.css'],
    bundle: true,
    minify: shouldMinify,
    outdir: 'resources/css',
    loader: {
        '.css': 'css',
    },
    plugins: [
        cssModulesPlugin()
    ],
});
