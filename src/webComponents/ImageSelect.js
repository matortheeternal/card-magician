import FileSelectHTML from './ImageSelectHTML.js';

const imageExpr = /\.(png|jpg|jpeg|gif|webp)$/i;

class ImageSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.bindElements();
    this.bindEvents();

    const blobUrl = this.getAttribute('blob-url');
    const fileName = this.getAttribute('file-name') || 'uploaded_file';
    if (blobUrl) this.setPreview(blobUrl, fileName);
  }

  emit(name, detail = {}) {
    return this.dispatchEvent(
        new CustomEvent(name, {
          detail,
          bubbles: true,
          composed: true,
          cancelable: false
        })
    );
  }

  render() {
    this.shadowRoot.innerHTML = FileSelectHTML({
      label: this.getAttribute('label')
    });
  }

  bindElements() {
    this.dropzone = this.shadowRoot.querySelector('#dropzone');
    this.fileInput = this.shadowRoot.querySelector('#file-input');
    this.preview = this.shadowRoot.querySelector('#preview');
    this.previewImage = this.shadowRoot.querySelector('#preview-image');
    this.previewName = this.shadowRoot.querySelector('#preview-name');
    this.uploadPrompt = this.shadowRoot.querySelector('#upload-prompt');
    this.removeBtn = this.shadowRoot.querySelector('#remove-btn');
  }

  bindEvents() {
    this.dropzone.addEventListener('click', () => this.fileInput.click());

    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('dragover');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('dragover');
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      this.handleFile(file);
    });

    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      this.handleFile(file);
    });

    this.removeBtn.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      this.clear();
    });
  }

  async handleFile(file) {
    if (!file) return;

    this.uploadPrompt.style.display = 'none';
    this.preview.style.display = 'block';
    this.previewName.textContent = file.name;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage.src = reader.result;
        this.previewImage.hidden = false;
        this.emit('change', { image: reader.result, filename: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      this.previewImage.hidden = true;
    }
  }

  clear() {
    this.preview.style.display = 'none';
    this.uploadPrompt.style.display = 'block';
    this.previewImage.src = '';
    this.previewImage.hidden = true;
    this.previewName.textContent = '';
    this.fileInput.value = '';
    this.removeAttribute('blob-url');
    this.emit('change', { image: null, filename: '' });
  }

  setPreview(blobUrl, fileName = 'uploaded_file') {
    this.uploadPrompt.style.display = 'none';
    this.preview.style.display = 'block';
    this.previewName.textContent = fileName;

    if (blobUrl.startsWith('blob:') || imageExpr.test(fileName)) {
      this.previewImage.src = blobUrl;
      this.previewImage.hidden = false;
    } else {
      this.previewImage.hidden = true;
    }
  }

  static get observedAttributes() {
    return ['blob-url', 'file-name'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'blob-url' && newValue) {
      const fileName = this.getAttribute('file-name') || 'uploaded_file';
      this.setPreview(newValue, fileName);
    }
  }
}

customElements.define('image-select', ImageSelect);
