import Alpine from 'alpinejs';
import html from './cropImageModal.html';

const cropHandlers = {
    'move': (crop, cropStart, dx, dy) => {
        crop.xOffset = cropStart.xOffset + dx;
        crop.yOffset = cropStart.yOffset + dy;
    },
    'resize-top': (crop, cropStart, dx, dy) => {
        crop.yOffset = cropStart.yOffset + dy;
        crop.height = cropStart.height - dy;
    },
    'resize-left': (crop, cropStart, dx) => {
        crop.xOffset = cropStart.xOffset + dx;
        crop.width = cropStart.width - dx;
    },
    'resize-right': (crop, cropStart, dx) => {
        crop.width = cropStart.width + dx;
    },
    'resize-bottom': (crop, cropStart, dx, dy) => {
        crop.height = cropStart.height + dy;
    }
}

Alpine.data('cropImageModal', () => ({
    aspectRatioLocked: false,
    dragging: null,
    async init() {
        this.$root.innerHTML = html;
        this.value = Alpine.store('views').modalData;
        this.realCrop = this.value.crop.clone();
        this.realWidth = this.value.width;
        this.realHeight = this.value.height;
        this.value.applyCoordinateSpace(600, 600);
        this.scalingFactor = (1 / this.value.scale).toFixed(2);
        this.clampCrop();
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.cropBox = this.$root.querySelector('.crop-box');
        this.updateCropBox();
        this.$root.addEventListener('pointerdown', this.onPointerDown);
        this.$root.addEventListener('pointermove', this.onPointerMove);
        this.$root.addEventListener('pointerup', this.onPointerUp);
        Alpine.initTree(this.$root);
    },
    updateCropBox() {
        const crop = this.value.crop;
        this.cropBox.style.top = `${crop.yOffset + 6}px`;
        this.cropBox.style.left = `${crop.xOffset + 6}px`;
        this.cropBox.style.width = `${crop.width}px`;
        this.cropBox.style.height = `${crop.height}px`;
    },
    clampCrop() {
        const crop = this.value.crop;
        const imgWidth = Math.min(this.value.width, 600);
        const imgHeight = Math.min(this.value.height, 600);
        crop.width = Math.min(Math.max(crop.width, 1), imgWidth);
        crop.height = Math.min(Math.max(crop.height, 1), imgHeight);
        const maxOffsetX = imgWidth - crop.width;
        const maxOffsetY = imgHeight - crop.height;
        crop.xOffset = Math.max(0, Math.min(crop.xOffset, maxOffsetX));
        crop.yOffset = Math.max(0, Math.min(crop.yOffset, maxOffsetY));
    },
    save() {
        const value = this.value.clone();
        value.removeCoordinateSpace();
        Alpine.store('views').modalCallback?.(value);
        this.closeModal();
    },
    cancel() {
        this.closeModal();
    },
    toggleAspectRatioLock() {
        this.aspectRatioLocked = !this.aspectRatioLocked;
    },
    resetCrop() {
        //TODO: default crop
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
        console.log('pointerdown', target);
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
        if (this.snapshotTarget) return;
        this.snapshotTarget = target;
        setTimeout(() => (this.snapshotTarget = null), 250);
    },
    onPointerMove(event) {
        if (event.target.dataset.mode)
            this.snapshot(event.target);
        if (!this.dragging) return;
        const dx = event.clientX - this.dragging.startX;
        const dy = event.clientY - this.dragging.startY;
        const modes = this.dragging.mode.split(' ');
        modes.forEach(mode => {
            const cropHandler = cropHandlers[mode];
            cropHandler?.(this.value.crop, this.dragging.cropStart, dx, dy);
        });
        this.clampCrop();
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
}));
