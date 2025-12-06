function blobToBase64_FileReader(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject('Failed FileReader');
        reader.readAsDataURL(blob);
    });
}

function blobToBase64_Chunked(blob) {
    return blob.arrayBuffer().then(buffer => {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000;
        let binary = '';

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            let chunkStr = '';
            for (let j = 0; j < chunk.length; j++) {
                chunkStr += String.fromCharCode(chunk[j]);
            }
            binary += chunkStr;
        }

        return btoa(binary);
    });
}

function fillRandom(uint8array) {
    const max = 65536; // getRandomValues limit
    const { length } = uint8array;

    for (let i = 0; i < length; i += max) {
        const slice = uint8array.subarray(i, i + max);
        crypto.getRandomValues(slice);
    }
}

function measureMemory() {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize;
    }
    return null;
}

async function runTrial(name, fn, blob) {
    const results = {};

    const memBefore = measureMemory();
    const start = performance.now();

    let base64;
    try {
        base64 = await fn(blob);
    } catch (err) {
        console.error(`${name} encoding failed`, err);
        throw err;
    }

    const end = performance.now();
    const memAfter = measureMemory();

    results.timeMs = end - start;
    results.memoryDelta = memAfter !== null && memBefore !== null
        ? memAfter - memBefore
        : null;
    results.base64Length = base64.length;

    return results;
}

export function buildBlobEncodingTests() {
    describe('Blob Base64 Encoding Performance', () => {
        const SIZES = [
            { label: 'Small (50 KB)', size: 50 * 1024 },
            { label: 'Medium (2 MB)', size: 2 * 1024 * 1024 },
            { label: 'Large (20 MB)', size: 20 * 1024 * 1024 }
        ];

        SIZES.forEach(testCase => {
            it(`compares encoding methods for ${testCase.label}`, async () => {
                const data = new Uint8Array(testCase.size);
                fillRandom(data);
                const blob = new Blob([data], { type: 'application/octet-stream' });

                const freaderResult = await runTrial(
                    'FileReader',
                    blobToBase64_FileReader,
                    blob
                );

                const chunkedResult = await runTrial(
                    'Chunked',
                    blobToBase64_Chunked,
                    blob
                );

                console.log(`=== ${testCase.label} ===`);
                console.log('FileReader: ' + JSON.stringify(freaderResult));
                console.log('Chunked: ' + JSON.stringify(chunkedResult));

                expect(freaderResult.base64Length).toBeGreaterThan(0);
                expect(chunkedResult.base64Length).toBeGreaterThan(0);

                expect(
                    Math.abs(freaderResult.base64Length - chunkedResult.base64Length)
                ).toBeLessThan(testCase.size * 0.001);
            });
        });
    });
}
