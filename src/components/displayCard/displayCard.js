import Alpine from 'alpinejs';
import html from './displayCard.html';
import { saveHTMLAsImage } from '../../gfx/imageProcessing';
import { registerAction } from '../../actionRegistry';

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
            card.useFlip = this.useFlip;
        });
    },

    flipCard() {
        const templateContainer = this.$root.querySelector('.template-container');
        if (templateContainer) templateContainer.classList.toggle('flipped');
    },

    bindEvents() {
        registerAction('export-card-image', this.exportCardImage);
    },

    async exportCardImage() {
        const cardNode = document.querySelector('.card-container');
        await saveHTMLAsImage(cardNode, 'card.png');
    }
}));
