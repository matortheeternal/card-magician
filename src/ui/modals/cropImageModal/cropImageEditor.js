import html from './editor.html.js';
import { cropHandlers } from './cropHandlers.js';

const L = localize('crop-image-modal');

export default class CropImageEditor extends HTMLElement {
    dragging = null;
    aspectRatioLocked = false;

    constructor() {
        super();
        this.onInput = this.onInput.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
    }

    connectedCallback() {
        this.render();
        this.bind();
        this.updateRealCrop();
        this.updateImage();
        this.updateImageInfo();
        this.updateCropBox();
    }

    bind() {
        this.modal = this.closest('cm-crop-image-modal');
        this.image = this.querySelector('img');
        this.imageInfo = this.querySelector('.image-info');
        this.cropInfo = this.querySelector('.crop-info');
        this.cropBox = this.querySelector('.crop-box');
        this.addEventListener('input', this.onInput);
        this.addEventListener('pointerup', this.onPointerUp);
        this.addEventListener('pointerdown', this.onPointerDown);
        this.addEventListener('pointermove', this.onPointerMove);
    }

    get value() {
        return this.modal.value;
    }

    get realCrop() {
        return this.modal.realCrop;
    }

    updateRealCrop() {
        const crop = this.value.crop;
        const scale = this.value.scale;
        this.realCrop.width = Math.round(crop.width * scale);
        this.realCrop.height = Math.round(crop.height * scale);
        this.realCrop.xOffset = Math.round(crop.xOffset * scale);
        this.realCrop.yOffset = Math.round(crop.yOffset * scale);
        this.modal.updatePreview();
    }

    updateCropBox() {
        const crop = this.value.crop;
        this.cropBox.style.top = `${crop.yOffset + 6}px`;
        this.cropBox.style.left = `${crop.xOffset + 6}px`;
        this.cropBox.style.width = `${crop.width}px`;
        this.cropBox.style.height = `${crop.height}px`;
    }

    publishCrop() {
        this.updateCropBox();
        this.updateRealCrop();
        this.updateCropInfo();
    }

    updateImage() {
        this.image.src = this.value.imageUrl;
        this.image.width = this.value.width;
        this.image.height = this.value.height;
    }

    updateCropInfo() {
        const inputs = this.cropInfo.querySelectorAll('cm-inline-input');
        inputs.forEach(input => {
            input.value = this.realCrop[input.dataset.cropKey];
        });
    }

    updateImageInfo() {
        this.imageInfo.innerHTML = (
            `<span>${L`Image`}&nbsp;</span>
            <span>${this.modal.realWidth}</span>
            <span>x</span>
            <span>${this.modal.realHeight}</span>
            <span>, ${L`scaled to`}&nbsp;</span>
            <span>${this.value.width}</span>
            <span>x</span>
            <span>${this.value.height}</span>`
        );
    }

    render() {
        this.innerHTML = html;
    }

    snapshot(target) {
        this.snapshotTarget = target;
        clearTimeout(this.snapshotTimeout);
        this.snapshotTimeout = setTimeout(() => {
            this.snapshotTarget = null;
        }, 250);
    }

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
    }

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
        this.modal.clampCrop(mode === 'move');
        this.publishCrop();
    }

    onPointerUp(event) {
        if (!this.dragging) return;
        event.target.releasePointerCapture(event.pointerId);
        event.stopPropagation();
        event.preventDefault();
        this.cropBox.style.cursor = 'initial';
        this.dragging = null;
    }

    onInput(event) {
        const input = event.target.closest('cm-inline-input');
        const cropKey = input?.dataset?.cropKey;
        if (!cropKey) return;
        const parsedValue = parseFloat(input.value) || 0;
        this.value.crop[cropKey] = parsedValue / this.value.scale;
        this.modal.clampCrop();
        input.value = Math.round(this.value.crop[cropKey] * this.value.scale);
        this.publishCrop();
    }
}

customElements.define('cm-crop-image-editor', CropImageEditor);
