import Alpine from 'alpinejs';
import html from './displayCard.html';
import { saveHTMLAsImage } from '../../../domain/card/cardImageExporter.js';
import { registerAction } from '../../systems/actionSystem.js';

const L = localize('display-card');

Alpine.data('displayCard', () => ({
    useFlip: false,
    flipLabel: L`Turn over`,

    async init() {
        this.$root.innerHTML = html;
        this.setupFlip();
        this.bindEvents();
        Alpine.initTree(this.$root);
    },

    setupFlip() {
        Alpine.effect(() => {
            const card = Alpine.store('views').activeCard;
            this.useFlip = Boolean(card?.front && card?.back);
        });
    },

    flipCard() {
        const cmCard = this.$root.querySelector('cm-card');
        cmCard.flip();
    },

    bindEvents() {
        document.addEventListener('keydown', e => {
            if (e.key !== 'Alt') return;
            this.toggleShowEditable(true);
        });
        document.addEventListener('keyup', e => {
            if (e.key !== 'Alt') return;
            this.toggleShowEditable(false);
        });
        window.addEventListener('focus', () => this.toggleShowEditable(false));
        registerAction('export-card-image', () => this.exportCardImage());
    },

    toggleShowEditable(state) {
        if (this.showEditable === state) return;
        this.showEditable = state;
        document.body.classList.toggle('show-all-editable', this.showEditable);
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
