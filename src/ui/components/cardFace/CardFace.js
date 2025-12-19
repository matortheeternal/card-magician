import { emit } from '../../../shared/htmlUtils.js';

export default class DisplayCardFace extends HTMLElement {
    #face;
    initialized = false;
    tooltips = [];

    constructor() {
        super();
        this.onInit = this.onInit.bind(this);
        this.renderTooltips = this.renderTooltips.bind(this);
        this.onFieldChanged = this.onFieldChanged.bind(this);
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (this.#face) this.render();
        this.shadowRoot.addEventListener('RenderScheduler:flushed', this.onInit);
        this.shadowRoot.addEventListener('cm-field-changed', this.onFieldChanged);
    }

    disconnectedCallback() {
        this.tooltips.forEach(tooltip => {
            tooltip.remove();
        });
    }

    onInit() {
        this.initialized = true;
        this.shadowRoot.removeEventListener('RenderScheduler:flushed', this.onInit);
        console.debug(`%ccard-face:initialized(%s)`, 'color:gold', this.#face.id);
        document.fonts.ready.then(this.renderTooltips);
        emit(this, 'card-face:initialized');
    }

    set face(value) {
        this.#face = value;
        if (this.isConnected) this.render();
    }

    get face() {
        return this.#face;
    }

    renderTooltips() {
        const editables = this.shadowRoot.querySelectorAll('cm-editable-text');
        editables.forEach(editable => {
            if (!editable.dataset.title) return;
            const tooltip = document.createElement('div');
            this.tooltips.push(tooltip);
            tooltip.textContent = editable.dataset.title;
            tooltip.className = 'editable-tooltip';
            const rect = editable.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = rect.bottom + 'px';
            document.body.appendChild(tooltip);
            editable.addEventListener('mouseenter', () => {
                if (editable.matches(':focus-visible')) return;
                tooltip.classList.add('show');
            });
            editable.addEventListener('focus', () => {
                tooltip.classList.remove('show');
            })
            editable.addEventListener('mouseout', () => {
                tooltip.classList.remove('show');
            });
        });
    }

    render() {
        if (!this.#face?.dom) return;
        this.shadowRoot.innerHTML = '';
        this.classList.add(this.#face.id);
        this.shadowRoot.appendChild(this.#face.dom.root);
    }

    onFieldChanged(event) {
        const moduleContainer = event.target.closest('module-container');
        const { fieldId, value } = event.detail;
        const subcardId = moduleContainer.getAttribute('subcard');
        const model = subcardId ? this.face[subcardId] : this.face;
        model[fieldId] = value;
    }
}

customElements.define('cm-card-face', DisplayCardFace);
