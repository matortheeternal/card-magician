export const cropHandlers = {
    'move': (crop, cropStart, dx, dy) => {
        crop.xOffset = cropStart.xOffset + dx;
        crop.yOffset = cropStart.yOffset + dy;
    },
    'resize-top': (crop, cropStart, dx, dy, options) => {
        crop.yOffset = cropStart.yOffset + dy;
        if (crop.yOffset < 0) {
            dy -= crop.yOffset;
            crop.yOffset = 0;
        }
        crop.height = cropStart.height - dy;
        if (options.sizeAroundCenter) crop.height -= dy;
        if (options.keepAspectRatio) {
            const aspectRatio = cropStart.width / cropStart.height;
            crop.width = crop.height * aspectRatio;
            crop.xOffset = cropStart.xOffset + (cropStart.width - crop.width) / 2;
        }
    },
    'resize-bottom': (crop, cropStart, dx, dy, options) => {
        crop.height = cropStart.height + dy;
        if (options.sizeAroundCenter) {
            crop.height += dy;
            crop.yOffset = cropStart.yOffset - dy;
        }
        if (options.keepAspectRatio) {
            const aspectRatio = cropStart.width / cropStart.height;
            crop.width = crop.height * aspectRatio;
            crop.xOffset = cropStart.xOffset + (cropStart.width - crop.width) / 2;
        }
    },
    'resize-left': (crop, cropStart, dx, dy, options) => {
        crop.xOffset = cropStart.xOffset + dx;
        if (crop.xOffset < 0) {
            dx -= crop.xOffset;
            crop.xOffset = 0;
        }
        crop.width = cropStart.width - dx;
        if (options.sizeAroundCenter) crop.width -= dx;
        if (options.keepAspectRatio) {
            const aspectRatio = cropStart.width / cropStart.height;
            crop.height = crop.width / aspectRatio;
            crop.yOffset = cropStart.yOffset + (cropStart.height - crop.height) / 2;
        }
    },
    'resize-right': (crop, cropStart, dx, dy, options) => {
        crop.width = cropStart.width + dx;
        if (options.sizeAroundCenter) {
            crop.width += dx;
            crop.xOffset = cropStart.xOffset - dx;
        }
        if (options.keepAspectRatio) {
            const aspectRatio = cropStart.width / cropStart.height;
            crop.height = crop.width / aspectRatio;
            crop.yOffset = cropStart.yOffset + (cropStart.height - crop.height) / 2;
        }
    }
};
