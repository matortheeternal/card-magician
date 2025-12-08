function parsePT(value) {
    if (value === "*" ) return 0;
    if (value === "" || value == null) return -1;

    const n = Number(value);
    return Number.isFinite(n) ? n : -1;
}

function extractFacePT(face) {
    if (!face) return { power: -1, toughness: -1 };
    return {
        power: parsePT(face.power),
        toughness: parsePT(face.toughness)
    };
}

function extractRowPTs(card) {
    const front = extractFacePT(card.original.front);
    const back = extractFacePT(card.original.back);
    return [
        front.power,
        front.toughness,
        back.power,
        back.toughness,
    ];
}

export default function compareRowPTs(a, b) {
    const ptsA = extractRowPTs(a);
    const ptsB = extractRowPTs(b);

    for (let i = 0; i < ptsA.length; i++) {
        if (ptsA[i] < ptsB[i]) return -1;
        if (ptsA[i] > ptsB[i]) return 1;
    }
    return 0;
}
