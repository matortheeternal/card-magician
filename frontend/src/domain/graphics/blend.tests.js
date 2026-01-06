import { combineBlend, linearBlend, maskBlend } from './blending.js';
import { writeBinaryFile, writeFile } from '../../shared/wailsAdapter.js';

async function saveCanvasToFile(canvas, filePath) {
    const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
    });
    const arrayBuffer = await blob.arrayBuffer();
    await writeBinaryFile(filePath, arrayBuffer);
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
    'add', 'subtract', 'stamp', 'difference', 'negation',
    'multiply', 'darken', 'lighten', 'colorDodge', 'colorBurn',
    'screen', 'overlay', 'hardLight', 'softLight', 'reflect',
    'glow', 'freeze', 'heat', 'and', 'or', 'xor', 'shadow',
    'symmetricOverlay'
];

export function buildCombineBlendTests() {
    describe('combineBlend', () => {
        let photo, gradient;
        const results = {};

        beforeAll(async () => {
            const photoUrl = '/tests/fixtures/photo.jpg';
            const gradientUrl = '/tests/fixtures/gradient.png';

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
            console.log('Blend benchmark results:', results);
        });

        afterAll(async () => {
            await writeFile(
                'tests/output/combineBlend_benchmark.json',
                JSON.stringify(results, null, 2)
            );
        });
    });
}

const testAngles = [
    { name: 'vertical',   x1: 0,   y1: 0, x2: 0,   y2: 1 },
    { name: 'horizontal', x1: 0,   y1: 0, x2: 1,   y2: 0 },
    { name: 'diagonal1',  x1: 0,   y1: 0, x2: 1,   y2: 1 },
    { name: 'diagonal2',  x1: 1,   y1: 0, x2: 0,   y2: 1 }
];

export function buildLinearBlendTests() {
    describe('linearBlend', () => {
        let photo, gradient;
        const results = {};

        beforeAll(async () => {
            const photoUrl = '/tests/fixtures/photo.jpg';
            const gradientUrl = '/tests/fixtures/gradient.png';

            photo = await loadImage(photoUrl);
            gradient = await loadImage(gradientUrl);
        });

        it('should blend photo and gradient at various angles', async () => {
            let canvas;
            for (const { name, x1, y1, x2, y2 } of testAngles) {
                const { avg } = await benchmarkAsync(async () => {
                    canvas = linearBlend(photo, gradient, x1, y1, x2, y2);
                }, iterations);

                results[name] = `${avg.toFixed(2)} ms (avg over ${iterations} runs)`;

                await saveCanvasToFile(canvas, `tests/output/linearBlend_${name}.png`);
                expect(canvas).toBeInstanceOf(HTMLCanvasElement);
            }
            console.log('Linear blend benchmark results:', results);
        });

        afterAll(async () => {
            await writeFile(
                'tests/output/linearBlend_benchmark.json',
                JSON.stringify(results, null, 2)
            );
        });
    });
}

export function buildMaskBlendTests() {
    describe('maskBlend', () => {
        let img1, img2, mask;
        const results = {};

        beforeAll(async () => {
            const img1Url = '/tests/fixtures/photo.jpg';
            const img2Url = '/tests/fixtures/gradient.png';
            const maskUrl = '/tests/fixtures/softmask.png';

            img1 = await loadImage(img1Url);
            img2 = await loadImage(img2Url);
            mask = await loadImage(maskUrl);
        });

        it('should blend two images based on a mask', async () => {
            let canvas;
            const { avg } = await benchmarkAsync(async () => {
                canvas = maskBlend(img1, img2, mask);
                expect(canvas).toBeInstanceOf(HTMLCanvasElement);
            }, iterations);
            await saveCanvasToFile(canvas, 'tests/output/maskBlend.png');

            results['maskBlend'] = `${avg.toFixed(2)} ms (avg over ${iterations} runs)`;
            console.log('Mask blend benchmark results:', results);
        });

        afterAll(async () => {
            await writeFile(
                'tests/output/maskBlend_benchmark.json',
                JSON.stringify(results, null, 2)
            );
        });
    });
}
