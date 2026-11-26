import './CardFace.js';
import '../autoFit/AutoFitLine.js';
import DOMBuilder from '../../../domain/card/DomBuilder.js';
import PendingWork from '../../../domain/card/PendingWork.js';

function delay(ms) {
    return new Promise(resolve => { setTimeout(resolve, ms); });
}

describe('Card face rendered()', () => {
    let element, face;

    beforeEach(() => {
        face = { id: 'front', dom: new DOMBuilder(), pendingWork: new PendingWork() };
        face.dom.setHTML('<auto-fit-line>Name</auto-fit-line>');
        element = document.createElement('cm-card-face');
        element.face = face;
        document.body.appendChild(element);
    });

    afterEach(() => element.remove());

    it('waits for module work that finishes after several frames', async () => {
        face.pendingWork.track(delay(100).then(() => {
            face.dom.root.classList.add('frame-token');
        }));
        await element.rendered();
        expect(face.dom.root.classList).toContain('frame-token');
    });

    it('refits auto-fit text when a card class changes its maximum size', async () => {
        const style = document.createElement('style');
        style.textContent = 'auto-fit-line { font-size: 12px; } '
            + '.frame-token auto-fit-line { font-size: 20px; }';
        element.shadowRoot.appendChild(style);
        await element.rendered();
        face.dom.root.classList.add('frame-token');
        await element.rendered();
        const line = face.dom.root.querySelector('auto-fit-line');
        expect(line.style.fontSize).toBe('20px');
    });
});
