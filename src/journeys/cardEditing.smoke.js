import platform from '../shared/platformAdapter.js';
import FieldInteractor, { CARD_PROPERTIES } from '../shared/testing/FieldInteractor.js';
import ImageCrop from '../domain/card/ImageCrop.js';
import {
    createCard, createTestProject, deleteTestProject, expectCardData, flushCard,
    flushCardProperties, setCardFields, toggleFace
} from '../shared/testing/testUtils.js';
import { loadImageFixture, loadTextFixture } from '../shared/testing/steps/fixtures.js';
import { expectFileContent, readCardData } from '../shared/testing/steps/disk.js';
import { selectCard } from '../shared/testing/steps/cardList.js';
import { selectSettingsTab } from '../shared/testing/steps/settings.js';
import { reopenProject } from '../shared/testing/steps/projects.js';
import { tagManager } from '../domain/game/tagManager.js';

const RULES_TEXT = 'Flying\n\nIf a source you control would deal damage to an opponent, '
    + 'it deals double that damage instead.';

describe('Card editing', () => {
    let art, otherArt, blankCardData;

    beforeAll(async () => {
        art = await loadImageFixture('art.jpg');
        otherArt = await loadImageFixture('art2.jpg');
        blankCardData = await loadTextFixture('blank.yml');
    });

    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => {
        await activeGame.config.set('suggestOracleTags', false);
        await activeGame.config.set('highlightUnrecognizedRules', false);
        await deleteTestProject();
    });

    async function startBlankCard() {
        const card = await createCard();
        await setCardFields({ name: 'Test' });
        await setCardFields({ name: '' });
        await flushCard();
        expect(card.files.get('data')).toMatch(/cards\/blank.yml$/);
        const saved = await platform.readFile(card.files.get('data'));
        expect(saved).toEqualText(blankCardData);
        return card;
    }

    async function fillBothFaces() {
        await setCardFields({
            name: 'Sea Gate Restoration', manaCost: 'WUBRG', superType: 'Land',
            rulesText: RULES_TEXT, artImage: art
        });
        await setCardFields({ superType: 'Sorcery', subType: 'Lesson' });
        await toggleFace('back');
        await setCardFields(
            { name: 'Sea Gate, Reborn', artImage: art }, { faceKey: 'back' }
        );
        await setCardFields(
            { tags: ['tag-a', 'tag-b'], notes: 'test\nnotes\n\n123' },
            { mode: CARD_PROPERTIES }
        );
        await toggleFace('front');
        await flushCard();
        await flushCardProperties();
    }

    async function expectBothFacesSaved(card) {
        const data = await readCardData(card);
        expectCardData(data.front, {
            name: 'Sea Gate Restoration', manaCost: 'WUBRG', superType: 'Sorcery',
            subType: 'Lesson', rulesText: RULES_TEXT
        });
        expectCardData(data.back, { name: 'Sea Gate, Reborn' });
        expectCardData(data, { tags: ['tag-a', 'tag-b'], notes: 'test\nnotes\n\n123' });
        await expectFileContent(card.files.get('back.artImage'), art);
    }

    async function replaceAndCropFrontArt(card) {
        const field = new FieldInteractor('artImage', { faceKey: 'front' });
        await field.setValue(otherArt);
        await flushCard();
        await expectFileContent(card.files.get('front.artImage'), otherArt);
        field.fieldElement.setCrop(new ImageCrop(600, 400, 13, 26));
        await flushCard();
        const data = await readCardData(card);
        expectCardData(data.front.artImage.crop, {
            width: 600, height: 400, xOffset: 13, yOffset: 26
        });
    }

    async function clearFrontFace(card) {
        const imagePath = card.files.get('front.artImage');
        new FieldInteractor('artImage', { faceKey: 'front' }).clear();
        await setCardFields({
            name: '', manaCost: '', superType: '', subType: '', rulesText: ''
        });
        await flushCard();
        expect(await platform.checkFileExists(imagePath)).toBeFalse();
        expect(card.files.has('front.artImage')).toBeFalse();
        const data = await readCardData(card);
        expectCardData(data.front, {
            name: '', manaCost: '', superType: '', subType: '', rulesText: ''
        });
    }

    it('builds a two-faced card with art, tags and notes, and keeps it on disk',
       async () => {
           const card = await startBlankCard();
           await fillBothFaces();
           await expectBothFacesSaved(card);
           await expectFileContent(card.files.get('front.artImage'), art);
           await replaceAndCropFrontArt(card);

           const [reopened] = (await reopenProject()).cards;
           await expectBothFacesSaved(reopened);
           await expectFileContent(reopened.files.get('front.artImage'), otherArt);

           await selectCard(reopened);
           await clearFrontFace(reopened);
       }, 30000);

    it('uses global editor preferences and remembers accepted and dismissed suggestions',
       async () => {
           await createCard();
           const rulesText = 'Choose one —\n- Draw a card. (Invent {2} moons.)'
               + '\n- Invent {2} moons. Invent {2} moons.';
           await setCardFields({ manaCost: '1W', rulesText });
           const rules = new FieldInteractor('rulesText', { faceKey: 'front' });
           const tags = new FieldInteractor('tags', { mode: CARD_PROPERTIES });
           const editor = rules.fieldElement.editor;
           const suggestions = tags.fieldElement.suggestionsContainer;
           const marks = () => [...editor.querySelectorAll('.hljs-unrecognized')];
           expect(suggestions.hidden).toBeTrue();
           expect(marks()).toEqual([]);

           const workspace = await cmTest.openSettings();
           const editorPage = 'cm-magic-editor-settings';
           const settings = await selectSettingsTab(workspace, editorPage);
           const suggestToggle = '[data-setting="suggestOracleTags"]';
           await cmTest.click(settings.querySelector(suggestToggle));
           expect(getComputedStyle(suggestions).flexWrap).toBe('wrap');
           expect(marks()).toEqual([]);
           await cmTest.click(
               settings.querySelector('[data-setting="highlightUnrecognizedRules"]')
           );
           await cmTest.closeSettings();

           expect(editor.textContent).toBe(rulesText);
           expect(marks().map(mark => mark.textContent).join(''))
               .toBe('Invent {2} moonsInvent {2} moons');
           expect(editor.querySelectorAll('.hljs-symbol .hljs-unrecognized').length)
               .toBe(2);
           expect(getComputedStyle(marks()[0]).textDecorationStyle).toBe('wavy');

           await setCardFields({ manaCost: '2U' });
           expect(marks().map(mark => mark.textContent).join(''))
               .toBe('Invent {2} moonsInvent {2} moons');

           const suggestion = tag =>
               suggestions.querySelector(`[data-suggested-tag="${tag}"]`);
           expect(suggestion('draw')).toBeNull();
           await flushCard();
           const accept = suggestion('pure-draw').querySelector('[name="plus-lg"]');
           await cmTest.click(accept);
           await cmTest.eventually(async () => {
               const data = await readCardData(selectedProjectCard);
               return data?.tags?.includes('draw');
           });
           const status = document.querySelector('cm-floating-status');
           await cmTest.eventually(() => status.textContent.includes('Saved'));
           expect(activeGame.filter([selectedProjectCard], 'tag=draw'))
               .toEqual([selectedProjectCard]);
           const field = tags.fieldElement;
           expect(field.inheritedTagItems.hidden).toBeTrue();
           expect(field.inheritedToggle.textContent).toBe('Show inherited');
           expect(field.inheritedTagItems.nextElementSibling).toBe(field.inheritedToggle);
           await cmTest.click(field.inheritedToggle);
           expect(field.inheritedTagItems.hidden).toBeFalse();
           expect(field.inheritedTagItems.parentElement)
               .toBe(field.tagsContainer.parentElement);

           const inherited = field.inheritedTagItems.querySelector('sl-tag');
           expect(inherited.textContent).toBe('draw');
           await inherited.updateComplete;
           await cmTest.click(inherited.shadowRoot.querySelector('sl-icon-button'));
           const dismiss = suggestion('modal').querySelector('[name="x-lg"]');
           await cmTest.click(dismiss);
           await flushCardProperties();

           activeProject.suggestOracleTags = false;
           activeProject.highlightUnrecognizedRules = false;
           await activeProject.save();
           const project = await reopenProject();
           expect(project.suggestOracleTags).toBeUndefined();
           expect(project.highlightUnrecognizedRules).toBeUndefined();
           const config = activeGame.config;
           await config.flush();
           const stored = JSON.parse(await platform.getStoredData(config.key));
           expect(stored.suggestOracleTags).toBeTrue();
           expect(stored.highlightUnrecognizedRules).toBeTrue();
           const [card] = project.cards;
           expect(card.tags).toEqual(['pure-draw']);
           expect(card.dismissedTags).toEqual(['modal']);
           expect(card.excludedInheritedTags).toEqual(['draw']);
           expect(activeGame.filter(project.cards, 'tag=draw')).toEqual([]);
           await selectCard(card);
           expect(new FieldInteractor('manaCost', { faceKey: 'front' }).value).toBe('2U');
           expect(tags.fieldElement.suggestions).toEqual([]);
       });

    it('autodetects grouped reminders and saves mechanic editing and color affinity',
       async () => {
           await createCard();
           await activeGame.config.set('highlightUnrecognizedRules', true);
           await activeGame.config.set('suggestOracleTags', true);
           const reminder = 'When this creature enters, draw a card.';
           const variant = 'Create a Treasure token.';
           await setCardFields({
               name: 'Mist Singer',
               manaCost: '1U',
               rulesText: `Mistsong (${reminder})\nMistsong (${variant})\nGlimmer.`
           });
           await flushCard();
           const rules = new FieldInteractor('rulesText', { faceKey: 'front' });
           const editor = rules.fieldElement.editor;
           expect(editor.querySelectorAll('.hljs-unrecognized').length).toBe(3);

           const workspace = await cmTest.openSettings();
           const settings = await selectSettingsTab(workspace, 'cm-mechanic-settings');
           const scan = settings.querySelector('[data-click-action="scan"]');
           expect(settings.querySelector('[type="submit"]')).toBeNull();
           expect(scan.textContent).toBe('Autodetect');
           await cmTest.click(scan);
           expect(settings.list.activeRow.data.name).toBe('Mistsong');
           expect(settings.list.activeRow.data.type).toBe('Keyword ability');
           expect(editor.querySelectorAll('.hljs-unrecognized').length).toBe(1);
           const reminders = settings.querySelector('cm-reminder-texts');
           const reminderTexts = () => [...reminders.list.children]
               .map(row => row.querySelector(':scope > p').textContent);
           expect(reminderTexts()).toEqual([reminder, variant]);
           expect(reminders.querySelector('sl-textarea')).toBeNull();
           const typeSelects = [...reminders.querySelectorAll('.reminder-row sl-select')];
           expect(typeSelects.map(select => select.value)).toEqual(['static', 'static']);

           const blue = settings.querySelector('[data-color="U"]');
           expect(blue.dataset.tier).toBe('primary');
           await blue.updateComplete;
           const symbol = blue.querySelector('img').getBoundingClientRect();
           const button = blue.getBoundingClientRect();
           expect(symbol.y + symbol.height / 2)
               .toBeCloseTo(button.y + button.height / 2, 0);
           expect(symbol.x + symbol.width / 2)
               .toBeCloseTo(button.x + button.width / 2, 0);
           for (const tier of ['secondary', 'tertiary', 'none', 'primary', 'secondary']) {
               await cmTest.click(blue);
               expect(blue.dataset.tier).toBe(tier);
           }
           const action = name =>
               settings.querySelector(`[data-click-action="${name}"]`);
           const third = 'Gain 2 life.';
           const prompt = spyOn(dialog, 'prompt').and.resolveTo('Gain 1 life.');
           await cmTest.click(reminders.querySelector('[data-click-action="add"]'));
           await cmTest.eventually(() => reminderTexts().length === 3);
           prompt.and.resolveTo(third);
           await cmTest.click(reminders.querySelector(
               '.reminder-row:last-child [data-click-action="editReminder"]'
           ));
           expect(prompt.calls.mostRecent().args[1].defaultValue).toBe('Gain 1 life.');
           await cmTest.eventually(() => reminderTexts()[2] === third);
           const type = reminders.querySelector('.reminder-row:last-child sl-select');
           await expectTypeMenuAligned(type);
           type.value = 'granted';
           type.dispatchEvent(new Event('sl-change', { bubbles: true }));
           await cmTest.click(scan);
           expect(settings.list.rows.length).toBe(1);

           const variantRow = reminders.list.children[1];
           const replaceVariant = variantRow.querySelector(
               '[data-click-action="replaceReminder"]'
           );
           await cmTest.click(replaceVariant);
           expect(reminders.dialog.label).toBe('Replace reminder');
           reminders.operation.value = '1';
           await cmTest.click(reminders.applyButton);
           await cmTest.eventually(() => reminders.list.childElementCount === 2);
           expect(selectedProjectCard.front.rulesText).toContain(`Mistsong (${third})`);

           const addMechanic = action('newMechanic');
           await cmTest.click(addMechanic);
           const field = id =>
               settings.querySelector(`form-field[field-id="${id}"]`).fieldElement;
           field('kind').inputValue('actions');
           const actionReminders = field('reminders');
           expect(actionReminders.list.childElementCount).toBe(0);
           prompt.and.resolveTo('Draw a card.');
           await cmTest.click(actionReminders.querySelector('[data-click-action="add"]'));
           await cmTest.eventually(() => actionReminders.list.childElementCount === 1);
           field('name').inputValue('Glimmer');
           await cmTest.eventually(() => activeProject.customKeywordActions.length);
           const currentRules = new FieldInteractor('rulesText', { faceKey: 'front' });
           expect(currentRules.fieldElement.editor.querySelector('.hljs-unrecognized'))
               .toBeNull();
           expect(settings.list.activeRow.data.type).toBe('Keyword action');
           await cmTest.closeSettings();

           const project = await reopenProject();
           expect(project.customKeywords).toEqual([
               { name: 'Mistsong', reminder, reminders: [reminder, third],
                   tiers: { U: 'secondary' },
                   reminderTypes: { [reminder]: 'static', [third]: 'granted' } }
           ]);
           expect(project.customKeywordActions).toEqual([
               { name: 'Glimmer', reminder: 'Draw a card.' }
           ]);
           await selectCard(project.cards[0]);
           const tags = new FieldInteractor('tags', { mode: CARD_PROPERTIES });
           expect(tags.fieldElement.suggestions).toContain('cantrip');
       });

    async function expectTypeMenuAligned(select) {
        await select.updateComplete;
        select.scrollIntoView({ block: 'nearest' });
        await select.show();
        const anchor = select.shadowRoot.querySelector('[part="combobox"]');
        const menu = select.shadowRoot.querySelector('[part="listbox"]');
        await cmTest.eventually(() => {
            const control = anchor.getBoundingClientRect();
            const popup = menu.getBoundingClientRect();
            const gap = Math.min(Math.abs(popup.top - control.bottom),
                                 Math.abs(control.top - popup.bottom));
            return popup.width > 0 && Math.abs(control.left - popup.left) < 2 && gap < 8;
        });
        await select.hide();
    }

    it('matches tag styles and limits the initial suggestions', async () => {
        await createCard();
        const findTag = spyOn(tagManager, 'find').and.callThrough();
        findTag.withArgs('activated-ability').and.returnValue({
            text: 'activated-ability',
            variant: 'success'
        });
        findTag.withArgs('attack-trigger').and.returnValue(undefined);
        const rulesText = 'Flying, vigilance, trample'
            + '\nWhen this creature enters, draw a card.'
            + '\nWhenever this creature attacks, create a Treasure token.\n{T}: Add {G}.';
        await setCardFields({ superType: 'Creature', rulesText });
        await activeGame.config.set('suggestOracleTags', true);

        const field = new FieldInteractor('tags', { mode: CARD_PROPERTIES }).fieldElement;
        const tags = () => [...field.suggestionsContainer.querySelectorAll('sl-tag')];
        expect(tags().length).toBe(6);
        expect(tags()[0].dataset.tagStyle).toBe('green');
        expect(tags()[1].dataset.tagStyle).toBe('red');
        expect(tags()[0].firstElementChild.name).toBe('plus-lg');
        expect(tags()[0].lastElementChild.name).toBe('x-lg');

        await cmTest.click(field.suggestionToggle);
        expect(tags().length).toBe(field.suggestions.length);
        expect(tags().length).toBeGreaterThan(6);
        await cmTest.click(field.suggestionToggle);
        expect(tags().length).toBe(6);
    });

    it('moves Oracle tags between styles and persists catalog removals', async () => {
        await createCard();
        await setCardFields({ rulesText: 'Draw a card.' });
        await setCardFields({ tags: ['project-label'] }, { mode: CARD_PROPERTIES });
        await activeGame.config.set('suggestOracleTags', true);

        const originalTags = structuredClone(tagManager.collection);
        try {
            await exerciseTagCatalog();
        } finally {
            tagManager.collection = originalTags;
            changed(tagManager, 'tags');
            tagManager.scheduleSave();
            await tagManager.flush();
            await cmTest.closeSettings();
        }
    });

    async function exerciseTagCatalog() {
        const tabs = document.querySelector('#workspace-tabs');
        const workspace = tabs.querySelector('cm-settings-workspace');
        await cmTest.click(tabs.querySelector('sl-tab[panel="settings"]'));
        await cmTest.eventually(() => workspace.activeNavItem);
        const settings = await selectSettingsTab(workspace, 'cm-edit-tags');
        const board = settings.board;
        const pureDraw = () => board.querySelector('[data-tag="pure-draw"]');
        const suggestions = document.querySelector('cm-card-properties cm-tags');
        expect(settings.projectOnlyToggle.checked).toBeTrue();
        expect([...board.querySelectorAll('[data-tag]')].map(chip => chip.dataset.tag))
            .toEqual(['project-label']);
        await cmTest.click(settings.projectOnlyToggle);
        expect(pureDraw().dataset.tagStyle).toBe('teal');
        expect(getComputedStyle(board.groups).columnWidth).not.toBe('auto');
        const items = pureDraw().parentElement;
        expect(getComputedStyle(items).overflowY).toBe('visible');
        await cmTest.click(settings.projectOnlyToggle);
        expect(pureDraw()).toBeNull();
        await cmTest.click(settings.projectOnlyToggle);
        const dataTransfer = new DataTransfer();
        pureDraw().dispatchEvent(
            new DragEvent('dragstart', { bubbles: true, dataTransfer })
        );
        board.querySelector('[data-style-group="amber"]').dispatchEvent(
            new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer })
        );
        expect(pureDraw().dataset.tagStyle).toBe('amber');
        const chip = suggestions.querySelector('[data-suggested-tag="pure-draw"]');
        expect(chip.dataset.tagStyle).toBe('amber');
        await chip.updateComplete;
        const base = chip.shadowRoot.querySelector('[part="base"]');
        expect(getComputedStyle(base).borderTopWidth).toBe('2px');

        await cmTest.click(pureDraw().querySelector('[data-click-action="selectTag"]'));
        board.styleSelect.value = 'blue';
        board.styleSelect.emit('sl-change');
        expect(pureDraw().dataset.tagStyle).toBe('blue');

        spyOn(dialog, 'confirm').and.resolveTo(true);
        await cmTest.click(pureDraw().querySelector('[data-click-action="removeTag"]'));
        await cmTest.eventually(() => !pureDraw());
        expect(suggestions.suggestions).toEqual(['draw']);
        await tagManager.flush();
        await tagManager.load();
        expect(tagManager.find('pure-draw').variant).toBe('blue');
        expect(tagManager.find('pure-draw').hidden).toBeTrue();
    }

    it('keeps the current image source after saving and cropping', async () => {
        await createCard();
        const field = new FieldInteractor('artImage', { faceKey: 'front' });
        await field.setValue(art);
        const firstImageUrl = field.value.imageUrl;
        await flushCard();
        await field.setValue(otherArt);
        const currentImageUrl = field.value.imageUrl;
        expect(currentImageUrl).toMatch(/^blob:/);
        expect(currentImageUrl).not.toBe(firstImageUrl);
        await flushCard();

        const cardFace = document.querySelector('cm-display-card cm-card-face.front');
        const rendered = new Promise(resolve => {
            cardFace.shadowRoot.addEventListener(
                'RenderScheduler:flushed', resolve, { once: true }
            );
        });
        field.fieldElement.setCrop(new ImageCrop(600, 400, 13, 26));
        await rendered;
        await flushCard();

        expect(field.value.imageUrl).toBe(currentImageUrl);
        const cropImage = cardFace.shadowRoot.querySelector('crop-image');
        expect(cropImage.getAttribute('src')).toBe(currentImageUrl);
    });

    it('shows the last selected card when selections pile up during a save', async () => {
        const first = await createCard();
        const last = await createCard();
        const intermediate = await createCard();
        const cardList = document.querySelector('cm-card-list');
        await cardList.flushSelection();
        let releaseSave, saveStarted;
        const saveGate = new Promise(resolve => { releaseSave = resolve; });
        const started = new Promise(resolve => { saveStarted = resolve; });
        const form = document.querySelector('cm-card-form');
        const save = form.save;
        form.save = Object.assign((...args) => save(...args), {
            flush: async () => {
                saveStarted();
                await saveGate;
                await save.flush();
            },
            cancel: () => save.cancel()
        });
        const displayed = [];
        spyOn(cardList, 'updateStatus').and.callFake(() => {
            displayed.push(window.selectedProjectCard);
        });
        try {
            cardList.listView.revealRow(first);
            await started;
            cardList.listView.revealRow(intermediate);
            cardList.listView.revealRow(last);
            const settled = cardList.flushSelection();
            expect(window.selectedProjectCard).toBe(intermediate);
            releaseSave();
            await settled;
            expect(window.selectedProjectCard).toBe(last);
            expect(displayed).toEqual([last]);
        } finally {
            releaseSave();
            await cardList.flushSelection();
            form.save = save;
        }
    });
});
