import esbuild from 'esbuild';

const args = process.argv.slice(2);
const shouldMinify = args.includes('--minify');

await esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outdir: '.',
    format: 'esm',
    sourcemap: true,
    minify: shouldMinify,
    target: ['es2020'],
    loader: {
        '.html': 'text',
        '.css': 'text',
    },
});
