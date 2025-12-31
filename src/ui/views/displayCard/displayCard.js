import Alpine from 'alpinejs';
import html from './displayCard.html';
import { saveHTMLAsImage } from '../../../domain/card/cardImageExporter.js';
import { registerAction } from '../../systems/actionSystem.js';
import { watch } from '../../../shared/reactivity.js';

const L = localize('display-card');

Alpine.data('displayCard', () => ({
    useFlip: false,
    flipLabel: L`Turn over`,

    async init() {
        this.$root.innerHTML = html;
        this.applyTransform();
        this.setupFlip();
        this.bindEvents();
        Alpine.initTree(this.$root);
    },

    destroy() {
        this.resizeObserver.disconnect();
    },

    applyTransform() {
        const canvas = this.$root.querySelector('.card-canvas');
        const viewport = this.$root.querySelector('.card-viewport');
        if (!canvas || !viewport) return;
        const scaleFactor = Math.min(1, viewport.offsetWidth / 375);
        canvas.style.transform = `scale(${scaleFactor})`;
    },

    setupFlip() {
        watch(Alpine.store('views'), 'activeCard', () => {
            const card = Alpine.store('views').activeCard;
            this.useFlip = Boolean(card?.front && card?.back);
        });
    },

    flipCard() {
        const cmCard = this.$root.querySelector('cm-card');
        cmCard.flip();
    },

    bindEvents() {
        this.resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(this.raf);
            this.raf = requestAnimationFrame(() => this.applyTransform());
        });
        this.resizeObserver.observe(this.$root.querySelector('.card-viewport'));
        registerAction('export-card-image', () => this.exportCardImage());
    },

    exportCardImage() {
        const card = this.$root.querySelector('cm-card');
        const cardFaces = card.querySelectorAll(`cm-card-face`);
        cardFaces.forEach((cardFace, index) => {
            const div = cardFace.shadowRoot.firstElementChild;
            saveHTMLAsImage(div, `card${index}.jpg`);
        });
    }
}));
