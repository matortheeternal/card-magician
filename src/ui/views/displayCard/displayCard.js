import ReactiveComponent from '../../ReactiveComponent.js';
import html from './displayCard.html.js';
import { onActiveCardChanged } from '../../../domain/sets/setManager.js';
import { registerAction } from '../../systems/actionSystem.js';
import { saveHTMLAsImage } from '../../../domain/card/cardImageExporter.js';
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

    applyTransform() {
        const scaleFactor = Math.min(1, this.viewport.offsetWidth / 375);
        this.canvas.style.transform = `scale(${scaleFactor})`;
    }

    bind() {
        this.resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(this.raf);
            this.raf = requestAnimationFrame(() => this.applyTransform());
        });
        this.handleEvents('click', { flip: this.flipCard});
        this.resizeObserver.observe(this.viewport);
        registerAction('export-card-image', () => this.exportCardImage());
        onActiveCardChanged((card) => {
            this.useFlip = Boolean(card?.front && card?.back);
            toggleDisplay(this.useFlip, this.buttons);
            this.querySelector('cm-card').card = card;
            this.querySelector('cm-card-properties').card = card;
        });
    }

    flipCard() {
        this.querySelector('cm-card').flip();
    }

    render() {
        this.innerHTML = html;
    }

    exportCardImage() {
        const card = this.querySelector('cm-card');
        const cardFaces = card.querySelectorAll(`cm-card-face`);
        cardFaces.forEach((cardFace, index) => {
            const div = cardFace.shadowRoot.firstElementChild;
            saveHTMLAsImage(div, `card${index}.jpg`);
        });
    }
}

customElements.define('cm-display-card', DisplayCard);
