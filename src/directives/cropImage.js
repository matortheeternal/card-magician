import Alpine from 'alpinejs';
import { getImageSize } from '../gfx/imageProcessing.js';

Alpine.directive('crop-image', (el, { expression }, { evaluateLater, cleanup, effect }) => {
    let currentValue = null;

    const displayImage = async ({ image, width, height, xOffset, yOffset }) => {
        const { clientWidth: viewportWidth, clientHeight: viewportHeight } = el;
        if (!viewportWidth || !viewportHeight) return;

        const src = await getImageSize(image);

        const bgWidth = viewportWidth / width * src.width;
        const bgHeight = viewportHeight / height * src.height;
        const bgOffsetX = -1 * (viewportWidth / width * xOffset);
        const bgOffsetY = -1 * (viewportHeight / height * yOffset);

        el.style.backgroundImage = `url("${image}")`;
        el.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
        el.style.backgroundPosition = `${bgOffsetX}px ${bgOffsetY}px`;
        el.style.backgroundRepeat = 'no-repeat';
    };

    const ro = new ResizeObserver(() => {
        if (currentValue) displayImage(currentValue);
    });

    ro.observe(el);

    effect(() => {
        evaluateLater(expression)((v) => {
            currentValue = v;
            displayImage(v);
        });
    });
    cleanup(() => ro.disconnect());
});
