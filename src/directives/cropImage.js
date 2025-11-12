import Alpine from 'alpinejs';
import { getImageSize } from '../gfx/imageProcessing.js';

Alpine.directive('crop-image', (el, { expression }, { effect, evaluateLater }) => {
    const displayImage = async function({ image, width, height, xOffset, yOffset }) {
        const viewportWidth = el.clientWidth;
        const viewportHeight = el.clientHeight;

        const src = await getImageSize(image);
        const bgWidth = viewportWidth / width * src.width;
        const bgOffsetX = -1 * (viewportWidth / width * xOffset);
        const bgHeight = viewportHeight / height * src.height;
        const bgOffsetY = -1 * (viewportHeight / height * yOffset);

        el.style.backgroundImage = `url("${image}")`;
        el.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
        el.style.backgroundPosition = `${bgOffsetX}px ${bgOffsetY}px`;
        el.style.backgroundRepeat = 'no-repeat';
    };

    effect(() => {
        evaluateLater(expression)((result) => {
            Alpine.nextTick(() => requestAnimationFrame(() => displayImage(result)));
        });
    });
});
