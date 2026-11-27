import YAMLSerializer from '../domain/projects/serializers/YAMLSerializer.js';
import { selectSettingsTab } from '../shared/testing/steps/settings.js';
import {
    createTestProject, deleteTestProject, eventually
} from '../shared/testing/testUtils.js';

const SETTINGS_ID = 'cm-magic-inspection-settings';
const WHITE_TIER = 'cm-inspection-tiers [data-color="W"] sl-select';

async function selectInspection(settings, id) {
    const item = settings.querySelector(`[data-inspection-id="${id}"]`);
    await item.updateComplete;
    await cmTest.click(item.shadowRoot.querySelector('[part="label"]'));
    const inspection = activeGame.inspections.find(candidate => candidate.id === id);
    await eventually(() => settings.querySelector('h2').textContent === inspection.title);
    return inspection;
}

function changeValue(control, value) {
    control.value = value;
    control.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
}

describe('Inspections', () => {
    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => {
        await cmTest.closeSettings();
        await deleteTestProject();
    });

    it('selects a filtered inspection and saves its project overrides', async () => {
        const workspace = await cmTest.openSettings();
        const settings = await selectSettingsTab(workspace, SETTINGS_ID);
        const filter = settings.querySelector('sl-input');
        filter.value = 'removal';
        filter.dispatchEvent(new CustomEvent('sl-input'));
        expect(settings.querySelector('[data-inspection-id="draw-cards"]')).toBeNull();
        const inspection = await selectInspection(settings, 'destroy-creature');
        const item = settings.querySelector('[data-inspection-id="destroy-creature"]');
        expect(workspace.contentContainer.firstElementChild).toBe(settings);
        expect(settings.querySelector('cm-inspection-examples cm-card-preview'))
            .not.toBeNull();
        const enabled = settings.querySelector('sl-switch');
        enabled.checked = false;
        enabled.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
        const white = settings.querySelector(WHITE_TIER);
        expect(white.value).toBe(inspection.tiers.W);
        changeValue(white, 'primary');
        await cmTest.click(settings.querySelector(
            'cm-inspection-exceptions li[data-index="0"] button[data-color="W"]'));
        const exceptions = inspection.exceptions
            .map(({ condition, colors }) => ({ condition, colors }));
        exceptions[0].colors = ['W', ...exceptions[0].colors];

        expect(item.querySelector(':scope > sl-checkbox').checked).toBeFalse();

        const overrides = await eventually(async () => {
            const saved = await YAMLSerializer.load(activeProject.filePath);
            return saved.inspectionOverrides?.[inspection.id];
        });
        expect(overrides).toEqual({
            disabled: true,
            tiers: { W: 'primary' },
            exceptions
        });
    });

    it('drops overrides that match defaults and resets an inspection', async () => {
        const workspace = await cmTest.openSettings();
        const settings = await selectSettingsTab(workspace, SETTINGS_ID);
        const inspection = activeGame.inspections.find(item =>
            item.id === settings.querySelector('cm-inspection-tree').selectedId);
        const reset = settings.querySelector('[data-click-action="reset"]');
        const savedOverrides = async () =>
            (await YAMLSerializer.load(activeProject.filePath)).inspectionOverrides;
        expect(reset.disabled).toBeTrue();

        const white = settings.querySelector(WHITE_TIER);
        changeValue(white, inspection.tiers.W === 'none' ? 'primary' : 'none');
        expect(reset.disabled).toBeFalse();
        changeValue(white, inspection.tiers.W);
        expect(reset.disabled).toBeTrue();

        changeValue(white, inspection.tiers.W === 'none' ? 'primary' : 'none');
        const enabled = settings.querySelector('sl-switch');
        enabled.checked = false;
        enabled.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
        await eventually(async () => (await savedOverrides())?.[inspection.id]?.disabled);

        await cmTest.click(reset);
        const resetWhite = settings.querySelector(WHITE_TIER);
        expect(resetWhite.value).toBe(inspection.tiers.W);
        expect(settings.querySelector('sl-switch').checked).toBeTrue();
        const leaf = settings.querySelector(`[data-inspection-id="${inspection.id}"]`);
        expect(leaf.querySelector(':scope > sl-checkbox').checked).toBeTrue();
        await eventually(async () => !(await savedOverrides()));
    });

    it('adds a creature type exception and searches Scryfall', async () => {
        const workspace = await cmTest.openSettings();
        const settings = await selectSettingsTab(workspace, SETTINGS_ID);
        await selectInspection(settings, 'keyword-trample');
        spyOn(activeGame.platform, 'openUrl').and.resolveTo();
        await cmTest.click(settings.querySelector('[data-click-action="add"]'));
        const row = await eventually(() =>
            settings.querySelector('cm-inspection-exceptions li[data-index="1"]'));
        expect(row.querySelector('sl-select').value).toBe('creature-type');
        changeValue(row.querySelector('sl-input'), 'Dragon');
        await cmTest.click(row.querySelector('button[data-color="R"]'));
        const overrides = await eventually(async () => {
            const saved = await YAMLSerializer.load(activeProject.filePath);
            return saved.inspectionOverrides?.['keyword-trample']?.exceptions;
        });
        expect(overrides).toEqual([
            { condition: 'creature-type', subtype: 'Demon', colors: ['B'] },
            { condition: 'creature-type', subtype: 'Dragon', colors: ['R'] }
        ]);

        const red = settings.querySelector('cm-inspection-tiers [data-color="R"]');
        await cmTest.click(red.querySelector('[data-click-action="search"]'));
        expect(activeGame.platform.openUrl).toHaveBeenCalledWith(
            'https://scryfall.com/search?q=keyword%3A%22trample%22%20c%3Dr');
    });

    it('toggles tree checkboxes without changing the selection', async () => {
        const workspace = await cmTest.openSettings();
        const settings = await selectSettingsTab(workspace, SETTINGS_ID);
        const tree = settings.querySelector('cm-inspection-tree');
        const selectedId = tree.selectedId;
        const leaf = settings.querySelector('[data-inspection-id="destroy-creature"]');
        const group = leaf.closest('[data-group]');
        const checkboxOf = item => item.querySelector(':scope > sl-checkbox');
        const groupIds = tree.inspectionIdsIn(group);
        const savedOverrides = async () =>
            (await YAMLSerializer.load(activeProject.filePath)).inspectionOverrides;

        await cmTest.click(checkboxOf(leaf));
        expect(tree.selectedId).toBe(selectedId);
        expect(checkboxOf(group).indeterminate).toBeTrue();
        await eventually(async () =>
            (await savedOverrides())?.['destroy-creature']?.disabled);

        await cmTest.click(checkboxOf(group));
        expect(checkboxOf(leaf).checked).toBeTrue();
        await eventually(async () => !(await savedOverrides()));

        await cmTest.click(checkboxOf(group));
        expect(checkboxOf(group).checked).toBeFalse();
        const overrides = await eventually(savedOverrides);
        expect(Object.keys(overrides).sort()).toEqual([...groupIds].sort());
        expect(settings.querySelector('.inspection-heading sl-switch').checked)
            .toBe(!groupIds.includes(selectedId));
    });
});
