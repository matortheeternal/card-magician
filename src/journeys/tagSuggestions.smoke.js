import * as history from '../ui/systems/historySystem.js';
import FieldInteractor, { CARD_PROPERTIES } from '../shared/testing/FieldInteractor.js';
import {
    createCard, createTestProject, deleteTestProject, flushCard, setCardFields
} from '../shared/testing/testUtils.js';
import { readCardData } from '../shared/testing/steps/disk.js';
import { filterCards, redo, undo } from '../shared/testing/steps/editMenu.js';
import { closeModal, getActiveModal, openModal } from '../ui/modals/modalManager.js';

const CARDS = [
    { name: 'Insight', manaCost: 'U', rulesText: 'Draw a card.' },
    { name: 'Second Wind', manaCost: '1U', rulesText: 'Draw a card. You gain 3 life.' }
];

async function addCards() {
    for (const fields of CARDS) {
        await createCard();
        await setCardFields(fields);
        await flushCard();
    }
    return [...activeProject.cards];
}

async function openSuggestions() {
    openModal('cm-tag-suggestions-modal');
    const modal = getActiveModal();
    expect(modal.isLoading).toBeTrue();
    expect(modal.applyButton.disabled).toBeTrue();
    await cmTest.eventually(() => !modal.isLoading);
    await customElements.whenDefined('sl-tree-item');
    return modal;
}

function tagItem(modal, tag) {
    const index = modal.tree.groups.findIndex(group => group.tag === tag);
    return modal.tree.tagItems[index];
}

async function toggleItem(item) {
    await item.updateComplete;
    await cmTest.click(item.shadowRoot.querySelector('[part="checkbox"]'));
}

describe('Tag suggestions', () => {
    beforeEach(async () => {
        await createTestProject();
        await history.reset();
    });

    afterEach(async () => {
        if (getActiveModal()) closeModal();
        await deleteTestProject();
    });

    it('applies suggestions by tag across cards in one undoable change', async () => {
        const [insight, secondWind] = await addCards();
        const modal = await openSuggestions();
        const { groups } = modal.tree;
        expect(groups.length).toBeGreaterThan(1);
        expect(groups[0].cards).toEqual([insight, secondWind]);
        const counts = groups.map(group => group.cards.length);
        expect(counts).toEqual([...counts].sort((a, b) => b - a));
        const shared = groups[0].tag;
        const skipped = groups.find(group => group.cards.length === 1).tag;
        expect(secondWind.tags).toEqual([]);

        await toggleItem(tagItem(modal, skipped));
        await cmTest.eventually(() => !tagItem(modal, skipped).selected);
        const total = counts.reduce((sum, count) => sum + count, 0);
        expect(modal.applyButton.textContent.trim()).toBe(`Add ${total - 1} tags`);
        await cmTest.click(modal.dismissCheckbox);
        await cmTest.click(modal.applyButton);
        await cmTest.eventually(() => !getActiveModal());

        expect(insight.tags).toContain(shared);
        expect(secondWind.tags).toContain(shared);
        expect(secondWind.tags).not.toContain(skipped);
        expect(secondWind.dismissedTags).toEqual([skipped]);
        const saved = await readCardData(secondWind);
        expect(saved.tags).toContain(shared);
        expect(saved.dismissedTags).toEqual([skipped]);
        const tags = new FieldInteractor('tags', { mode: CARD_PROPERTIES });
        expect(tags.fieldElement.appliedTags).toContain(shared);

        await undo();
        expect(insight.tags).toEqual([]);
        expect(Object.hasOwn(secondWind, 'dismissedTags')).toBeFalse();
        expect((await readCardData(secondWind)).tags ?? []).toEqual([]);
        expect(new FieldInteractor('tags', { mode: CARD_PROPERTIES })
            .fieldElement.appliedTags).toEqual([]);

        await redo();
        expect(insight.tags).toContain(shared);
        expect(secondWind.dismissedTags).toEqual([skipped]);
    });

    it('limits suggestions to the cards shown in the list', async () => {
        const [insight, secondWind] = await addCards();
        await filterCards('Insight');
        const modal = await openSuggestions();
        const shownCards = new Set(modal.tree.groups.flatMap(group => group.cards));
        expect([...shownCards]).toEqual([insight]);

        modal.scopeSelect.value = 'all';
        modal.scopeSelect.dispatchEvent(new Event('sl-change', { bubbles: true }));
        expect(modal.isLoading).toBeTrue();
        await cmTest.eventually(() => !modal.isLoading);
        const allCards = new Set(modal.tree.groups.flatMap(group => group.cards));
        expect(allCards).toEqual(new Set([insight, secondWind]));
        await filterCards('');
    });
});
