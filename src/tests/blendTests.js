import { combineBlend } from '../gfx/blending.js';
import { getImageUrl } from '../fsHelpers.js';

async function saveCanvasToFile(canvas, filePath) {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const arrayBuffer = await blob.arrayBuffer();
    await Neutralino.filesystem.writeBinaryFile(filePath, arrayBuffer);
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

async function benchmarkAsync(fn, iterations = 10) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
        const t0 = Date.now();
        await fn();
        const t1 = Date.now();
        times.push(t1 - t0);
    }

    const avg = times.reduce((a,b) => a+b, 0) / times.length;
    return { avg, times };
}

const iterations = 10;
const modes = [
    "normal", "add", "subtract", "stamp", "difference", "negation",
    "multiply", "darken", "lighten", "colorDodge", "colorBurn",
    "screen", "overlay", "hardLight", "softLight", "reflect",
    "glow", "freeze", "heat", "and", "or", "xor", "shadow",
    "symmetricOverlay"
];

export function buildBlendTests() {
    describe('Blend modes', () => {
        let photo, gradient;
        const results = {};

        beforeAll(async () => {
            const photoUrl = await getImageUrl('tests/fixtures/photo.jpg');
            const gradientUrl = await getImageUrl('tests/fixtures/gradient.png');

            photo = await loadImage(photoUrl);
            gradient = await loadImage(gradientUrl);
        });

        it('should combine photo and gradient for each mode', async () => {
            let canvas;
            for (const mode of modes) {
                const { avg } = await benchmarkAsync(async () => {
                    canvas = await combineBlend(photo, gradient, mode);
                }, iterations);

                results[mode] = `${avg.toFixed(2)} ms (avg over ${iterations} runs)`;
                await saveCanvasToFile(canvas, `tests/output/${mode}.png`);
                expect(canvas).toBeInstanceOf(HTMLCanvasElement);
            }
            console.log("Blend benchmark results:", results);
        });

        afterAll(async () => {
            await Neutralino.filesystem.writeFile(
                'tests/output/benchmark.json',
                JSON.stringify(results, null, 2)
            );
        })
    });
}
