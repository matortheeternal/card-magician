import FieldComponent from './FieldComponent.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';
import { emit, toggleDisplay } from '../../../shared/htmlUtils.js';
import { openModal } from '../../modals/modalManager.js';
import imageFieldHtml from './imageField.html.js';

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

    bind() {
        super.bind();
        this.handleEvents('click', {
            clearImage: this.clearImage,
            selectImage: this.selectImage,
            cropImage: this.cropImage,
        });
    }

    static matches(field) {
        return field.type === 'image';
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

    render() {
        this.innerHTML = `<label>${this.field.label}</label>\n` + imageFieldHtml;
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

    selectImage() {
        const fileInput = this.querySelector('input[type="file"]');
        fileInput.click();
        return true;
    }

    clearImage(event) {
        event.stopPropagation();
        this.value = new ImageFieldValue();
        emit(this, 'cm-field-changed');
        return true;
    }

    cropImage(event) {
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
