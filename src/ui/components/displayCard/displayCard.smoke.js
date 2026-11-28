import { selectCard } from '../../../domain/projects/projectManager.js';
import { executeAction } from '../../systems/actionSystem.js';
import {
    createCard, createTestProject, deleteTestProject, eventually, flushCard
} from '../../../shared/testing/testUtils.js';

describe('Card display', () => {
    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => { await deleteTestProject(); });

    it('exports both card faces at full size regardless of preview scale', async () => {
        await createCard();
        const card = selectedProjectCard;
        card.front.name = 'Front face';
        card.back = { name: 'Back face' };
        await selectCard(card);
        await flushCard();

        const preview = document.querySelector('cm-display-card');
        const anchorClick = spyOn(HTMLAnchorElement.prototype, 'click');
        const originalTransform = preview.canvas.style.transform;
        const exportsByWidth = [];
        try {
            for (const width of [375, 296]) {
                preview.canvas.style.transform = `scale(${width / 375})`;
                expect(preview.canvas.getBoundingClientRect().width).toBeCloseTo(width);
                anchorClick.calls.reset();
                await executeAction('export-card-image');
                const links = anchorClick.calls.all().map(call => call.object);
                expect(links.map(link => link.download)).toEqual([
                    `${card.baseName} - 0.png`, `${card.baseName} - 1.png`
                ]);
                exportsByWidth.push(links.map(link => link.href));
            }
        } finally {
            preview.canvas.style.transform = originalTransform;
        }

        const [fullPreview, narrowPreview] = exportsByWidth;
        expect(narrowPreview).toEqual(fullPreview);
        expect(fullPreview[0]).not.toBe(fullPreview[1]);
        for (const url of narrowPreview) {
            const image = new Image();
            image.src = url;
            await image.decode();
            expect([image.naturalWidth, image.naturalHeight]).toEqual([750, 1046]);
        }
    });

    it('switches faces with empty flavor text without resize loop errors', async () => {
        await createCard();
        selectedProjectCard.front.flavorText = '';
        selectedProjectCard.back = { flavorText: '' };
        await selectCard(selectedProjectCard);
        await flushCard();
        const form = document.querySelector('cm-card-form');
        for (const face of ['back', 'front']) {
            form.querySelector(`.toggle-face-${face}`).click();
            await new Promise(resolve => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            });
            expect(form.activeFaceId).toBe(face);
            const textarea = form.activeFaceElement.querySelector('sl-textarea');
            expect(textarea.value).toBe('');
            expect(textarea.input.getBoundingClientRect().height).toBeGreaterThan(0);
        }
    });

    it('grows and shrinks text fields with their content', async () => {
        await createCard();
        const field = document.querySelector(
            'cm-face-form[data-face-id="front"] form-field[field-id="flavorText"]'
        );
        field.toggleShow(true);
        const textarea = field.querySelector('sl-textarea');
        textarea.value = 'A short line.';
        await textarea.updateComplete;
        const input = textarea.input;
        const initialHeight = input.getBoundingClientRect().height;
        expect(initialHeight).toBeGreaterThan(0);
        expect(parseFloat(getComputedStyle(input).minBlockSize)).toBeGreaterThan(0);
        textarea.value = 'A line of flavor text.\n'.repeat(8);
        await textarea.updateComplete;
        await eventually(() => input.getBoundingClientRect().height > initialHeight);
        expect(input.scrollHeight).toBeLessThanOrEqual(input.clientHeight + 1);
        textarea.value = '';
        await textarea.updateComplete;
        await eventually(() => input.getBoundingClientRect().height === initialHeight);
    });
});
