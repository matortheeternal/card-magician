import Alpine from 'alpinejs';
import html from './displayCard.html';
import { saveHTMLAsImage } from '../../gfx/imageProcessing';
import { registerAction } from '../../services/actionRegistry.js';

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
            this.useFlip = Boolean(card?.model?.front && card?.model?.back);
        });
    },

    flipCard() {
        const cmCard = this.$root.querySelector('cm-card');
        cmCard.flip();
    },

    bindEvents() {
        registerAction('export-card-image', this.exportCardImage);
    },

    async exportCardImage() {
        const cardNode = this.$root.querySelector('cm-card');
        await saveHTMLAsImage(cardNode, 'card.png');
    }
}));
