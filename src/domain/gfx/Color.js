const hexColorExpr = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;

export default class Color {
    constructor(r, g, b, a = 255) {
        this._r = this._clamp(r);
        this._g = this._clamp(g);
        this._b = this._clamp(b);
        this._a = this._clamp(a);
    }

    _clamp(value) {
        if (!Number.isFinite(value))
            throw new Error('Color component must be a finite number');
        return Math.round(Math.max(0, Math.min(255, value)));
    }

    get r() { return this._r; }
    get g() { return this._g; }
    get b() { return this._b; }
    get a() { return this._a; }

    static fromHex(hex) {
        const match = hex.match(hexColorExpr);
        if (!match)
            throw new Error('Invalid hex color format');

        const r = parseInt(match[1], 16);
        const g = parseInt(match[2], 16);
        const b = parseInt(match[3], 16);
        const a = match[4] ? parseInt(match[4], 16) : 255;

        return new Color(r, g, b, a);
    }
}

Color.black = new Color(0, 0, 0);
Color.red = new Color(255, 0, 0);
Color.green = new Color(0, 255, 0);
Color.blue = new Color(0, 0, 255);

window.Color = Color;
