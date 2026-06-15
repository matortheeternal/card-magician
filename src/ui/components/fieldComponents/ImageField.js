import FieldComponent from './FieldComponent.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';
import { emit, esc, toggleDisplay } from '../../../shared/htmlUtils.js';
import { openModal } from '../../modals/modalManager.js';

function computePreviewSize(srcW, srcH, maxW, maxH) {
    const widthRatio = maxW / srcW;
    const heightRatio = maxH / srcH;
    const scale = Math.min(widthRatio, heightRatio, 1);

    return { prevW: srcW * scale, prevH: srcH * scale };
}

function getPreviewConstraints(imgEl) {
    const style = getComputedStyle(imgEl);
    const maxW = parseFloat(style.maxWidth);
    const maxH = parseFloat(style.maxHeight);

    return {
        maxWidth: isNaN(maxW) ? Infinity : maxW,
        maxHeight: isNaN(maxH) ? Infinity : maxH,
    };
}

function updateCropRegion(value, previewImgEl, cropRegion) {
    const { width: srcW, height: srcH } = value;
    const { maxWidth, maxHeight } = getPreviewConstraints(previewImgEl);
    const { prevW, prevH } = computePreviewSize(srcW, srcH, maxWidth, maxHeight);
    const xFactor = prevW / srcW;
    const yFactor = prevH / srcH;
    const srcCropW = Number(value.crop.width) || srcW;
    const srcCropH = Number(value.crop.height) || srcH;
    const srcX = Number(value.crop.xOffset) || 0;
    const srcY = Number(value.crop.yOffset) || 0;
    cropRegion.style.setProperty('width', `${srcCropW * xFactor}px`);
    cropRegion.style.setProperty('height', `${srcCropH * yFactor}px`);
    cropRegion.style.setProperty('left', `${srcX * xFactor}px`);
    cropRegion.style.setProperty('top', `${srcY * yFactor}px`);
}

export default class ImageField extends FieldComponent {
    static tagName = 'cm-image-select';
    eventKey = 'change';

    static matches(field) {
        return field.type === 'image';
    }

    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
    }

    get value() {
        return super.value;
    }

    set value(newValue) {
        const oldImageUrl = this.value?.imageUrl;
        if (oldImageUrl)
            setTimeout(() => URL.revokeObjectURL(oldImageUrl), 500);
        this.model[this.field.id] = newValue;
        changed(this.model, this.field.id);
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this.onClick);
        this.addEventListener('dragover', event => this.onDragOver(event));
        this.addEventListener('drop', event => this.onDrop(event));
    }

    renderPreview() {
        return (
            `<div class="actions">
                <sl-tooltip content="Remove image">
                    <sl-icon-button class="clear-btn" name="x-lg"></sl-icon-button>
                </sl-tooltip>
                <sl-tooltip content="Crop image">
                    <sl-icon-button class="crop-btn" name="scissors"></sl-icon-button>
                </sl-tooltip>
            </div>
            <sl-tooltip content="Click to change image">
                <div class="preview-container">
                    <img class="preview-image" alt="Preview" />
                    <div class="crop-region"></div>
                </div>
            </sl-tooltip>`
        );
    }

    render() {
        this.innerHTML = (
            `<label>${this.field.label}</label>
            <sl-card class="dropzone">
                <div class="upload-prompt">
                    <sl-icon name="image"></sl-icon>
                    <div>Select image</div>
                </div>
                <div class="preview" style="display: none">
                    ${this.renderPreview()}
                </div>
                <input type="file" hidden />
            </sl-card>`
        );
        requestAnimationFrame(() => this.loadValue());
    }

    loadValue() {
        if (!this.value) return;
        const prompt = this.querySelector('.upload-prompt');
        const preview = this.querySelector('.preview');
        const hasImage = this.value?.imageUrl;
        toggleDisplay(hasImage, preview, prompt);
        if (!hasImage) return;

        const img = preview.querySelector('img.preview-image');
        const cropRegion = preview.querySelector('div.crop-region');
        img.setAttribute('src', this.value.imageUrl);
        updateCropRegion(this.value, img, cropRegion);
    }

    async getChangedValue(event) {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/'))
            return this.value;
        return ImageFieldValue.fromFile(file);
    }

    selectImage(event) {
        const previewContainer = event.target.closest('div.preview-container');
        if (!previewContainer) return;
        const fileInput = this.querySelector('input[type="file"]');
        fileInput.click();
        return true;
    }

    clearImage(event) {
        if (!event.target.classList.contains('clear-btn')) return;
        event.stopPropagation();
        this.value = new ImageFieldValue();
        emit(this, 'cm-field-changed');
        return true;
    }

    cropImage(event) {
        if (!event.target.classList.contains('crop-btn')) return;
        event.stopPropagation();
        openModal('cm-crop-image-modal', {
            value: this.value.clone(),
            aspectRatio: this.field.aspectRatio,
            callback: (newValue) => {
                this.value.crop = newValue;
                changed(this.model, this.field.id);
                emit(this, 'cm-field-changed');
            }
        });
        return true;
    }

    onClick(event) {
        return this.clearImage(event)
            || this.cropImage(event)
            || this.selectImage(event);
    }

    canDrop(event) {
        return Array.from(event.dataTransfer.items)
            .some(item => item.kind === 'file' && item.type.startsWith('image'));
    }

    onDragOver(event) {
        event.dataTransfer.dropEffect = this.canDrop(event) ? 'move' : 'none';
        event.preventDefault();
        event.stopPropagation();
    }

    async onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const item = Array.from(event.dataTransfer.items).find(item => {
            return item.kind === 'file' && item.type.startsWith('image');
        });
        this.value = await ImageFieldValue.fromFile(item.getAsFile());
        emit(this, 'cm-field-changed');
    }
}

registerField(ImageField);
