import Alpine from 'alpinejs';
import html from './displayCard.html';
import { saveHTMLAsImage } from '../../gfx/imageProcessing';
import { registerAction } from '../../actionRegistry';

Alpine.data('displayCard', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.card = Alpine.store('views').activeCard;
        this.bindEvents();
        Alpine.initTree(this.$root);
    },

    bindEvents() {
        registerAction('export-card-image', this.exportCardImage);
    },

    async exportCardImage() {
        const cardNode = document.querySelector('.card-container');
        await saveHTMLAsImage(cardNode, 'card.png');
    }
}));
