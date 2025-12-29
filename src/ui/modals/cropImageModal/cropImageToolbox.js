import html from './toolbox.html.js';

const L = localize('crop-image-modal');

export default class CropImageToolbox extends HTMLElement {
    connectedCallback() {
        this.render();
        this.bind();
        this.updateAspectRatioButton();
    }

    get value() {
        return this.modal.value;
    }

    get aspectRatioLocked() {
        return this.modal.aspectRatioLocked;
    }

    set aspectRatioLocked(value) {
        this.modal.aspectRatioLocked = value;
        this.updateAspectRatioButton();
    }

    bindButtons() {
        return Array.from(this.querySelectorAll('sl-icon-button'))
            .reduce((buttons, element) => {
                buttons[element.dataset.clickAction] = element;
                const handler = this[element.dataset.clickAction];
                if (handler) element.addEventListener('click', handler.bind(this));
                return buttons;
            }, {});
    }

    bind() {
        this.modal = this.closest('cm-crop-image-modal');
        this.editor = this.modal.querySelector('cm-crop-image-editor');
        this.buttons = this.bindButtons();
    }

    toggleAspectRatioLock() {
        this.aspectRatioLocked = !this.aspectRatioLocked;
    }

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
        this.editor.updateCropBox();
    }

    cropToImageSize() {
        this.value.crop.width = this.value.width;
        this.value.crop.height = this.value.height;
        this.value.crop.xOffset = 0;
        this.value.crop.yOffset = 0;
        this.editor.updateCropBox();
    }

    centerCropVertically() {
        const { height, crop } = this.value;
        crop.yOffset = (height - crop.height) / 2;
        this.editor.updateCropBox();
    }

    centerCropHorizontally() {
        const { width, crop } = this.value;
        crop.xOffset = (width - crop.width) / 2;
        this.editor.updateCropBox();
    }

    updateAspectRatioButton() {
        const toggleButton = this.buttons.toggleAspectRatioLock;
        const tooltip = toggleButton.parentElement;
        toggleButton.setAttribute('name', this.aspectRatioLocked
            ? 'lock'
            : 'unlock');
        tooltip.setAttribute('content', this.aspectRatioLocked
            ? L`Unlock aspect ratio`
            : L`Lock aspect ratio`);
    }

    render() {
        this.innerHTML = html;
    }
}

customElements.define('cm-crop-image-toolbox', CropImageToolbox);
