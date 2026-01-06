import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import cssModulesPlugin from 'esbuild-plugin-css-modules';
import globImportPlugin from 'esbuild-plugin-import-glob';

const args = process.argv.slice(2);
const shouldMinify = args.includes('--minify');
const shouldServe = args.includes('--dev');

const shoelaceIcons = [
    'x-lg', 'arrow-repeat', 'image', 'scissors', 'plus-lg', 'dash-lg', 'square', 'lock',
    'unlock', 'arrow-counterclockwise', 'arrows-fullscreen', 'align-center',
    'align-middle', 'folder2-open',
].map(name => `./node_modules/@shoelace-style/shoelace/dist/assets/icons/${name}.svg`);

const jsOptions = {
    entryPoints: ['src/main.js'],
    bundle: true,
    outdir: 'dist/js',
    format: 'iife',
    sourcemap: true,
    minify: shouldMinify,
    target: ['es2020'],
    external: ['@wails/runtime'],
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
                to: ['./dist/shoelace/assets'],
            },
        }),
    ],
};

const cssOptions = {
    entryPoints: ['src/main.css'],
    bundle: true,
    minify: shouldMinify,
    outdir: 'dist/css',
    loader: {
        '.css': 'css',
    },
    plugins: [
        cssModulesPlugin(),
    ],
};

if (shouldServe) {
    const jsCtx = await esbuild.context(jsOptions);
    const cssCtx = await esbuild.context(cssOptions);

    await jsCtx.watch();
    await cssCtx.watch();

    const { host, port } = await jsCtx.serve({
        servedir: 'dist',
        port: 5173,
    });

    console.log(`esbuild dev server running at http://${host}:${port}`);
} else {
    await esbuild.build(jsOptions);
    await esbuild.build(cssOptions);
}
