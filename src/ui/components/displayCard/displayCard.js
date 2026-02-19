import ReactiveComponent from '../ReactiveComponent.js';
import html from './displayCard.html.js';
import { onActiveCardChanged } from '../../../domain/sets/setManager.js';
import { registerAction } from '../../systems/actionSystem.js';
import { saveHTMLAsImage } from '../../../domain/export/cardImageExporter.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';

export default class DisplayCard extends ReactiveComponent {
    useFlip = false;

    connectedCallback() {
        this.render();
        this.applyTransform();
        this.bind();
    }

    disconnectedCallback() {
        this.resizeObserver.disconnect();
    }

    get viewport() {
        return this.querySelector('.card-viewport');
    }

    get canvas() {
        return this.querySelector('.card-canvas');
    }

    get buttons() {
        return this.querySelector('.buttons-container');
    }

    get flipButton() {
        return this.querySelector('sl-button[data-click-action="flip"]');
    }

    get rotateButton() {
        return this.querySelector('sl-button[data-click-action="rotate"]');
    }

    applyTransform() {
        const scaleFactor = Math.min(1, this.viewport.offsetWidth / 375);
        this.canvas.style.transform = `scale(${scaleFactor})`;
    }

    bind() {
        this.resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(this.raf);
            this.raf = requestAnimationFrame(() => this.applyTransform());
        });
        this.handleEvents('click', {
            flip: this.flipCard,
            rotate: this.rotateCard
        });
        this.resizeObserver.observe(this.viewport);
        registerAction('export-card-image', () => this.exportCardImage());
        onActiveCardChanged((card) => {
            this.useFlip = Boolean(card?.front && card?.back);
            this.useRotate = Boolean(card?.front?.canRotate);
            toggleDisplay(this.useFlip || this.useRotate, this.buttons);
            toggleDisplay(this.useFlip, this.flipButton);
            toggleDisplay(this.useRotate, this.rotateButton);
            this.querySelector('cm-card').card = card;
            this.querySelector('cm-card-properties').card = card;
        });
    }

    flipCard() {
        this.querySelector('cm-card').flip();
    }

    rotateCard() {
        this.querySelector('cm-card').rotate();
    }

    render() {
        this.innerHTML = html;
    }

    exportCardImage() {
        const card = this.querySelector('cm-card');
        const cardFaces = card.querySelectorAll(`cm-card-face`);
        cardFaces.forEach((cardFace, index) => {
            saveHTMLAsImage(cardFace, `card${index}.jpg`);
        });
    }
}

customElements.define('cm-display-card', DisplayCard);
