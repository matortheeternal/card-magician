import { emit } from '../../../shared/htmlUtils.js';
import EditableTooltip from '../editableTooltip/EditableTooltip.js';
import {
    createTooltipSimulation,
    initializeTooltipPositions
} from '../../systems/tooltipPositioningSystem.js';

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
        this.tooltips.forEach(tooltip => tooltip.remove());
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

    resolveAssociatedModel(element) {
        const moduleContainer = element.closest('module-container');
        const subcardId = moduleContainer.getAttribute('subcard');
        return subcardId ? this.face[subcardId] : this.face;
    }

    getAssociatedField(editable) {
        const fieldId = editable.getAttribute('field');
        const model = this.resolveAssociatedModel(editable);
        return model.fields.find(field => field.id === fieldId);
    }

    renderTooltips() {
        const editables = this.shadowRoot.querySelectorAll(
            'cm-editable-text, cm-editable-html, cm-editable-image'
        );
        editables.forEach(editable => {
            const field = this.getAssociatedField(editable);
            if (!field) return;
            const tooltip = new EditableTooltip(field, editable);
            this.tooltips.push(tooltip);
            tooltip.cacheRect();
        });
        initializeTooltipPositions(this.tooltips);
        this.sim = createTooltipSimulation(this.tooltips);
        this.sim.start();
    }

    render() {
        if (!this.#face?.dom) return;
        this.shadowRoot.innerHTML = '';
        this.classList.add(this.#face.id);
        this.shadowRoot.appendChild(this.#face.dom.root);
    }

    onFieldChanged(event) {
        const model = this.resolveAssociatedModel(event.target);
        const { fieldId, value } = event.detail;
        model[fieldId] = value;
    }
}

customElements.define('cm-card-face', DisplayCardFace);
