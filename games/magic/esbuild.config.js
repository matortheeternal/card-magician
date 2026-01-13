import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildMagic({ minify = false }) {
    console.log('[build] building magic module');
    await esbuild.build({
        entryPoints: [path.resolve(__dirname, 'src/main.js')],
        bundle: true,
        outdir: __dirname,
        format: 'esm',
        sourcemap: true,
        minify,
        target: ['es2020'],
        loader: {
            '.html': 'text',
            '.css': 'text',
        },
    });
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    const args = process.argv.slice(2);
    const minify = args.includes('--minify');
    buildMagic({ minify }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
