function elementOverflows(el) {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}

export default function(Alpine) {
    Alpine.directive('fit-text', (el, { expression }, { effect, evaluateLater }) => {
        const adjustFontSize = () => {
            el.style.fontSize = '';
            const baseStyle = getComputedStyle(el);
            const initialFontSize = parseFloat(baseStyle.fontSize) || 16;
            const initialLineHeight = parseFloat(baseStyle.lineHeight) || 1.2;
            const minFontSize = 10;
            const minLineHeight = 1.02;
            const fontSizeStep = 0.5;
            const lineHeightStep = 0.1;

            let fontSize = initialFontSize;
            let lineHeight = initialLineHeight;
            while (elementOverflows(el) && fontSize > minFontSize) {
                if (lineHeight > minLineHeight) {
                    lineHeight -= lineHeightStep;
                } else {
                    lineHeight = initialLineHeight;
                    fontSize -= fontSizeStep;
                }
                el.style.lineHeight = `${lineHeight}`;
                el.style.fontSize = `${fontSize}px`;
            }
        };

        effect(() => {
            evaluateLater(expression || 'true')(() => {
                Alpine.nextTick(adjustFontSize);
            });
        });
    });
}
