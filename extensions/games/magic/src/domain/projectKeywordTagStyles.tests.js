import { projectKeywordTagStyles } from './projectKeywordTagStyles.js';

describe('project keyword tag styles', () => {
    it('styles every keyword tag after the single primary color', () => {
        const styles = projectKeywordTagStyles([
            { name: 'Climbing', tiers: { R: 'primary', U: 'secondary', G: 'tertiary' } }
        ]);
        expect(styles.get('gains-climbing')).toBe('red');
        expect(styles.get('gives-climbing')).toBe('red');
        expect(styles.get('climbing-counter')).toBe('red');
    });

    it('uses neutral without exactly one primary color', () => {
        const styles = projectKeywordTagStyles([
            { name: 'Escort' },
            { name: 'Retreat', tiers: { W: 'primary', B: 'primary' } }
        ]);
        expect(styles.get('gains-escort')).toBe('neutral');
        expect(styles.get('gives-retreat')).toBe('neutral');
    });

    it('slugs multiword names and skips disabled keywords', () => {
        const styles = projectKeywordTagStyles([
            { name: 'Rally Cry', tiers: { W: 'primary' } },
            { name: 'Unused', tiers: { G: 'primary' }, disabled: true }
        ]);
        expect(styles.get('gains-rally-cry')).toBe('ivory');
        expect(styles.has('gains-unused')).toBeFalse();
    });
});
