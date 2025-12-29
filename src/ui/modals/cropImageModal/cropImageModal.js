import html from './cropImageModal.html.js';
import { registerModal } from '../modalManager.js';
import Modal from '../Modal.js';
import { morphHTML } from '../../../domain/template/morphHTML.js';

const L = localize('crop-image-modal');

export default class CropImageModal extends Modal {
    static id = 'cm-crop-image-modal';
    aspectRatioLocked = false;
    dragging = null;
    maxWidth = 600;
    maxHeight = 600;

    connectedCallback() {
        this.title = `${L`Crop Image`} (<span>${this.value.filename}</span>)`;
        this.realCrop = this.value.crop.clone();
        this.realWidth = this.value.width;
        this.realHeight = this.value.height;
        this.value.applyCoordinateSpace(this.maxWidth, this.maxHeight);
        this.render();
        this.bind();
        this.clampCrop();
        this.updatePreviewStyle();
        this.updatePreview();
    }

    bind() {
        super.bind();
        this.cropBox = this.querySelector('.crop-box');
        this.previewContainer = this.querySelector('.preview-container');
    }

    get onClick() {
        return {
            close: this.close,
            save: this.save
        };
    }

    get aspectRatio() {
        return this.data.aspectRatio;
    }

    get value() {
        return this.data.value;
    }

    updatePreview() {
        morphHTML(this.previewContainer, (
            `<crop-image crop-width="${this.realCrop.width}"
                        crop-height="${this.realCrop.height}"
                        offset-x="${this.realCrop.xOffset}"
                        offset-y="${this.realCrop.yOffset}"
                        src="${this.value.imageUrl}"></crop-image>`
        ));
    }

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
    }

    updatePreviewStyle() {
        let height = Math.min(this.maxHeight, this.value.height);
        let width = height * this.aspectRatio;
        if (width > this.maxWidth) {
            width = this.maxWidth;
            height = width / this.aspectRatio;
        }
        this.previewContainer.style.width = width + 'px';
        this.previewContainer.style.height = height + 'px';
    }

    renderActions() {
        return (
            `<sl-button data-click-action="save">${L`Save`}</sl-button>
             <sl-button data-click-action="close">${L`Cancel`}</sl-button>`
        );
    }

    renderBody() {
        return html;
    }

    render() {
        const actionsHTML = this.renderActions();
        this.innerHTML = (
            `<div class="modal">
                <div class="modal-title-bar">
                    <div>${this.title}</div>
                    <div class="close-modal">
                        <sl-icon name="x-lg" data-click-action="close"></sl-icon>
                    </div>
                </div>
                ${this.renderBody()}
                ${actionsHTML && (
                `<div class="modal-actions">${actionsHTML}</div>`
            )}
            </div>`
        );
    }

    save() {
        this.data.callback(this.realCrop);
        this.close();
    }
}

registerModal(CropImageModal);
