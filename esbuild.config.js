import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import cssModulesPlugin from 'esbuild-plugin-css-modules';
import globImportPlugin from 'esbuild-plugin-import-glob';

const args = process.argv.slice(2);
const shouldMinify = args.includes('--minify');

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
                from: [
                    './node_modules/@shoelace-style/shoelace/dist/assets/**/*',
                ],
                to: ['./resources/shoelace/assets'],
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
