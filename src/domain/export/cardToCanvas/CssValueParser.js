export default class CssValueParser {
    constructor(css, isSeparator) {
        this.css = css;
        this.isSeparator = isSeparator;
        this.position = 0;
        this.start = 0;
        this.depth = 0;
        this.parts = [];
    }

    get character() { return this.css[this.position]; }

    parse() {
        while (this.position < this.css.length) this.advance();
        this.appendPart(this.css.length);
        return this.parts;
    }

    advance() {
        const char = this.character;
        if (char === '"' || char === '\'') return this.skipQuoted();
        if (char === '(') { this.depth++; this.position++; return; }
        if (char === ')') { this.depth--; this.position++; return; }
        this.consumeSeparator();
        this.position++;
    }

    skipQuoted() {
        const quote = this.character;
        this.position++;
        while (this.position < this.css.length) {
            const char = this.character;
            this.position++;
            if (char === '\\') { this.position++; continue; }
            if (char === quote) return;
        }
    }

    consumeSeparator() {
        if (this.depth !== 0 || !this.isSeparator(this.character)) return;
        this.appendPart(this.position);
    }

    appendPart(end) {
        const part = this.css.slice(this.start, end).trim();
        if (part) this.parts.push(part);
        this.start = end + 1;
    }
}
