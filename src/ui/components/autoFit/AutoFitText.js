import AutoFit from './AutoFit.js';

function hasText(node) {
    return node.textContent.trim().length > 0;
}

function getTextRects(node, rects) {
    if (node.nodeType === Node.TEXT_NODE && hasText(node)) {
        const range = new Range();
        range.setStart(node, 0);
        range.setEnd(node, node.textContent.length);
        rects.push(...range.getClientRects());
    } else {
        for (const child of node.childNodes)
            getTextRects(child, rects);
    }
    return rects;
}

function rectsIntersect(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

class AutoFitText extends AutoFit {
    static get observedAttributes() {
        return ['min', 'max', 'avoid'];
    }

    constructor() {
        super();
        this.forbiddenRects = [];
    }

    attributeChangedCallback(name, _, value) {
        if (name === 'avoid') this.updateForbiddenRects(value);
        super.attributeChangedCallback(name, _, value);
    }

    updateForbiddenRects(value) {
        const selectors = value.split(';')
            .map(s => s.trim())
            .filter(Boolean);
        const root = this.getRootNode();
        this.forbiddenRects = [];
        selectors.forEach(selector => {
            for (const el of root.querySelectorAll(selector))
                this.forbiddenRects.push(...el.getClientRects());
        });
    }

    textIntersects() {
        if (!this.forbiddenRects.length) return false;

        const textRects = getTextRects(this, []);
        for (const tr of textRects)
            for (const fr of this.forbiddenRects)
                if (rectsIntersect(tr, fr))
                    return true;

        return false;
    }

    checkFit(size) {
        this.style.fontSize = `${size}px`;
        const fitsWidth = this.scrollWidth <= this.clientWidth;
        const fitsHeight = this.scrollHeight <= this.clientHeight;
        return fitsWidth && fitsHeight && !this.textIntersects();
    }
}

customElements.define('auto-fit-text', AutoFitText);
