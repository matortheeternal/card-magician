import Alpine from 'alpinejs';

function elementOverflows(el) {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}

function rectsIntersect(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function hasText(node) {
    return node.textContent.trim().length > 0;
}

function getTextRects(node, rects = []) {
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

function textIntersects(node, forbiddenRects) {
    if (forbiddenRects.length === 0)
        return false;

    for (let textRect of getTextRects(node))
        for (let forbiddenRect of forbiddenRects)
            if (rectsIntersect(textRect, forbiddenRect))
                return true;

    return false;
}

function isFitTextClass(str) {
    return /ft-(fontsize|lineheight)-\d{3}/.test(str);
}

function getBaseClasses(el) {
    return el.className.split(' ').filter(str => !isFitTextClass(str));
}

function updateClasses(el, fontSize, lineHeight) {
    const classes = getBaseClasses(el);
    classes.push(`ft-fontsize-${fontSize.toFixed(1).replace('.', '')}`);
    classes.push(`ft-lineheight-${lineHeight.toFixed(2).replace('.', '')}`);
    return classes.join(' ');
}

Alpine.directive('fit-text', (el, { expression }, { effect, evaluateLater }) => {
    const adjustFontSize = (forbiddenRects) => {
        el.style.fontSize = '';
        el.style.lineHeight = '';
        el.className = getBaseClasses(el).join(' ');
        const baseStyle = getComputedStyle(el);
        const initialFontSize = parseFloat(baseStyle.fontSize) || 16;
        const initialLineHeight = parseFloat(baseStyle.lineHeight) || 1.2;
        const minFontSize = 10;
        const minLineHeight = 1.1;
        const fontSizeStep = 0.5;
        const lineHeightStep = 0.05;
        const overflows = () => {
            return elementOverflows(el) ||
                forbiddenRects && textIntersects(el, forbiddenRects)
        };

        let fontSize = initialFontSize;
        let lineHeight = initialLineHeight;
        while (overflows() && fontSize > minFontSize) {
            if (lineHeight > minLineHeight) {
                lineHeight -= lineHeightStep;
            } else {
                lineHeight = initialLineHeight;
                fontSize -= fontSizeStep;
            }
            el.style.lineHeight = `${lineHeight}`;
            el.style.fontSize = `${fontSize}px`;
            el.className = updateClasses(el, fontSize, lineHeight);
        }
    };

    let timeout = null;
    effect(() => {
        evaluateLater(expression)((result) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => adjustFontSize(result.forbiddenRects), 10);
        });
    });
});
