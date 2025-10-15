import { emit, show, hide, bindCustomDragEvents } from '../../utils';
import html from './imageSelect.html';

class ImageSelect extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'src', 'filename', 'size'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = html;
    this.bindElements();
    this.bindEvents();
    this.assignLabel();
    this.loadValue();
    this.applySize();
    this.updateFormControlClass();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.elements) return;
    if (name === 'label') {
      this._label = newValue;
      this.assignLabel();
    } else if (name === 'src' || name === 'filename') {
      this.loadValue();
    } else if (name === 'size') {
      this._size = newValue;
      this.applySize();
    }

    this.updateFormControlClass();
  }

  applySize() {
    if (!this.elements) return;
    const paddingValue = {
      small: 'var(--sl-spacing-small)',
      medium: 'var(--sl-spacing-medium)',
      large: 'var(--sl-spacing-large)',
    }[this._size] || 'var(--sl-spacing-medium)';
    this.elements.dropzone.style = `--padding: ${paddingValue}`;
  }

  loadValue() {
    const src = this.getAttribute('src');
    const filename = this.getAttribute('filename');
    if (src && filename)
      this.displayPreview(src, filename, true);
  }

  bindElements() {
    const query = (sel) => this.shadowRoot.querySelector(sel);
    this.elements = {
      formControl: query('div'),
      labelSlot: query('slot[name="label"]'),
      dropzone: query('.dropzone'),
      fileInput: query('.file-input'),
      preview: query('.preview'),
      previewImage: query('.preview-image'),
      previewName: query('.preview-name'),
      uploadPrompt: query('.upload-prompt'),
      removeBtn: query('.remove-btn'),
    };
  }

  bindEvents() {
    const { dropzone, fileInput, removeBtn } = this.elements;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
    removeBtn.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      this.clear();
    });

    bindCustomDragEvents(dropzone, {
      onDrop: (e) => this.handleFile(e.dataTransfer.files[0])
    })
  }

  assignLabel() {
    const { labelSlot } = this.elements;
    if (labelSlot.assignedNodes().length) return;
    if (this.hasAttribute('label'))
      labelSlot.textContent = this.getAttribute('label');
  }

  updateFormControlClass() {
    const formControlClasses = ['form-control'];
    if (this._label) formControlClasses.push('form-control--has-label');
    if (this._size) formControlClasses.push(`form-control--${this._size}`);
    this.elements.formControl.className = formControlClasses.join(' ');
  }

  displayPreview(image, filename = 'uploaded_file', skipEmit = false) {
    const { uploadPrompt, preview, previewImage, previewName } = this.elements;

    hide(uploadPrompt);
    show(preview);
    previewName.textContent = filename;
    previewImage.src = image;
    previewImage.hidden = false;

    if (!skipEmit) emit(this, 'input', { image, filename });
  }

  async handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/'))
      throw new Error('Failed to parse file image data.');

    const { uploadPrompt, preview, previewName } = this.elements;
    hide(uploadPrompt);
    show(preview);
    previewName.textContent = file.name;

    const reader = new FileReader();
    reader.onload = () => this.displayPreview(reader.result, file.name);
    reader.readAsDataURL(file);
  }

  clear() {
    const { preview, uploadPrompt, previewImage, previewName, fileInput } = this.elements;

    hide(preview);
    show(uploadPrompt);
    previewImage.src = '';
    previewImage.hidden = true;
    previewName.textContent = '';
    fileInput.value = '';

    emit(this, 'input', { image: null, filename: '' });
  }
}

customElements.define('image-select', ImageSelect);
