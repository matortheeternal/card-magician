import { selectCard } from '../../../domain/projects/projectManager.js';
import {
    createCard, createTestProject, deleteTestProject, eventually, flushCard
} from '../../../shared/testing/testUtils.js';

describe('Card display', () => {
    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => { await deleteTestProject(); });

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
