describe('Modals', () => {
    let modal;

    afterEach(async () => {
        await cmTest.closeSettings();
    });

    it('opens Settings from File above the editor and closes through its control', async () => {
        modal = await cmTest.openSettings();

        const container = document.querySelector('.modal-container');
        expect(modal.parentElement).toBe(container);
        const style = getComputedStyle(container);
        expect(style.position).toBe('absolute');
        expect(style.display).toBe('flex');
        const bounds = container.getBoundingClientRect();
        expect(bounds.top).toBe(0);
        expect(bounds.left).toBe(0);
        expect(bounds.width).toBe(window.innerWidth);
        expect(bounds.height).toBe(window.innerHeight);
        const panel = modal.querySelector('.modal').getBoundingClientRect();
        expect(document.elementFromPoint(
            panel.left + panel.width / 2, panel.top + 10
        )?.closest('cm-settings-modal')).toBe(modal);

        await cmTest.closeSettings();
        expect(getComputedStyle(container).display).toBe('none');
    });
});
