describe('Startup', () => {
    it('loads the application UI', () => {
        expect(document.querySelector('cm-title-bar')).not.toBeNull();
        expect(document.querySelector('cm-display-card')).not.toBeNull();
        expect(document.querySelector('cm-card-list')).not.toBeNull();
        expect(document.querySelector('cm-card-form')).not.toBeNull();
        expect(document.querySelector('cm-mobile-actions')).not.toBeNull();
    });
});
