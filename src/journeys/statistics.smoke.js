import FieldInteractor, { SETTINGS } from '../shared/testing/FieldInteractor.js';
import {
    createCard, createTestProject, deleteTestProject, eventually, flushCard,
    setCardFields
} from '../shared/testing/testUtils.js';
import { selectCards, selectedCards } from '../shared/testing/steps/cardList.js';
import { deleteSelectedCards } from '../shared/testing/steps/editMenu.js';
import { selectSettingsTab } from '../shared/testing/steps/settings.js';

const EMPTY_SELECTION = 'Select a chart row, column, or cell';

function workspaceTabs() {
    return document.querySelector('#workspace-tabs');
}

function statistics() {
    return document.querySelector('cm-project-stats');
}

function chart(report) {
    return statistics().querySelector(`cm-chart[report="${report}"]`);
}

async function openStatistics() {
    workspaceTabs().show('statistics');
    await eventually(() => statistics().checkVisibility()
        && chart('mana-curve').viewport?.firstElementChild);
    return statistics().cardsPanel;
}

async function addCard(fields) {
    await createCard();
    await setCardFields(fields);
    await flushCard();
    return selectedProjectCard;
}

async function setProjectIllustrator(name) {
    const modal = await cmTest.openSettings();
    await selectSettingsTab(modal, 'cm-magic-project-details');
    await new FieldInteractor('illustrator', { mode: SETTINGS }).setValue(name);
    await cmTest.closeSettings();
}

describe('Statistics', () => {
    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => {
        await cmTest.closeSettings();
        workspaceTabs().show('cards');
        await deleteTestProject();
    });

    async function buildSet() {
        const cards = [];
        const set = [
            {
                name: '<b>Chosen card</b>', manaCost: '1W',
                superType: 'Artifact Creature'
            },
            { name: 'Twin', manaCost: 'UU', superType: 'Instant', rarity: 'rare' },
            { name: 'Twin', manaCost: '2RG', superType: 'Creature', rarity: 'uncommon' },
            { name: 'Island', superType: 'Basic Land', rarity: 'land' },
            { name: 'Relic', manaCost: '3', superType: 'Artifact' }
        ];
        for (const fields of set) cards.push(await addCard(fields));
        return cards;
    }

    function listedNames(panel) {
        return [...panel.list.children].map(item => item.textContent);
    }

    async function selectFromMatrix(panel) {
        const matrix = chart('color-rarity');
        await eventually(() => matrix.viewport.querySelector('tbody td'));
        matrix.viewport.querySelector('tbody td').click();
        expect(panel.source.textContent).toBe('Color × rarity');
        expect(panel.group.textContent).toBe('Cell: White × Common');
        expect(panel.summary.textContent).toBe('1 card');
        expect(panel.list.textContent).toBe('<b>Chosen card</b>');
        expect(panel.list.querySelector('b')).withContext('names are text')
            .toBeNull();
        matrix.viewport.querySelector('tfoot td:last-child').click();
        expect(panel.group.textContent).toBe('All cards');
        expect(listedNames(panel))
            .toEqual(['<b>Chosen card</b>', 'Twin', 'Twin', 'Relic']);
    }

    function selectWithKeyboard(panel) {
        const mark = chart('mana-curve').querySelector('circle[data-category-index="2"]');
        const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        mark.dispatchEvent(enter);
        expect(panel.source.textContent).toBe('Mana curve by color');
        expect(panel.group.textContent).toBe('Cell: White × 2');
        panel.clearButton.click();
        expect(panel.list.children.length).toBe(0);
        expect(panel.emptyMessage.textContent).toContain(EMPTY_SELECTION);
    }

    async function openListedCard(panel, index, target) {
        chart('color-rarity').viewport.querySelector('tfoot td:last-child').click();
        panel.list.children[index].click();
        await document.querySelector('cm-card-list').flushSelection();
        await eventually(() => selectedProjectCard === target
            && activeEditorCard?.front.name === target.front.name
            && String(activeEditorCard.front.manaCost) === String(target.front.manaCost));
        expect(workspaceTabs().activeTab.panel).toBe('cards');
        expect(selectedCards()).toEqual([target]);
    }

    it('reviews a set and opens a card from a chart', async () => {
        const cards = await buildSet();
        const panel = await openStatistics();
        expect(panel.emptyMessage.textContent).toContain(EMPTY_SELECTION);
        await selectFromMatrix(panel);
        selectWithKeyboard(panel);
        await openListedCard(panel, 2, cards[2]);
    }, 30000);

    function missingCredits() {
        return chart('missing-art-credit').viewport
            .querySelector('[data-proportion-count]')?.textContent;
    }

    async function followProjectCredits() {
        await eventually(() => missingCredits() === '1 of 2');
        await setProjectIllustrator('Project artist');
        await eventually(() => missingCredits() === '0 of 2');
        await setProjectIllustrator('');
        await eventually(() => missingCredits() === '1 of 2');
    }

    async function followNewCards() {
        workspaceTabs().show('cards');
        await addCard({ name: 'Another', manaCost: 'G', superType: 'Creature' });
        await openStatistics();
        await eventually(() => missingCredits() === '2 of 3');
    }

    async function clearStaleSelection(panel) {
        chart('color-rarity').viewport.querySelector('tfoot td:last-child').click();
        expect(panel.list.children.length).toBe(3);
        workspaceTabs().show('cards');
        selectCards(activeProject.cards);
        await deleteSelectedCards();
        await openStatistics();
        expect(panel.emptyMessage.textContent).toContain(EMPTY_SELECTION);
        expect(panel.source.textContent).toBe('');
        expect(panel.clearButton.hidden).toBeTrue();
    }

    it('keeps statistics current as the set changes', async () => {
        await addCard({
            name: 'Credited', manaCost: 'W', superType: 'Creature',
            illustrator: 'Front artist'
        });
        await addCard({ name: 'Uncredited', manaCost: 'U', superType: 'Instant' });
        const panel = await openStatistics();
        await followProjectCredits();
        await followNewCards();
        await clearStaleSelection(panel);
    }, 30000);

    describe('regressions', () => {
        it('shows only its own tooltip over chart marks', async () => {
            await addCard({ name: 'Bear', manaCost: '1W', superType: 'Creature' });
            await openStatistics();
            const curve = chart('mana-curve');
            for (const [type, tag] of [['bar', 'rect'], ['line', 'circle']]) {
                curve.querySelector(`[data-chart-type="${type}"]`).click();
                const selector = `g ${tag}[data-category-index="2"]`;
                const mark = await eventually(() => {
                    return curve.viewport.querySelector(selector);
                });
                const tooltip = curve.viewport.querySelector('.stats-chart-tooltip');
                const svg = curve.viewport.querySelector('svg');
                mark.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
                expect(tooltip.hidden).withContext(type).toBeFalse();
                expect(tooltip.textContent).toContain('Mana value 2');
                expect(svg.querySelector('title')).withContext('native tooltip')
                    .toBeNull();
                svg.dispatchEvent(new PointerEvent('pointerleave'));
                expect(tooltip.hidden).toBeTrue();
            }
        });

        it('selects legendary cards from a proportion cell', async () => {
            await addCard({
                name: 'Leader', manaCost: 'W', superType: 'Legendary Creature'
            });
            await addCard({ name: 'Follower', manaCost: 'W', superType: 'Creature' });
            const panel = await openStatistics();
            const proportion = chart('legendary-permanents');
            proportion.querySelector('[data-chart-view="color"]').click();
            await eventually(() => proportion.data.cardCount === 2
                && proportion.viewport.querySelector('tbody tr'));
            const cells = proportion.viewport.querySelectorAll('tbody tr td');
            for (const index of [0, 2]) {
                cells[index].click();
                expect(panel.group.textContent).toBe('Cell: White × Legendary');
                expect(listedNames(panel)).toEqual(['Leader']);
            }
            cells[1].click();
            expect(listedNames(panel)).toEqual(['Leader', 'Follower']);
        });
    });
});
