import html from './cropImageModal.html.js';
import { registerModal } from '../modalManager.js';
import Modal from '../Modal.js';
import { morphHTML } from '../../../domain/template/morphHTML.js';
import { esc } from '../../../shared/htmlUtils.js';

const L = localize('crop-image-modal');

export default class CropImageModal extends Modal {
    static id = 'cm-crop-image-modal';
    maxWidth = 600;
    maxHeight = 600;

    connectedCallback() {
        this.title = `${L`Crop Image`} (<span>${esc(this.value.filename)}</span>)`;
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

    get onClickHandlers() {
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
        if (!this.previewContainer) return;
        morphHTML(this.previewContainer, (
            `<crop-image crop-width="${esc(this.realCrop.width)}"
                        crop-height="${esc(this.realCrop.height)}"
                        offset-x="${esc(this.realCrop.xOffset)}"
                        offset-y="${esc(this.realCrop.yOffset)}"
                        src="${esc(this.value.imageUrl)}"></crop-image>`
        ));
    }

    clampCrop(isMove = false) {
        const imgWidth = Math.min(this.value.width, this.maxWidth);
        const imgHeight = Math.min(this.value.height, this.maxHeight);
        this.value.crop.clamp(imgWidth, imgHeight, isMove);
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
