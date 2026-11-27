import YAMLSerializer from '../domain/projects/serializers/YAMLSerializer.js';
import { selectSettingsTab } from '../shared/testing/steps/settings.js';
import {
    createTestProject, deleteTestProject, eventually
} from '../shared/testing/testUtils.js';

const SETTINGS_ID = 'cm-magic-inspection-settings';

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
        const item = settings.querySelector('[data-inspection-id="destroy-creature"]');
        await item.updateComplete;
        await cmTest.click(item.shadowRoot.querySelector('[part="label"]'));
        const inspection = activeGame.inspections.find(item =>
            item.id === 'destroy-creature');
        await eventually(() =>
            settings.querySelector('h2').textContent === inspection.title);
        expect(workspace.contentContainer.firstElementChild).toBe(settings);
        expect(settings.querySelector('.inspection-examples sl-card')).not.toBeNull();
        const enabled = settings.querySelector('sl-switch');
        enabled.checked = false;
        enabled.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
        changeValue(settings.querySelector('sl-select'), 'primary');
        changeValue(settings.querySelector('sl-details sl-select'), 'secondary');

        expect(item.querySelector(':scope > sl-checkbox').checked).toBeFalse();

        const overrides = await eventually(async () => {
            const saved = await YAMLSerializer.load(activeProject.filePath);
            return saved.inspectionOverrides?.[inspection.id];
        });
        expect(overrides).toEqual({
            disabled: true,
            tiers: { W: 'primary' },
            exceptions: { [inspection.exceptions[0].id]: { W: 'secondary' } }
        });
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
