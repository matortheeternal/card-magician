import Alpine from 'alpinejs';
import html from './displayCard.html';
import { saveHTMLAsImage } from '../../../domain/card/cardImageExporter.js';
import { registerAction } from '../../systems/actionSystem.js';

Alpine.data('displayCard', () => ({
    useFlip: false,
    flipLabel: 'Turn over',

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
