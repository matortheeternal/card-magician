const colorIndices = 'WUBRG';

function extractFaceColors(face) {
    if (!face) return [];
    return face.colors.map(c => c.char.toUpperCase());
}

function extractRowColors(card) {
    const frontColors = extractFaceColors(card.original.front);
    const backColors = extractFaceColors(card.original.back);
    const uniqueColors = new Set([...frontColors, ...backColors]);
    return [...uniqueColors];
}

export function compareRowColors(a, b) {
    const colorsA = extractRowColors(a);
    const colorsB = extractRowColors(b);
    if (colorsA.length > colorsB.length) return 1;
    if (colorsA.length < colorsB.length) return -1;

    for (let i = 0; i < colorsA.length; i++) {
        const aIndex = (colorIndices.indexOf(colorsA[i]) + 1) || 10;
        const bIndex = (colorIndices.indexOf(colorsB[i]) + 1) || 10;
        if (aIndex > bIndex) return 1;
        if (aIndex < bIndex) return -1;
    }
    return 0;
}
