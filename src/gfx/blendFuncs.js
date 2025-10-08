function top(x)  { return Math.min(255, x); }
function bot(x)  { return Math.max(0, x); }
function col(x)  { return Math.min(255, Math.max(0, x)); }

function overlay(a, b) {
    return (a < 128)
        ? (a * b) >> 7
        : 255 - (((255 - a) * (255 - b)) >> 7);
}

function softLight(a, b) {
    a /= 255;
    b /= 255;
    let result;

    if (b < 0.5) {
        result = a - (1 - 2 * b) * a * (1 - a);
    } else {
        const d = (a <= 0.25)
            ? ((16 * a - 12) * a + 4) * a
            : Math.sqrt(a);
        result = a + (2 * b - 1) * (d - a);
    }

    return Math.round(result * 255);
}

export const blendFuncs = {
    add:           (a, b) => top(a + b),
    subtract:      (a, b) => bot(a - b),
    stamp:         (a, b) => col(a - 2 * b + 256),
    difference:    (a, b) => Math.abs(a - b),
    negation:      (a, b) => 255 - Math.abs(255 - a - b),
    multiply:      (a, b) => (a * b) / 255,
    darken:        (a, b) => Math.min(a, b),
    lighten:       (a, b) => Math.max(a, b),
    colorDodge:    (a, b) => (b === 255 ? 255 : top(a * 255 / (255 - b))),
    colorBurn:     (a, b) => (b === 0 ? 0 : bot(255 - (255 - a) * 255 / b)),
    screen:        (a, b) => 255 - (((255 - a) * (255 - b)) / 255),
    overlay:       (a, b) => overlay(a, b),
    hardLight:     (a, b) => (b < 128)
        ? (a * b) >> 7
        : 255 - (((255 - a) * (255 - b)) >> 7),
    softLight:     (a, b) => softLight(a, b),
    reflect:       (a, b) => (b === 255 ? 255 : top((a * a) / (255 - b))),
    glow:          (a, b) => (a === 255 ? 255 : top((b * b) / (255 - a))),
    freeze:        (a, b) => (b === 0 ? 0 : bot(255 - ((255 - a) * (255 - a)) / b)),
    heat:          (a, b) => (a === 0 ? 0 : bot(255 - ((255 - b) * (255 - b)) / a)),
    and:           (a, b) => a & b,
    or:            (a, b) => a | b,
    xor:           (a, b) => a ^ b,
    shadow:        (a, b) => (b * a * a) / (255 * 255),
    symmetricOverlay: (a, b) => (overlay(a, b) + overlay(b, a)) >> 1,
};
