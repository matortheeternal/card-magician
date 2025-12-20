import Alpine from 'alpinejs';
import html from './cropImageModalHTML.js';

const cropHandlers = {
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

Alpine.data('cropImageModal', () => ({
    aspectRatioLocked: false,
    dragging: null,
    maxWidth: 600,
    maxHeight: 600,
    previewStyle: { width: 600, height: 600 },
    async init() {
        this.$root.innerHTML = html;
        const modalData = Alpine.store('views').modalData;
        this.value = modalData.value;
        this.aspectRatio = modalData.aspectRatio;
        this.realCrop = this.value.crop.clone();
        this.realWidth = this.value.width;
        this.realHeight = this.value.height;
        this.value.applyCoordinateSpace(this.maxWidth, this.maxHeight);
        this.scalingFactor = (1 / this.value.scale).toFixed(2);
        this.cropBox = this.$root.querySelector('.crop-box');
        this.clampCrop();
        this.updateCropBox();
        this.updatePreviewStyle();
        this.onInput = this.onInput.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.$root.addEventListener('input', this.onInput);
        this.$root.addEventListener('pointerup', this.onPointerUp);
        this.$root.addEventListener('pointerdown', this.onPointerDown);
        this.$root.addEventListener('pointermove', this.onPointerMove);
        Alpine.initTree(this.$root);
    },
    updateRealCrop() {
        const crop = this.value.crop;
        const scale = this.value.scale;
        this.realCrop.width = Math.round(crop.width * scale);
        this.realCrop.height = Math.round(crop.height * scale);
        this.realCrop.xOffset = Math.round(crop.xOffset * scale);
        this.realCrop.yOffset = Math.round(crop.yOffset * scale);
    },
    updateCropBox() {
        const crop = this.value.crop;
        this.cropBox.style.top = `${crop.yOffset + 6}px`;
        this.cropBox.style.left = `${crop.xOffset + 6}px`;
        this.cropBox.style.width = `${crop.width}px`;
        this.cropBox.style.height = `${crop.height}px`;
        this.updateRealCrop();
    },
    clampCrop(isMove = false) {
        const crop = this.value.crop;
        const imgWidth = Math.min(this.value.width, this.maxWidth);
        const imgHeight = Math.min(this.value.height, this.maxHeight);
        const maxOffsetX = imgWidth - (isMove ? crop.width : 1);
        const maxOffsetY = imgHeight - (isMove ? crop.height : 1);
        crop.xOffset = Math.max(0, Math.min(crop.xOffset, maxOffsetX));
        crop.yOffset = Math.max(0, Math.min(crop.yOffset, maxOffsetY));
        const maxWidth = imgWidth - crop.xOffset;
        const maxHeight = imgHeight - crop.yOffset;
        crop.width = Math.min(Math.max(crop.width, 1), maxWidth);
        crop.height = Math.min(Math.max(crop.height, 1), maxHeight);
    },
    updatePreviewStyle() {
        let height = Math.min(this.maxHeight, this.value.height);
        let width = height * this.aspectRatio;
        if (width > this.maxWidth) {
            width = this.maxWidth;
            height = width / this.aspectRatio;
        }
        const previewContainer = this.$root.querySelector('.preview-container');
        previewContainer.style.width = width + 'px';
        previewContainer.style.height = height + 'px';
    },
    save() {
        Alpine.store('views').modalCallback?.(this.realCrop);
        this.closeModal();
    },
    cancel() {
        this.closeModal();
    },
    toggleAspectRatioLock() {
        this.aspectRatioLocked = !this.aspectRatioLocked;
    },
    resetCrop() {
        const crop = this.value.crop;
        crop.width = this.value.width;
        crop.height = crop.width / this.aspectRatio;
        if (crop.height > this.value.height) {
            crop.height = this.value.height;
            crop.width = crop.height * this.aspectRatio;
        }
        this.centerCropVertically();
        this.centerCropHorizontally();
        this.updateCropBox();
    },
    cropToImageSize() {
        this.value.crop.width = this.value.width;
        this.value.crop.height = this.value.height;
        this.value.crop.xOffset = 0;
        this.value.crop.yOffset = 0;
        this.updateCropBox();
    },
    centerCropVertically() {
        const {  height, crop } = this.value;
        crop.yOffset = (height - crop.height) / 2;
        this.updateCropBox();
    },
    centerCropHorizontally() {
        const { width, crop } = this.value;
        crop.xOffset = (width - crop.width) / 2;
        this.updateCropBox();
    },
    closeModal() {
        const views = Alpine.store('views');
        views.modalData = null;
        views.activeModal = null;
    },
    onPointerDown(event) {
        const target = event.target.dataset.mode
            ? event.target
            : this.snapshotTarget;
        const mode = target?.dataset.mode;
        if (!mode) return;
        event.preventDefault();
        event.stopPropagation();

        if (mode === 'move')
            this.cropBox.style.cursor = 'move';
        this.dragging = {
            mode,
            startX: event.clientX,
            startY: event.clientY,
            cropStart: { ...this.value.crop }
        };
        target.setPointerCapture(event.pointerId);
    },
    snapshot(target) {
        this.snapshotTarget = target;
        clearTimeout(this.snapshotTimeout);
        this.snapshotTimeout = setTimeout(() => {
            this.snapshotTarget = null;
        }, 250);
    },
    onPointerMove(event) {
        if (event.target.classList.contains('edge'))
            this.snapshot(event.target);
        if (!this.dragging) return;
        const { startX, startY, mode, cropStart } = this.dragging;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const modes = mode.split(' ');
        const options = {
            sizeAroundCenter: event.ctrlKey,
            keepAspectRatio: event.shiftKey || this.aspectRatioLocked
        };
        modes.forEach(mode => {
            const cropHandler = cropHandlers[mode];
            cropHandler?.(this.value.crop, cropStart, dx, dy, options);
        });
        this.clampCrop(mode === 'move');
        this.updateCropBox();
    },
    onPointerUp(event) {
        if (!this.dragging) return;
        event.target.releasePointerCapture(event.pointerId);
        event.stopPropagation();
        event.preventDefault();
        this.cropBox.style.cursor = 'initial';
        this.dragging = null;
    },
    onInput(event) {
        const input = event.target.closest('cm-inline-input');
        const cropKey = input?.dataset?.cropKey;
        if (!cropKey) return;
        const parsedValue = parseFloat(input.value) || 0;
        this.value.crop[cropKey] = parsedValue / this.value.scale;
        this.clampCrop();
        input.value = Math.round(this.value.crop[cropKey] * this.value.scale);
        this.updateCropBox();
    },
}));
