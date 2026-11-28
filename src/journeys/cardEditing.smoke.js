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
import { searchTags, tagManager } from '../domain/game/tagManager.js';
import { redo, undo } from '../shared/testing/steps/editMenu.js';

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
           await cmTest.eventually(() =>
               marks().map(mark => mark.textContent).join('')
               === 'Invent {2} moonsInvent {2} moons');
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
           expect(field.inheritedToggle.getAttribute('aria-label'))
               .toBe('Show 1 inherited tag');
           const { inheritedTooltip, inheritedTagItems } = field;
           expect(inheritedTooltip.nextElementSibling).toBe(inheritedTagItems);
           await cmTest.click(field.inheritedToggle);
           expect(field.inheritedTagItems.hidden).toBeFalse();
           expect(field.inheritedToggle.getAttribute('aria-label'))
               .toBe('Hide inherited tags');
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

    it('opens an interactive warning for rules text and mana cost', async () => {
        await createCard();
        await setCardFields({
            manaCost: '{W/U}{B/R}',
            rulesText: 'When this enters the battlefield, draw a card.'
        });
        const rules = new FieldInteractor('rulesText', { faceKey: 'front' });
        const mana = new FieldInteractor('manaCost', { faceKey: 'front' });
        const wording = () =>
            rules.fieldElement.editor.querySelector('.inspection-highlight');
        const warning = () => mana.fieldElement.inspectionButton;
        const popup = document.querySelector('cm-card-form cm-inspection-popup');
        const highlighted = await cmTest.eventually(wording);
        const background = getComputedStyle(highlighted).backgroundColor;
        expect(background).not.toBe('rgba(0, 0, 0, 0)');
        await cmTest.click(await cmTest.eventually(warning));
        expect(popup.textContent).toContain('different hybrid symbols');
        popup.close();

        highlighted.dispatchEvent(new PointerEvent('pointerover', {
            bubbles: true, clientX: window.innerWidth - 1, clientY: window.innerHeight - 1
        }));
        expect(popup.matches(':popover-open')).toBeTrue();
        expect(getComputedStyle(popup).fontFamily)
            .toBe(getComputedStyle(document.body).fontFamily);
        expect(popup.textContent).toContain('is now written');
        const fix = popup.querySelector('sl-button');
        await fix.updateComplete;
        await cmTest.eventually(() => {
            const { left, right, top, bottom } = popup.getBoundingClientRect();
            const anchor = highlighted.getBoundingClientRect();
            const { clientWidth, clientHeight } = document.documentElement;
            const below = top >= anchor.bottom;
            const above = bottom <= anchor.top;
            return left >= 0 && right <= clientWidth
                && (below || above) && top >= 0 && bottom <= clientHeight;
        });
        const bubbledClick = jasmine.createSpy('bubbled popup click');
        const form = popup.closest('cm-card-form');
        form.addEventListener('click', bubbledClick);
        await cmTest.click(fix);
        form.removeEventListener('click', bubbledClick);
        expect(bubbledClick).not.toHaveBeenCalled();
        expect(rules.fieldElement.editor.textContent)
            .toBe('When this enters, draw a card.');
        await setCardFields({ manaCost: '{U}' });
        await cmTest.eventually(() => !wording() && !warning());
        await flushCard();
    });

    it('persists an ignored occurrence and restores it without hiding other matches',
       async () => {
           const card = await createCard();
           const first = 'When this creature enters the battlefield, draw a card.';
           await setCardFields({ name: 'Witness', manaCost: '{U}', rulesText: first });
           await flushCard();
           const rules = new FieldInteractor('rulesText', { faceKey: 'front' });
           const mark = () =>
               rules.fieldElement.editor.querySelector('.inspection-highlight');
           const popup = document.querySelector('cm-card-form cm-inspection-popup');
           (await cmTest.eventually(mark)).dispatchEvent(new PointerEvent('pointerover', {
               bubbles: true, clientX: 100, clientY: 100
           }));
           const ignore = [...popup.querySelectorAll('footer sl-button')].find(button =>
               button.textContent === 'Ignore this occurrence');
           await cmTest.click(ignore);
           await cmTest.eventually(() => !mark());
           await flushCard();
           expect((await readCardData(card)).ignoredInspections.length).toBe(1);

           const second = 'When another creature enters the battlefield, draw a card.';
           await setCardFields({ rulesText: `${first}\n${second}` });
           await cmTest.eventually(mark);
           expect(document.querySelector('.ignored-inspections')).toBeNull();
           const listToggle = document.querySelector('.status-bar sl-icon-button');
           await cmTest.click(listToggle);
           const panel = document.querySelector('cm-project-inspections');
           expect(panel.resultsTree.children.length).toBe(1);
           await cmTest.click(panel.ignoredButton);
           const ignored = panel.resultsTree.lastElementChild;
           const finding = await cmTest.eventually(() =>
               ignored.querySelector('.problem-finding'));
           expect(ignored.querySelector('.problem-branch-label').textContent)
               .toBe('Ignored (1)');
           expect(panel.ignoredButton.name).toBe('eye-slash');
           const collapse = panel.querySelector('[data-click-action="collapseProblems"]');
           await cmTest.click(collapse);
           expect(ignored.expanded).toBeFalse();
           const expand = panel.querySelector('[data-click-action="expandProblems"]');
           await cmTest.click(expand);
           expect(ignored.expanded).toBeTrue();
           await cmTest.click(finding);
           expect(panel.inspectionPopup.firstAction.textContent).toBe('Restore finding');
           await cmTest.click(panel.inspectionPopup.firstAction);
           await cmTest.eventually(() => !ignored.querySelector('.problem-finding'));
           expect(ignored.querySelector('.text-muted').textContent).toBe('(0)');
           await cmTest.click(panel.ignoredButton);
           expect(panel.resultsTree.children.length).toBe(1);
           expect(panel.ignoredButton.name).toBe('eye');
           await cmTest.click(listToggle);
           await flushCard();
           expect((await readCardData(card)).ignoredInspections).toBeUndefined();
       });

    it('keeps project results open when selecting a finding', async () => {
        const flagged = await createCard();
        await setCardFields({
            name: 'Flagged',
            manaCost: '{U}',
            rulesText: 'When this enters the battlefield, draw a card.\n'
                + 'Create a Treasure token.'
        });
        await flushCard();
        const other = await createCard();
        expect(selectedProjectCard).toBe(other);
        const panel = document.querySelector('cm-project-inspections');
        const toggle = document.querySelector('.status-bar sl-icon-button');
        const split = panel.parentElement;
        expect(panel.hidden).toBeTrue();
        expect(split.position).toBe(100);
        const icon = () => toggle.shadowRoot?.querySelector('sl-icon');
        await cmTest.eventually(() => icon()?.shadowRoot?.querySelector('svg'));
        await cmTest.click(toggle);
        expect(split.vertical).toBeTrue();
        expect(split.disabled).toBeFalse();
        await cmTest.click(panel.scanButton);
        const result = await cmTest.eventually(() =>
            [...panel.querySelectorAll('.problem-finding')].find(item =>
                item.textContent.includes('enters the battlefield')));
        const label = result.firstElementChild;
        expect(label.hasAttribute('title')).toBeFalse();
        const cardGroup = result.parentElement;
        expect(cardGroup.querySelector('span').textContent).toBe('Flagged');
        expect(cardGroup.querySelector('img').src).toContain('/single/u.png');
        const inspection = cardGroup.parentElement;
        expect(inspection.firstChild.textContent).toBe('“Enters the battlefield”');
        expect(inspection.parentElement.firstChild.textContent).toBe('Outdated wording');
        expect(inspection.parentElement.parentElement.firstChild.textContent)
            .toBe('Templating');
        await cmTest.click(inspection);
        const workspace = document.querySelector('cm-settings-workspace');
        const settings = workspace.contentContainer.firstElementChild;
        expect(settings.tree.selectedId).toBe('wording-enters-the-battlefield');
        await cmTest.closeSettings();

        const popup = panel.inspectionPopup;
        split.position = 30;
        await split.updateComplete;
        result.scrollIntoView({ block: 'start' });
        await cmTest.click(result);
        expect(selectedProjectCard).toBe(other);
        expect(popup.matches(':popover-open')).toBeTrue();
        await cmTest.eventually(() => {
            const row = result.getBoundingClientRect();
            const bounds = popup.getBoundingClientRect();
            return bounds.top >= row.bottom && bounds.bottom <= window.innerHeight;
        });
        popup.close();
        split.position = 85;
        await split.updateComplete;
        result.scrollIntoView({ block: 'end' });
        await cmTest.click(result);
        await cmTest.eventually(() =>
            popup.getBoundingClientRect().bottom <= result.getBoundingClientRect().top);
        popup.dispatchEvent(new PointerEvent('pointerleave'));
        await new Promise(resolve => {
            setTimeout(resolve, 250);
        });
        expect(popup.matches(':popover-open')).toBeTrue();
        const scrollRegion = panel.resultsRegion;
        scrollRegion.style.maxHeight = '24px';
        scrollRegion.scrollTop = 0;
        await cmTest.eventually(() => !popup.matches(':popover-open'));
        scrollRegion.style.maxHeight = '';
        result.scrollIntoView({ block: 'end' });
        await cmTest.click(result);
        expect(popup.textContent).toContain('Ignore this occurrence');
        expect(popup.textContent).toContain('Replace with');
        const configure = [...popup.querySelectorAll('sl-button')].find(button =>
            button.textContent === 'Configure this inspection');
        expect(configure.variant).toBe('text');
        await cmTest.click(configure);
        expect(workspace.contentContainer.firstElementChild.tree.selectedId)
            .toBe('wording-enters-the-battlefield');
        expect(popup.matches(':popover-open')).toBeFalse();
        await cmTest.closeSettings();
        await cmTest.click(cardGroup);
        await cmTest.eventually(() => selectedProjectCard === flagged);
        const editorPopup = document.querySelector('cm-card-form cm-inspection-popup');
        expect(editorPopup.matches(':popover-open')).toBeFalse();
        expect(panel.hidden).toBeFalse();
        const token = await cmTest.eventually(() =>
            [...document.querySelectorAll('cm-code .inspection-highlight')]
                .find(mark => mark.textContent === 'Treasure'));
        expect(token.textContent).toBe('Treasure');
        expect(inspection.querySelector('.problem-card')).toBe(cardGroup);
        expect(cardGroup.selected).toBeTrue();
        const header = panel.querySelector('header');
        expect(getComputedStyle(header).borderBottomWidth).toBe('1px');
        const results = panel.querySelector('.problem-results');
        expect(getComputedStyle(results).overflowY).toBe('auto');
        await selectCard(other);
        const currentResult = inspection.querySelector('.problem-finding');
        await cmTest.click(currentResult);
        await cmTest.click(popup.firstAction);
        await cmTest.eventually(() =>
            selectedProjectCard === flagged
            && activeEditorCard.front.rulesText.startsWith('When this enters,'));
        await flushCard();
        split.position = 55;
        await cmTest.click(panel.querySelector('[data-click-action="toggleProblems"]'));
        expect(panel.hidden).toBeTrue();
        expect(split.position).toBe(100);
        await cmTest.click(toggle);
        expect(split.position).toBe(55);
        await cmTest.click(toggle);
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
           await cmTest.eventually(() =>
               editor.querySelectorAll('.hljs-unrecognized').length === 3);

           const workspace = await cmTest.openSettings();
           const settings = await selectSettingsTab(workspace, 'cm-mechanic-settings');
           const scan = settings.querySelector('[data-click-action="scan"]');
           expect(settings.querySelector('[type="submit"]')).toBeNull();
           expect(scan.textContent).toBe('Autodetect');
           await cmTest.click(scan);
           expect(settings.list.activeRow.data.name).toBe('Mistsong');
           expect(settings.list.activeRow.data.type).toBe('Keyword ability');
           const kind = settings.querySelector('form-field[field-id="kind"] sl-select');
           await expectTypeMenuAligned(kind);
           await cmTest.eventually(() =>
               editor.querySelectorAll('.hljs-unrecognized').length === 1);
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
           await undo();
           expect(selectedProjectCard.front.rulesText).toContain(`Mistsong (${variant})`);
           await redo();
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
           const currentEditor = currentRules.fieldElement.editor;
           await cmTest.eventually(() =>
               !currentEditor.querySelector('.hljs-unrecognized'));
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

    it('styles custom keyword tags after their mechanic color affinity', async () => {
        await createCard();
        const setClimbingTiers = tiers => {
            activeProject.customKeywords = [{ name: 'Climbing', tiers }];
            changed(activeProject, 'customKeywords');
        };
        setClimbingTiers({ R: 'primary', G: 'tertiary' });
        await setCardFields({ tags: ['gains-climbing'] }, { mode: CARD_PROPERTIES });
        const field = new FieldInteractor('tags', { mode: CARD_PROPERTIES }).fieldElement;
        const chip = () => [...field.tagsContainer.children]
            .find(tag => tag.textContent === 'gains-climbing');
        expect(chip().dataset.tagStyle).toBe('red');

        setClimbingTiers({ U: 'primary' });
        await cmTest.eventually(() => chip().dataset.tagStyle === 'blue');
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
            await restoreTagCatalog(originalTags);
            await cmTest.closeSettings();
        }
    });

    async function restoreTagCatalog(originalTags) {
        tagManager.collection = originalTags;
        changed(tagManager, 'tags');
        tagManager.scheduleSave();
        await tagManager.flush();
    }

    function typeTag(field, text) {
        field.textInput.value = text;
        field.textInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }

    it('adds only typed tags to the tag catalog', async () => {
        await createCard();
        const originalTags = structuredClone(tagManager.collection);
        try {
            await setCardFields({ tags: ['loaded-label'] }, { mode: CARD_PROPERTIES });
            expect(tagManager.find('loaded-label')).toBeUndefined();
            const matches = searchTags('loaded-label').map(tag => tag.text);
            expect(matches).toContain('loaded-label');

            const tags = new FieldInteractor('tags', { mode: CARD_PROPERTIES });
            const field = tags.fieldElement;
            typeTag(field, 'typed-label');
            typeTag(field, 'gains-flying');
            expect(field.appliedTags).toEqual(jasmine.arrayContaining([
                'loaded-label', 'typed-label', 'gains-flying'
            ]));
            expect(tagManager.find('typed-label')).toBeDefined();
            expect(tagManager.find('gains-flying')).toBeUndefined();
        } finally {
            await restoreTagCatalog(originalTags);
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
