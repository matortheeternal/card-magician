import FieldElement from './fieldElement.js';
import { registerField } from '../../services/fieldElementRegistry.js';
import ImageValue from '../../services/ImageValue.js';
import { emit, esc, escapeHTML } from '../../utils.js';

function getBaseHTML(label) {
    return (
        `<label>${label}</label>
        <sl-card class="dropzone">
            <div class="upload-prompt"></div>
            <input type="file" hidden />
        </sl-card>`
    );
}

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

export default class ImageField extends FieldElement {
    static tagName = 'cm-image-select';
    eventKey = 'change';

    static matches(field) {
        return field.type === 'image';
    }

    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this.onClick);
    }

    render() {
        if (!this.field) return;
        this.innerHTML = getBaseHTML(this.field.label);
    }

    renderUploadPrompt() {
        return (
            `<div class="upload-prompt">
                <sl-icon name="image"></sl-icon>
                <div>Select image</div>
            </div>`
        );
    }

    renderPreview() {
        return (
            `<div class="preview">
                <div class="actions">
                    <sl-tooltip content="Clear selection">
                        <sl-icon-button class="clear-btn" name="x-lg"></sl-icon-button>
                    </sl-tooltip>
                    <sl-tooltip content="Crop image">
                        <sl-icon-button class="crop-btn" name="scissors"></sl-icon-button>
                    </sl-tooltip>
                </div>
                <sl-tooltip content="Click to change image">
                    <div class="preview-container">
                        <img class="preview-image" 
                             alt="Preview" 
                             src="${esc(this.value.imageUrl)}" />
                        <div class="crop-region"></div>
                    </div>
                </sl-tooltip>
                <div class="preview-name">${escapeHTML(this.value.filename)}</div>
            </div>`
        );
    }

    loadValue() {
        if (!this.value) return;
        const container = this.querySelector('div.upload-prompt, div.preview');
        container.outerHTML = this.value.imageUrl
            ? this.renderPreview()
            : this.renderUploadPrompt();
        if (this.value.imageUrl) updateCropRegion(
            this.value,
            this.querySelector('img.preview-image'),
            this.querySelector('div.crop-region')
        );
    }

    async getChangedValue(event) {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/'))
            return this.value;
        return await ImageValue.fromFile(file);
    }

    selectImage(event) {
        const dropzone = event.target.closest('sl-card.dropzone');
        if (!dropzone) return;
        const fileInput = this.querySelector('input[type="file"]');
        fileInput.click();
        return true;
    }

    clearImage(event) {
        if (!event.target.classList.contains('clear-btn')) return;
        event.stopPropagation();
        // TODO: could we get the file input and set its value to '' instead?
        this.value = new ImageValue();
        emit(this, 'cm-field-changed');
        return true;
    }

    cropImage(event) {
        if (!event.target.classList.contains('crop-btn')) return;
        event.stopPropagation();
        emit(this, 'open-modal', {
            modalKey: 'crop-image',
            data: this.value.clone(),
            callback: (newValue) => {
                this.value = newValue;
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
}

registerField(ImageField);
