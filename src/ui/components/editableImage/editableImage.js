import { emit } from '../../../shared/htmlUtils.js';
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';

export default class EditableImage extends HTMLElement {
    constructor() {
        super();
        this.onControlsClick = this.onControlsClick.bind(this);
        this.onFileSelected = this.onFileSelected.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    connectedCallback() {
        this.createControls();
        this.createFileInput();
        this.addEventListener('focus', () => {
            if (this.doNotMoveFocus) {
                this.doNotMoveFocus = false;
                return;
            }
            this.controls.firstElementChild.focus();
        });
    }

    disconnectedCallback() {
        this.controls.remove();
    }

    get aspectRatio() {
        return parseFloat(this.getAttribute('aspect-ratio'));
    }

    get field() {
        return this.getAttribute('field');
    }

    get value() {
        const cropImage = this.querySelector('crop-image');
        return cropImage
            ? ImageFieldValue.fromElement(cropImage)
            : new ImageFieldValue();
    }

    set value(newValue) {
        emit(this, 'cm-field-changed', { fieldId: this.field, value: newValue });
    }

    renderControls() {
        return (
            `<sl-button size="small">Change</sl-button>` +
            `<sl-button size="small">Crop</sl-button>` +
            `<sl-button size="small">Clear</sl-button>`
        )
    }

    updateControlsPosition() {
        const rect = this.getBoundingClientRect();
        this.controls.style.left = rect.left + 'px';
        this.controls.style.top = rect.top + 'px';
        this.controls.style.width = rect.width + 'px';
        this.controls.style.height = rect.height + 'px';
    }

    createControls() {
        this.controls = document.createElement('div');
        this.controls.className = 'editable-image-controls';
        this.controls.tabIndex = -1;
        this.controls.innerHTML = this.renderControls();
        this.controls.addEventListener('click', this.onControlsClick);
        this.controls.addEventListener('keydown', this.onKeyDown);
        this.updateControlsPosition();
        document.body.appendChild(this.controls);
    }

    createFileInput() {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.value = '';
        this.fileInput.setAttribute('accept', 'image/*');
        this.fileInput.className = 'editable-image-input';
        this.fileInput.addEventListener('change', this.onFileSelected);
        this.controls.appendChild(this.fileInput);
    }

    clickedButton(event, label) {
        return event.target.tagName === 'SL-BUTTON'
            && event.target.textContent === label;
    }

    handleCropClick(event) {
        if (!this.clickedButton(event, 'Crop')) return;
        emit(this, 'open-modal', {
            modalKey: 'crop-image',
            data: {
                value: this.value,
                aspectRatio: this.aspectRatio
            },
            callback: crop => {
                const newValue = this.value.clone();
                newValue.crop = crop;
                this.value = newValue;
            }
        });
        return true;
    }

    handleChangeClick(event) {
        if (!this.clickedButton(event, 'Change')) return;
        this.fileInput.click();
        return true;
    }

    handleClearClick(event) {
        if (!this.clickedButton(event, 'Clear')) return;
        this.value = new ImageFieldValue();
        this.fileInput.value = '';
        return true;
    }

    onControlsClick(event) {
        return this.handleCropClick(event)
            || this.handleChangeClick(event)
            || this.handleClearClick(event);
    }

    async onFileSelected(event) {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        this.value = await ImageFieldValue.fromFile(file);
    }

    onKeyDown(event) {
        if (event.key !== 'Tab') return;
        const buttons = this.controls.querySelectorAll('sl-button');
        const firstButton = buttons[0];
        const lastButton = buttons[buttons.length - 1];
        const active = document.activeElement;
        if ((!event.shiftKey && lastButton === active) ||
            (event.shiftKey && firstButton === active)) {
            this.doNotMoveFocus = true;
            this.focus();
        }
    }
}

customElements.define('cm-editable-image', EditableImage);
