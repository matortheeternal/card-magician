import {
    GameExtension, ExporterExtension, CardPartExtension, TemplateExtension
} from '../../../domain/extensions/extensionClasses.js';
import { openModal, getActiveModal, closeModal } from '../modalManager.js';

export function registerInstallPackageTests() {
    describe('Install package', () => {
        function extension(Type, id, version, installedVersion = null) {
            const result = new Type(`package/${id}/${Type.metadataFile}`, {
                id, name: `<${id}>`, version
            });
            result.installedVersion = installedVersion;
            return result;
        }

        afterEach(() => closeModal());

        it('shows version tooltips and disables unavailable choices', () => {
            openModal('cm-install-package-modal', { extensions: [
                extension(GameExtension, 'new', '1.0'),
                extension(GameExtension, 'upgrade', '2.0', '1.0'),
                extension(GameExtension, 'old', '1.0', '2.0'),
                extension(ExporterExtension, 'same', '1.0', '1.0')
            ] });
            const modal = getActiveModal();
            const checkboxes = modal.extensionCheckboxes;
            expect(checkboxes.map(box => box.disabled))
                .toEqual([false, true, false, true]);
            expect(modal.selectedExtensions.length).toBe(2);
            expect(modal.installButton.textContent).toBe('Install selected (2)');
            expect(modal.summary.textContent).toContain('Selected to install: 2');
            for (const label of ['New: 1', 'Updated: 1', 'Outdated: 1', 'Installed: 1'])
                expect(modal.summary.textContent).toContain(label);
            expect(modal.textContent).not.toContain('Installed version:');
            const rows = [...modal.extensionList.querySelectorAll('article')];
            expect(rows[0].title).toContain('Version 1.0');
            expect(rows[0].title).not.toContain('Installed version:');
            expect(rows[2].title).toContain('Version 2.0');
            expect(rows[2].title).toContain('Installed version: 1.0');
            expect(rows[2].querySelector('sl-checkbox').getAttribute('aria-description'))
                .toBe(rows[2].title);
            expect(rows[2].querySelector('sl-badge').textContent).toBe('Updated');
            expect(modal.querySelector('sl-badge[variant="success"]').textContent)
                .toBe('New');
            expect(modal.querySelector('sl-badge[variant="danger"]').textContent)
                .toBe('Outdated');
            expect(modal.extensionList.querySelector('strong').textContent).toBe('<new>');
            expect(modal.extensionList.querySelector('strong').children.length).toBe(0);
        });

        it('installs only selected extensions and reports completion', async () => {
            const first = extension(GameExtension, 'first', '1.0');
            const second = extension(GameExtension, 'second', '1.0');
            const install = spyOn(first, 'install').and.callFake(async () => {
                first.installedVersion = '1.0';
            });
            const skipped = spyOn(second, 'install');
            openModal('cm-install-package-modal', { extensions: [first, second] });
            const modal = getActiveModal();
            modal.extensionCheckboxes[1].checked = false;
            await modal.install();
            expect(install).toHaveBeenCalledTimes(1);
            expect(skipped).not.toHaveBeenCalled();
            expect(modal.statusMessage.textContent).toContain('Installation complete');
            expect(modal.extensionCheckboxes[0].disabled).toBeTrue();
        });

        it('scrolls the list while keeping the summary and actions visible', async () => {
            const extensions = Array.from({ length: 100 }, (_, index) => {
                return extension(GameExtension, `extension-${index}`, '1.0');
            });
            openModal('cm-install-package-modal', { extensions });
            const modal = getActiveModal();
            await Promise.all(modal.extensionCheckboxes.map(box => box.updateComplete));
            await new Promise(requestAnimationFrame);
            const list = modal.extensionList;
            const summaryTop = modal.summary.getBoundingClientRect().top;
            const actionsTop = modal.installButton.getBoundingClientRect().top;
            expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
            expect(getComputedStyle(list).overflowY).toBe('auto');
            const row = list.querySelector('article');
            const checkbox = row.querySelector('sl-checkbox').getBoundingClientRect();
            const badge = row.querySelector('sl-badge').getBoundingClientRect();
            expect(Math.abs(checkbox.top - badge.top)).toBeLessThan(10);
            list.scrollTop = list.scrollHeight;
            expect(list.scrollTop).toBeGreaterThan(0);
            const heading = list.querySelector('h3').getBoundingClientRect();
            expect(Math.abs(heading.top - list.getBoundingClientRect().top))
                .toBeLessThan(2);
            expect(modal.summary.getBoundingClientRect().top).toBe(summaryTop);
            expect(modal.installButton.getBoundingClientRect().top).toBe(actionsTop);
            expect(actionsTop).toBeLessThan(window.innerHeight);
            expect(summaryTop).toBeGreaterThanOrEqual(0);
        });

        it('groups by type while retaining the original install selection', () => {
            const exporter = extension(ExporterExtension, 'exporter', '1.0');
            const game = extension(GameExtension, 'game', '1.0');
            openModal('cm-install-package-modal', { extensions: [
                exporter,
                extension(TemplateExtension, 'template', '1.0'),
                extension(CardPartExtension, 'part', '1.0'),
                game
            ] });
            const modal = getActiveModal();
            const headings = [...modal.extensionList.querySelectorAll('h3')];
            expect(headings.map(heading => heading.textContent))
                .toEqual(['Games', 'Cardparts', 'Templates', 'Exporters']);
            for (const checkbox of modal.extensionCheckboxes) checkbox.checked = false;
            modal.extensionCheckboxes[0].checked = true;
            expect(modal.selectedExtensions).toEqual([game]);
            expect(modal.textContent).not.toContain('Select the extensions to install.');
            expect(modal.textContent).not.toContain('Reload the application');
        });

        it('sorts names naturally and preserves choices while filtering', async () => {
            const part10 = extension(CardPartExtension, 'Part10', '1.0');
            const part2 = extension(CardPartExtension, 'Part2', '1.0');
            const old = extension(GameExtension, 'Old game', '1.0', '2.0');
            openModal('cm-install-package-modal', {
                extensions: [part10, old, part2]
            });
            const modal = getActiveModal();
            const names = [...modal.extensionList.querySelectorAll('strong')];
            expect(names.map(name => name.textContent))
                .toEqual(['<Old game>', '<Part2>', '<Part10>']);
            modal.extensionCheckboxes[1].checked = false;
            modal.availabilityFilter.checked = true;
            modal.availabilityFilter.dispatchEvent(new CustomEvent('sl-change', {
                bubbles: true
            }));
            const group = modal.extensionList.querySelector('section');
            expect(getComputedStyle(group).display).toBe('none');
            expect(modal.selectedExtensions).toEqual([part10]);
            expect(modal.installButton.textContent).toBe('Install selected (1)');
            modal.availabilityFilter.checked = false;
            modal.availabilityFilter.dispatchEvent(new CustomEvent('sl-change', {
                bubbles: true
            }));
            expect(getComputedStyle(group).display).not.toBe('none');
            expect(modal.extensionCheckboxes[1].checked).toBeFalse();
        });

        it('explains an empty filtered list', () => {
            openModal('cm-install-package-modal', { extensions: [
                extension(GameExtension, 'Old game', '1.0', '2.0')
            ] });
            const modal = getActiveModal();
            modal.availabilityFilter.checked = true;
            modal.availabilityFilter.dispatchEvent(new CustomEvent('sl-change', {
                bubbles: true
            }));
            const message = modal.extensionList.querySelector('p');
            expect(message.textContent).toBe('No extensions are available to install.');
            expect(getComputedStyle(message).display).not.toBe('none');
            expect(modal.installButton.disabled).toBeTrue();
        });

        it('disables installation for empty packages and empty selections', () => {
            openModal('cm-install-package-modal', { extensions: [] });
            expect(getActiveModal().installButton.disabled).toBeTrue();
            expect(getActiveModal().textContent)
                .toContain('This package contains no extensions.');
            openModal('cm-install-package-modal', {
                extensions: [extension(GameExtension, 'new', '1.0')]
            });
            const modal = getActiveModal();
            modal.extensionCheckboxes[0].checked = false;
            modal.extensionCheckboxes[0].dispatchEvent(new CustomEvent('sl-change', {
                bubbles: true
            }));
            expect(modal.installButton.disabled).toBeTrue();
            expect(modal.summary.textContent).toContain('Selected to install: 0');
        });
    });
}
