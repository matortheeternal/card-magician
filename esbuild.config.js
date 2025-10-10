import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import cssModulesPlugin from 'esbuild-plugin-css-modules';

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
    plugins: [
        copy({
            resolveFrom: 'cwd',
            assets: {
                from: [
                    './node_modules/@shoelace-style/shoelace/dist/assets/**/*',
                ],
                to: ['./resources/shoelace'],
            },
        }),
    ],
});

await esbuild.build({
    entryPoints: ['src/styles/main.css'],
    bundle: true,
    minify: shouldMinify,
    outdir: 'resources/css',
    loader: {
        '.css': 'css',
    },
    plugins: [cssModulesPlugin()],
});
